"use server"
import "server-only"

import { createClient } from "@/utils/supabase/server";
import { MBCharacteristics } from "@/components/MBForm";
import { FormItems } from "@/components/onboarding/OnboardingForm";
import { date } from "zod";
import { padZero } from "@/lib/utils";

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

export async function processOnboarding(data: FormItems) {
    try {
        const supabase = createClient();

        const {
            data: { user }, error: userError
        } = await supabase.auth.getUser()
        if (!user) return { data: null, error: userError }

        const MBTIData = {
            extraversion_score: data.extraversion_score,
            introversion_score: data.introversion_score,
            sensing_score: data.sensing_score,
            intuition_score: data.intuition_score,
            thinking_score: data.thinking_score,
            feeling_score: data.feeling_score,
            judging_score: data.judging_score,
            perceiving_score: data.perceiving_score,
            user_id: user.id
        }

        const humanDesignInput = {
            name: data.name,
            day: data.day,
            month: data.month,
            year: data.year,
            hour: data.hour,
            minute: data.minute,
            place_of_birth: data.place_of_birth,
        }

        const humanDesignData = await getHumanDesignData(humanDesignInput);

        const { data: MBCharacteristicsData, error: MBCharacteristicsError } = await upsertMBCharacteristics(MBTIData);

        const careerQuizResults = {
            currentPosition: data.currentPosition,
            company: data.company,
            yearsOfExperience: data.yearsOfExperience,
            fieldOfWork: data.fieldOfWork,
            skillsAndQualifications: data.skillsAndQualifications,
            shortTermGoals: data.shortTermGoals,
            biggestChallenges: data.biggestChallenges,
        }

        const profileData = {
            human_design_json: humanDesignData,
            background_results: careerQuizResults,
            mbti_results: MBCharacteristicsData.id,
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').upsert({ ...profileData, user_id: user.id }, { onConflict: 'user_id' }).eq('user_id', user.id).select('*').single();
        console.log('New Profile:', profile);

        return { data: profile, error: profileError };

    }
    catch (error) {
        console.error('Error processing onboarding:', error);
        throw error;
    }


}

export async function getHumanDesignData(data) {
    try {
        const HD_API_BASE_URL = 'https://api.bodygraphchart.com';

        const timezone = await getHumanDesignTimezone(data.place_of_birth);
        console.log('Timezone:', timezone);
        const HDInput = {
            api_key: process.env.BODYGRAPH_API_KEY!,
            date: `${data.year}-${padZero(data.month)}-${padZero(data.day)} ${padZero(data.hour)}:${padZero(data.minute)}`,
            timezone: timezone || 'Europe/Amsterdam',
        }

        const queryparams = new URLSearchParams(HDInput).toString();
        const url = `${HD_API_BASE_URL}/v221006/hd-data?${queryparams}`;
        console.log('HD URL:', url);
        const response = await fetch(url)
        if (!response.ok) {
            console.error('Error fetching HD data:', response.status, response.statusText);
            throw new Error(`Error fetching HD data: ${response.status, response.statusText}`);
        }

        const result = await response.json();

        return result;
    } catch (error) {
        console.error('Error fetching body graph:', error);
        throw error;
    }
}

export async function getHumanDesignTimezone(location: string) {
    const HD_API_BASE_URL = 'https://api.bodygraphchart.com';

    const HDInput = {
        api_key: process.env.BODYGRAPH_API_KEY!,
        query: location,
    }

    const queryparams = new URLSearchParams(HDInput).toString();

    try {
        const url = `${HD_API_BASE_URL}/v210502/locations?${queryparams}`;
        console.log('Timezone URL:', url);
        const response = await fetch(url)
        if (!response.ok) {
            console.error('Error fetching timezone:', response.statusText, 'using default timezone Europe/Amsterdam');
            return 'Europe/Amsterdam';
        }

        const result = await response.json();
        // console.log(result)
        if (result.length === 0) {
            console.log('No timezone found, using default timezone Europe/Amsterdam');
            return 'Europe/Amsterdam';
        }
        const firstTimezone = result[0].timezone;
        console.log('Found Timezone:', firstTimezone);
        return firstTimezone;
    } catch (error) {
        console.error('Error fetching timezone:', error);
        throw error;
    }

}

export async function getOnboardingData() {
    const supabase = createClient();

    const {
        data: { user }, error: userError
    } = await supabase.auth.getUser()
    if (!user) return { data: null, error: userError }

    const { data: profile, error: profileError } = await supabase.from('profiles').select('*, characteristics(*)').eq('user_id', user.id).maybeSingle();

    return { data: profile, error: profileError };
}