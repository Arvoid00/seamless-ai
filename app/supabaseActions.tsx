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
    const { data: quiz, error: quizError } = await getQuiz(quizId)
    const { data, error } = await supabase.from('quiz_questions').select('*,questions(*)').eq('quiz_id', quizId).throwOnError();

    const returnData = { quiz: quiz, questions: data?.map(q => q.questions) }

    return { data: returnData, error };
}

export async function upsertQuizResults(quiz_id: number, results: any) {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const quizResults = {
        quiz_id,
        user_id: user.id,
        results
    }

    const { data, error } = await supabase.from('quiz_results').upsert(quizResults, { onConflict: 'user_id,quiz_id' }).match({ user_id: user.id, quiz_id: quiz_id }).select('*').single();

    return { data, error };
}

export async function getQuizResults(quiz_id: number) {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const { data, error } = await supabase.from('quiz_results').select('*').match({ user_id: user.id, quiz_id: quiz_id }).maybeSingle();

    return { data, error };
}