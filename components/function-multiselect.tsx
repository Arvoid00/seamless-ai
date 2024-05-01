"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Edit2 } from "lucide-react";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { AgentSchema } from "./agent-dialog";
import { UseFormReturn } from "react-hook-form";

// FIXME: https://twitter.com/lemcii/status/1659649371162419202?s=46&t=gqNnMIjMWXiG2Rbrr5gT6g
// Removing states would help maybe?

const ALL_FUNCTIONS = ["Web search", "Document Search", "CCCCCCCCCCCCCCC", "DDDDDDDDDDDDD"]
type Function = string

export function FunctionMultiSelect({ currentItems, form }: { currentItems: Function[], form: UseFormReturn<AgentSchema> }) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [inputValue, setInputValue] = React.useState<string>("");
    const [selectedValues, setSelectedValues] = React.useState<Function[]>(currentItems ?? []);

    const toggleFunction = (functionName: Function) => {
        setSelectedValues((currentFunctions) => {
            const updatedFunctions = !currentFunctions.includes(functionName)
                ? [...currentFunctions, functionName]
                : currentFunctions.filter((l) => l !== functionName);

            // Schedule the form update to happen after rendering
            setTimeout(() => form.setValue("functions", JSON.stringify(updatedFunctions)), 0);
            return updatedFunctions;
        });
        inputRef?.current?.focus();
    };

    const onComboboxOpenChange = (value: boolean) => {
        inputRef.current?.blur(); // HACK: otherwise, would scroll automatically to the bottom of page
        setOpenCombobox(value);
    };

    return (
        <FormField
            control={form.control}
            name="functions"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Functions</FormLabel>
                    <FormControl    >
                        <div className="w-full">
                            <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between text-foreground"
                                    >
                                        <span className="truncate">
                                            {selectedValues.length === 0 && "Select functions"}
                                            {selectedValues.length === 1 && selectedValues[0]}
                                            {selectedValues.length === 2 && selectedValues.join(", ")}
                                            {selectedValues.length > 2 && `${selectedValues.length} functions selected`}
                                        </span>
                                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="max-w-[500px] p-0">
                                    <Command>
                                        <CommandList>
                                            <CommandInput
                                                ref={inputRef}
                                                placeholder="Search functions..."
                                                value={inputValue}
                                                onValueChange={setInputValue}
                                            />
                                            <CommandGroup className="max-h-[145px] overflow-auto">
                                                {ALL_FUNCTIONS.map((functionName) => {
                                                    const isActive = selectedValues.includes(functionName);
                                                    return (
                                                        <CommandItem
                                                            key={functionName}
                                                            value={functionName}
                                                            onSelect={() => toggleFunction(functionName)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 size-4",
                                                                    isActive ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex-1">{functionName}</div>
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </FormControl>
                    <FormDescription>The abilities the agent will have.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />

    );
}
