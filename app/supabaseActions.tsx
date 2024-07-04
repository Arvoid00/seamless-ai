"use server"
import "server-only"

import { createClient } from "@/utils/supabase/server";
import { MBCharacteristics } from "@/components/MBForm";

export async function getMBCharacteristics() {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const { data, error } = await supabase.from('characteristics').select('extraversion_score,introversion_score,sensing_score,intuition_score,thinking_score,feeling_score,judging_score,perceiving_score').eq('user_id', user.id).single();

    return { data, error };
}

export async function upsertMBCharacteristics(values: MBCharacteristics) {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const characteristics = {
        ...values,
        user_id: user.id
    }

    const { data, error } = await supabase.from('characteristics').upsert(characteristics, { onConflict: 'user_id' }).eq('user_id', user.id).select('*').single();

    return { data, error };
}