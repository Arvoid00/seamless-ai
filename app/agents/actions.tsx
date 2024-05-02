"use server"
import "server-only"

import { createClient } from "@/utils/supabase/server"
import { SupabaseAgent } from "@/types/supabase"

export async function getAgents() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .select()
        .order('name', { ascending: true })
        .throwOnError()
    return { data, error }
}

export async function getAgentById(id: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .select()
        .eq('id', id)
        .single()
        .throwOnError()
    return { data, error }
}

export async function getAgentByName(name: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .select()
        .eq('name', name)
        .maybeSingle()
        .throwOnError()
    return { data, error }
}

export async function getAgentsByGroup(group: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .select()
        .eq('group', group)
        .order('name', { ascending: true })
        .throwOnError()
    return { data, error }
}

export async function deleteAgent(id: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id)
        .throwOnError()
    return { data, error }
}

export async function createAgent(tag: Partial<SupabaseAgent>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .insert(tag)
        .select('*')
        .single()
    return { data, error }
}

export async function upsertAgent(tag: Partial<SupabaseAgent>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('agents')
        .upsert(tag)
        .select('*')
        .single()
    return { data, error }
}