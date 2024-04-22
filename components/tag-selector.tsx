'use client';
import React, { Dispatch, SetStateAction } from 'react';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { SelectedTagsProps } from './drag-drop';

const OPTIONS: Option[] = [
    { label: 'NextJS', value: 'nextjs', group: 'Programming' },
    { label: 'Programming', value: 'programming', group: 'Programming' },
    { label: 'React', value: 'react', group: 'Programming' },
    { label: 'shadcn-ui', value: 'shadcn-ui', group: 'Styling' },
    { label: 'styling', value: 'styling', group: 'Styling' },
    { label: 'Neural Networks', value: 'neural-nets', group: 'Data Science' },
    { label: 'Data Science', value: 'data-science', group: 'Data Science' },
];

const mockSearch = async (value: string): Promise<Option[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const res = OPTIONS.filter((option) => option.label.toLowerCase().includes(value.toLowerCase()));
            resolve(res);
        }, 0);
    });
};

const TagSelector = ({ selectedTags, setSelectedTags, forFile }: { selectedTags: SelectedTagsProps, setSelectedTags: Dispatch<SetStateAction<SelectedTagsProps>>, forFile: string }) => {
    const [isTriggered, setIsTriggered] = React.useState(false);

    return (
        <div className="flex w-full flex-col gap-5">
            <MultipleSelector
                onSearch={async (value) => {
                    setIsTriggered(true);
                    const res = await mockSearch(value);
                    setIsTriggered(false);
                    return res;
                }}
                selected={selectedTags}
                setSelected={setSelectedTags}
                forFile={forFile}
                defaultOptions={[]}
                creatable
                groupBy="group"
                placeholder="Add category"
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
