"use server"
import "server-only"

import { createClient } from "@/utils/supabase/server"
import { Tag } from "@/lib/supabase"

export async function getTags() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .select()
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
    return { data, error }
}

export async function deleteTag(id: number) {
    const supabase = createClient()
    const { data } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .throwOnError()
    return { data }
}


export async function createTag(tag: Tag) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tags')
        .insert(tag)
    return { data, error }
}