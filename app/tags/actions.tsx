"use server"
import "server-only"

import { createClient } from "@/utils/supabase/server"
import { SupabaseTag } from "@/types/supabase"

export async function getTags() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .select()
        .order('name', { ascending: true })
    return { data, error }
}

export async function getTag(id: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .select()
        .eq('id', id)
    return { data, error }
}

export async function getTagsByGroup(group: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .select()
        .eq('group', group)
        .order('name', { ascending: true })
    return { data, error }
}

export async function deleteTag(id: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .throwOnError()
    return { data, error }
}

export async function createTag(tag: Partial<SupabaseTag>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .insert(tag)
        .select('*').single()
    return { data, error }
}

export async function upsertTag(tag: Partial<SupabaseTag>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .upsert(tag)
        .select('*').single()
    return { data, error }
}