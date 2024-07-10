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

    const { data, error } = await supabase.from('characteristics').select('extraversion_score,introversion_score,sensing_score,intuition_score,thinking_score,feeling_score,judging_score,perceiving_score').eq('user_id', user.id).maybeSingle();

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

export async function getIntelligences() {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const { data, error } = await supabase.from('intelligences').select('linguistic,naturalist,musical,logical_mathematical,existential,bodily_kinesthetic,intrapersonal,interpersonal,spatial').eq('user_id', user.id).maybeSingle();

    return { data, error };
}

export async function upsertIntelligences(values: any) {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const intelligences = {
        ...values,
        user_id: user.id
    }

    const { data, error } = await supabase.from('intelligences').upsert(intelligences, { onConflict: 'user_id' }).eq('user_id', user.id).select('*').single();

    return { data, error };
}

export async function getQuiz(quizId: number) {
    const supabase = createClient();

    const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).maybeSingle().throwOnError();
    return { data, error };
}

export async function getQuizQuestions(quizId: number) {
    const supabase = createClient();

    const { data, error } = await supabase.from('quiz_questions').select('quiz_id,questions(*)').eq('quiz_id', quizId).throwOnError();

    return { data, error };
}