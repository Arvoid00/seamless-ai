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

    useEffect(() => {
        const getSelectedAgent = async () => {
            if (!agentName || agentName === "chat") {
                setAgent(null)
                return
            }
            const { data, error } = await getAgentByName(agentName)

            if (error) {
                toast.error("No agent found with that name.")
                return
            }
            const agent = data as SupabaseAgent
            setAgent(agent)
        }
        getSelectedAgent()
    }, [pathName]);

    return (
        <TagsContext.Provider value={{ agent, setAgent }}>
            {children}
        </TagsContext.Provider>
    );
}
