'use client';

import React, { Dispatch, SetStateAction } from 'react';
import MultipleSelector from '@/components/ui/multiple-selector';
import { SelectedTagsProps } from './drag-drop';
import { useTags } from '@/lib/hooks/use-tags';
import { SupabaseTag } from '@/types/supabase';
import { UseFormReturn } from 'react-hook-form';
import { AgentSchema } from './agent-dialog';

const TagSelector = ({ selectedTags, setSelectedTags, forFile, form }: { selectedTags: SelectedTagsProps, setSelectedTags: Dispatch<SetStateAction<SelectedTagsProps>>, forFile: string, form?: UseFormReturn<AgentSchema> }) => {
    const [isTriggered, setIsTriggered] = React.useState(false);
    const { tags } = useTags();

    const validatedForFile = forFile ?? 'agent';

    const mockSearch = async (value: string): Promise<SupabaseTag[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const res = tags.filter((tag) => tag.name.toLowerCase().includes(value.toLowerCase()));
                resolve(res);
            }, 0);
        });
    };

    return (
        <div className="flex w-full flex-col gap-5">
            <MultipleSelector
                form={form}
                onSearch={async (value) => {
                    setIsTriggered(true);
                    const res = await mockSearch(value);
                    setIsTriggered(false);
                    return res;
                }}
                selected={selectedTags}
                setSelected={setSelectedTags}
                forFile={validatedForFile}
                defaultOptions={[]}
                creatable
                groupBy="group"
                placeholder="Add tags..."
                loadingIndicator={
                    <p className="py-2 text-center text-lg leading-10 text-muted-foreground">loading...</p>
                }
                emptyIndicator={
                    <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                        no results found.
                    </p>
                }
            />
        </div>
    );
};

export default TagSelector;
