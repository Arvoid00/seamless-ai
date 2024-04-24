"use client"

import { getTags } from '@/app/tags/actions';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SupabaseTag } from '../supabase';

export const badgeStyle = (color: string) => ({
    borderColor: `${color}20`,
    backgroundColor: `${color}30`,
    color,
});

export const TAG_COLORS = [
    "#ef4444",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
]

export const pickRandomColor = () => {
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

interface TagsContextType {
    tags: SupabaseTag[];
    setTags: React.Dispatch<React.SetStateAction<SupabaseTag[]>>;
    selectedTags: SupabaseTag[];
    setSelectedTags: React.Dispatch<React.SetStateAction<SupabaseTag[]>>;

}

const defaultState: TagsContextType = {
    tags: [],
    setTags: () => { },
    selectedTags: [],
    setSelectedTags: () => { },
};

const TagsContext = createContext<TagsContextType>(defaultState);

export function useTags() {
    const context = useContext(TagsContext);
    if (!context) {
        throw new Error('useTags must be used within a TagsProvider');
    }
    return context;
}

export function TagsProvider({ children }: { children: React.ReactNode }) {
    const [tags, setTags] = useState<SupabaseTag[]>([]);
    const [selectedTags, setSelectedTags] = useState<SupabaseTag[]>([]);

    useEffect(() => {
        const getTagsData = async () => {
            const { data, error } = await getTags()
            if (error) {
                toast.error("Failed to fetch tags")
            }
            const tags = data as SupabaseTag[]
            setTags(tags)
        }
        getTagsData()
    }, []);

    return (
        <TagsContext.Provider value={{ tags, setTags, selectedTags, setSelectedTags }}>
            {children}
        </TagsContext.Provider>
    );
}
