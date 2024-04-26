"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SupabaseAgent } from '@/types/supabase';
import { getAgentByName } from '@/app/agents/actions';
import { usePathname } from 'next/navigation';


interface AgentContextType {
    agent: SupabaseAgent | null;
    setAgent: React.Dispatch<React.SetStateAction<SupabaseAgent | null>>;
}

// const defaultState: AgentContextType = {
//     agent: {} || null,
//     setAgent: () => { },
//     selectedTags: [],
//     setSelectedTags: () => { },
// };

const TagsContext = createContext<AgentContextType>({ agent: null, setAgent: () => { } });

export function useAgent() {
    const context = useContext(TagsContext);
    if (!context) {
        throw new Error('useAgent must be used within a AgentProvider');
    }
    return context;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
    const [agent, setAgent] = useState<SupabaseAgent | null>(null);
    const pathName = usePathname()
    const agentName = pathName.split("/")[1]
    console.log(agentName);


    useEffect(() => {
        const getDefaultAgent = async () => {
            const { data, error } = await getAgentByName(agentName)
            if (error) {
                toast.error("Failed to fetch agent, providing default agent.")
                const { data, error } = await getAgentByName('default')
                if (error) {
                    throw new Error("Failed to fetch default agent.")
                }
                const agent = data as SupabaseAgent
                setAgent(agent)
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
