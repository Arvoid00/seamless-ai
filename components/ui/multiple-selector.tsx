'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { useEffect, forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { capitalizeFirstLetter, cn } from '@/lib/utils';
import { SelectedTagsProps } from '../drag-drop';
import { SupabaseTag } from '@/lib/supabase';
import { badgeStyle, pickRandomColor } from '@/lib/hooks/use-tags';
import { createTag } from '@/app/tags/actions';
import { toast } from 'sonner';

interface GroupOption {
    [key: string]: SupabaseTag[];
}

interface MultipleSelectorProps {
    value?: SupabaseTag[];
    defaultOptions?: SupabaseTag[];
    /** manually controlled options */
    options?: SupabaseTag[];
    placeholder?: string;
    /** Loading component. */
    loadingIndicator?: React.ReactNode;
    /** Empty component. */
    emptyIndicator?: React.ReactNode;
    /** Debounce time for async search. Only work with `onSearch`. */
    delay?: number;
    /**
     * Only work with `onSearch` prop. Trigger search when `onFocus`.
     * For example, when user click on the input, it will trigger the search to get initial options.
     **/
    triggerSearchOnFocus?: boolean;
    /** async search */
    onSearch?: (value: string) => Promise<SupabaseTag[]>;
    onChange?: (options: SupabaseTag[]) => void;
    /** Limit the maximum number of selected options. */
    maxSelected?: number;
    /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
    onMaxSelected?: (maxLimit: number) => void;
    /** Hide the placeholder when there are options selected. */
    hidePlaceholderWhenSelected?: boolean;
    disabled?: boolean;
    /** Group the options base on provided key. */
    groupBy?: string;
    className?: string;
    badgeClassName?: string;
    /**
     * First item selected is a default behavior by cmdk. That is why the default is true.
     * This is a workaround solution by add a dummy item.
     *
     * @reference: https://github.com/pacocoursey/cmdk/issues/171
     */
    selectFirstItem?: boolean;
    /** Allow user to create option when there is no option matched. */
    creatable?: boolean;
    /** Props of `Command` */
    commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
    /** Props of `CommandInput` */
    inputProps?: Omit<
        React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
        'value' | 'placeholder' | 'disabled'
    >;
    selected: SelectedTagsProps;
    setSelected: React.Dispatch<React.SetStateAction<SelectedTagsProps>>;
    forFile: string;
}

export interface MultipleSelectorRef {
    selectedValue: SupabaseTag[];
    input: HTMLInputElement;
}

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

function transToGroupOption(options: SupabaseTag[], groupBy?: string) {
    if (options.length === 0) {
        return {};
    }
    if (!groupBy) {
        return {
            '': options,
        };
    }

    const groupOption: GroupOption = {};
    options.forEach((option) => {
        const key = (option[groupBy as keyof SupabaseTag] as string) || '';
        if (!groupOption[key]) {
            groupOption[key] = [];
        }
        groupOption[key].push(option);
    });
    return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: SupabaseTag[]) {
    const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

    for (const [key, value] of Object.entries(cloneOption)) {
        cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value));
        if (cloneOption[key].length === 0) {
            delete cloneOption[key]; // Remove the group if all its options are picked
        }
    }
    return cloneOption;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty = forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
    const render = useCommandState((state) => state.filtered.count === 0);

    if (!render) return null;

    return (
        <div
            ref={forwardedRef}
            className={cn('py-6 text-center text-sm', className)}
            cmdk-empty=""
            role="presentation"
            {...props}
        />
    );
});

CommandEmpty.displayName = 'CommandEmpty';

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
    (
        {
            value,
            onChange,
            placeholder,
            defaultOptions: arrayDefaultOptions = [],
            options: arrayOptions,
            delay,
            onSearch,
            loadingIndicator,
            emptyIndicator,
            maxSelected = Number.MAX_SAFE_INTEGER,
            onMaxSelected,
            hidePlaceholderWhenSelected,
            disabled,
            groupBy,
            className,
            badgeClassName,
            selectFirstItem = true,
            creatable = false,
            triggerSearchOnFocus = false,
            commandProps,
            inputProps,
            selected,
            setSelected,
            forFile,
        }: MultipleSelectorProps,
        ref: React.Ref<MultipleSelectorRef>,
    ) => {
        const inputRef = React.useRef<HTMLInputElement>(null);
        const [open, setOpen] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);

        const [options, setOptions] = React.useState<GroupOption>(
            transToGroupOption(arrayDefaultOptions, groupBy),
        );
        const [inputValue, setInputValue] = React.useState('');
        const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

        const currentFileTags = selected[forFile] ?? [];

        React.useImperativeHandle(
            ref,
            () => ({
                selectedValue: [...currentFileTags],
                input: inputRef.current as HTMLInputElement,
            }),
            [selected],
        );

        const handleUnselect = React.useCallback(
            (option: SupabaseTag) => {
                const newOptions = currentFileTags.filter((s) => s.value !== option.value);
                setSelected({ ...selected, [forFile]: newOptions });
                onChange?.(newOptions);
            },
            [onChange, selected],
        );

        const handleKeyDown = React.useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                const input = inputRef.current;
                if (input) {
                    if (e.key === 'Delete' || e.key === 'Backspace') {
                        if (input.value === '' && currentFileTags.length > 0) {
                            handleUnselect(currentFileTags[currentFileTags.length - 1]);
                        }
                    }
                    // This is not a default behaviour of the <input /> field
                    if (e.key === 'Escape') {
                        input.blur();
                    }
                }
            },
            [handleUnselect, selected],
        );

        useEffect(() => {
            if (value) {
                setSelected({ ...selected, [forFile]: value });
            }
        }, [value]);

        useEffect(() => {
            /** If `onSearch` is provided, do not trigger options updated. */
            if (!arrayOptions || onSearch) {
                return;
            }
            const newOption = transToGroupOption(arrayOptions || [], groupBy);
            if (JSON.stringify(newOption) !== JSON.stringify(options)) {
                setOptions(newOption);
            }
        }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

        useEffect(() => {
            const doSearch = async () => {
                setIsLoading(true);
                const res = await onSearch?.(debouncedSearchTerm);
                setOptions(transToGroupOption(res || [], groupBy));
                setIsLoading(false);
            };

            const exec = async () => {
                if (!onSearch || !open) return;

                if (triggerSearchOnFocus) {
                    await doSearch();
                }

                if (debouncedSearchTerm) {
                    await doSearch();
                }
            };

            void exec();
        }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

        const CreatableItem = () => {
            if (!creatable) return undefined;

            const Item = (
                <CommandItem
                    value={inputValue}
                    className="cursor-pointer"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onSelect={async (value: string) => {
                        if (currentFileTags.length >= maxSelected) {
                            onMaxSelected?.(currentFileTags.length);
                            return;
                        }
                        setInputValue('');
                        const newOption = {
                            name: capitalizeFirstLetter(value),
                            value: value.replace(/\s+/g, '-').toLowerCase(),
                            group: capitalizeFirstLetter(prompt('Provide group for tag') || ''),
                            color: pickRandomColor(),
                        }
                        const { data, error } = await createTag(newOption)
                        if (error) {
                            toast.error('Error creating tag:', { description: error.message })
                            return
                        }
                        const newOptions = [...currentFileTags, data];
                        setSelected({ ...selected, [forFile]: newOptions });
                        onChange?.(data);
                    }}
                >{`Create "${inputValue}"`}</CommandItem>
            );

            // For normal creatable
            if (!onSearch && inputValue.length > 0) {
                return Item;
            }

            // For async search creatable. avoid showing creatable item before loading at first.
            if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
                return Item;
            }

            return undefined;
        };

        const EmptyItem = React.useCallback(() => {
            if (!emptyIndicator) return undefined;

            // For async search that showing emptyIndicator
            if (onSearch && !creatable && Object.keys(options).length === 0) {
                return (
                    <CommandItem value="-" disabled>
                        {emptyIndicator}
                    </CommandItem>
                );
            }

            return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
        }, [creatable, emptyIndicator, onSearch, options]);

        const selectables = React.useMemo<GroupOption>(
            () => removePickedOption(options, currentFileTags),
            [options, selected],
        );

        /** Avoid Creatable Selector freezing or lagging when paste a long string. */
        const commandFilter = React.useCallback(() => {
            if (commandProps?.filter) {
                return commandProps.filter;
            }

            if (creatable) {
                return (value: string, search: string) => {
                    return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
                };
            }
            // Using default filter in `cmdk`. We don't have to provide it.
            return undefined;
        }, [creatable, commandProps?.filter]);

        return (
            <Command
                {...commandProps}
                onKeyDown={(e) => {
                    handleKeyDown(e);
                    commandProps?.onKeyDown?.(e);
                }}
                className={cn('overflow-visible bg-transparent', commandProps?.className)}
                shouldFilter={
                    commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch
                } // When onSearch is provided, we don't want to filter the options. You can still override it.
                filter={commandFilter()}
            >
                <div
                    className={cn(
                        'group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                        className,
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {currentFileTags.map((option) => {
                            return (
                                // <Badge
                                //     key={option.value}
                                //     className={cn(
                                //         'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                                //         'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                                //         badgeClassName,
                                //     )}
                                //     // data-fixed={option.fixed}
                                //     data-disabled={disabled}
                                // >
                                <Badge
                                    key={option.value}
                                    variant="outline"
                                    style={badgeStyle(option.color)}
                                    className="mr-1 capitalize"
                                >
                                    {option.name}
                                    <button
                                        className={cn(
                                            'ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                            // (disabled || option.fixed) && 'hidden',
                                        )}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUnselect(option);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => handleUnselect(option)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            );
                        })}
                        {/* Avoid having the "Search" Icon */}
                        <CommandPrimitive.Input
                            {...inputProps}
                            ref={inputRef}
                            value={inputValue}
                            disabled={disabled}
                            onValueChange={(value) => {
                                setInputValue(value);
                                inputProps?.onValueChange?.(value);
                            }}
                            onBlur={(event) => {
                                setOpen(false);
                                inputProps?.onBlur?.(event);
                            }}
                            onFocus={(event) => {
                                setOpen(true);
                                triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                                inputProps?.onFocus?.(event);
                            }}
                            placeholder={hidePlaceholderWhenSelected && currentFileTags.length !== 0 ? '' : placeholder}
                            className={cn(
                                'ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
                                inputProps?.className,
                            )}
                        />
                    </div>
                </div>
                <div className="relative mt-2">
                    {open && (
                        <CommandList className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                            {isLoading ? (
                                <>{loadingIndicator}</>
                            ) : (
                                <>
                                    {EmptyItem()}
                                    {CreatableItem()}
                                    {!selectFirstItem && <CommandItem value="-" className="hidden" />}
                                    {Object.entries(selectables).map(([key, dropdowns]) => (
                                        <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                                            <>
                                                {dropdowns.map((option) => {
                                                    return (
                                                        <CommandItem
                                                            key={option.value}
                                                            value={option.value}
                                                            // disabled={option.disable}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onSelect={() => {
                                                                if (currentFileTags.length >= maxSelected) {
                                                                    onMaxSelected?.(currentFileTags.length);
                                                                    return;
                                                                }
                                                                setInputValue('');
                                                                const newOptions = [...currentFileTags, option];
                                                                setSelected({ ...selected, [forFile]: newOptions });
                                                                onChange?.(newOptions);

                                                            }}
                                                            className={cn(
                                                                'cursor-pointer',
                                                                // option.disable && 'cursor-default text-muted-foreground',
                                                            )}
                                                        >
                                                            <Badge
                                                                key={option.value}
                                                                variant="outline"
                                                                style={badgeStyle(option.color)}
                                                            >
                                                                {option.name}
                                                            </Badge>
                                                        </CommandItem>
                                                    );
                                                })}
                                            </>
                                        </CommandGroup>
                                    ))}
                                </>
                            )}
                        </CommandList>
                    )}
                </div>
            </Command>
        );
    },
);

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;
