"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SupabaseAgent } from '@/types/supabase';
import { getAgentByName } from '@/app/agents/actions';


interface AgentContextType {
    agent: SupabaseAgent | null;
    setAgent: React.Dispatch<React.SetStateAction<SupabaseAgent>>;
}

// const defaultState: AgentContextType = {
//     agent: {} || null,
//     setAgent: () => { },
//     selectedTags: [],
//     setSelectedTags: () => { },
// };

const TagsContext = createContext<AgentContextType>();

export function useAgent() {
    const context = useContext(TagsContext);
    if (!context) {
        throw new Error('useAgent must be used within a AgentProvider');
    }
    return context;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
    const [agent, setAgent] = useState<SupabaseAgent>(null);

    useEffect(() => {
        const getDefaultAgent = async () => {
            const { data, error } = await getAgentByName("default")
            if (error) {
                toast.error("Failed to fetch agent")
            }
            const agent = data as SupabaseAgent
            setAgent(agent)
        }
        getDefaultAgent()
    }, []);

    return (
        <TagsContext.Provider value={{ agent, setAgent }}>
            {children}
        </TagsContext.Provider>
    );
}
