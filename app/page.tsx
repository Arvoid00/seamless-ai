import MBForm, { MBCharacteristics } from '@/components/MBForm';
import Image from 'next/image';
import { getIntelligences, getMBCharacteristics, getQuiz, getQuizQuestions, getQuizResults, getUserProfile } from './supabaseActions';
import IntelligencesForm, { Intelligences } from '@/components/IntelligencesForm';
import DynamicQuiz from '@/components/DynamicQuiz';
import StaticQuiz from '@/components/StaticQuiz';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {

    const supabase = createClient()

    const { data: a, error: b } = await supabase.auth.getUser()
    if (b || !a?.user) {
        redirect('/login')
    }

    console.log('HomePage');

    const { data: userProfile, error: userProfileError } = await getUserProfile();
    if (userProfileError) {
        console.error(userProfileError);
        throw userProfileError;
    }

    const validProfile = userProfile && userProfile.human_design && userProfile.background_results && userProfile.mbti_results === null;
    console.log('validProfile', validProfile);

    if (!validProfile) redirect('/onboarding')

    const { data, error } = await getMBCharacteristics();
    if (error) {
        console.error(error);
    }
    const MBValues = data as MBCharacteristics;

    const { data: intelligenceData, error: intelligenceError } = await getIntelligences();
    if (intelligenceError) {
        console.error(intelligenceError);
    }
    const intelligenceValues = intelligenceData as Intelligences;

    const { data: MBTIReflectionQuiz, error: MBTIReflectionQuizError } = await getQuiz(1);

    const { data: StaticQuizWithQuestions, error: StaticQuizWithQuestionsError } = await getQuizQuestions(2);
    const { data: StaticQuizResults, error: StaticQuizResultsError } = await getQuizResults(2);

    return (
        <main className='space-y-10'>
            <div className="flex justify-center mb-5">
                <div className="flex flex-col">

                    <h1 className="p-5 text-4xl font-bold text-center">Serenify</h1>
                    <h2 className="text-base text-gray-600 font-bold text-center">Create your digital personality</h2>
                </div>
            </div>

            {/* <div className="flex justify-center">
                <div className="flex flex-col">
                    <h2 className="p-5 text-2xl font-bold text-center">My Human Design</h2>
                </div>
            </div> */}

            <div className="flex justify-center">
                <div className="flex flex-col min-w-[1000px] items-center justify-center">
                    <h2 className="p-5 text-2xl font-bold text-center">Characteristics</h2>
                    <p className='mb-4'>The Four Myers-Briggs Preference Pairs</p>
                    <MBForm MBvalues={MBValues} />
                </div>
            </div>

            <div className="flex justify-center">
                <div className="flex flex-col items-center justify-center">
                    <h2 className="p-5 text-2xl font-bold text-center">9 Intelligences</h2>
                    <h2 className="text-base text-gray-600 font-bold text-center mb-3">We know you are smart! Discover how!</h2>
                    <Image src="/9-intelligences.png" alt="9 Intelligences" width={500} height={500} className='mb-5' />
                    <IntelligencesForm intelligenceValues={intelligenceValues} />
                </div>
            </div>
            <div className="flex justify-center ">
                <div className="flex flex-col">
                    <h2 className="p-5 text-2xl font-bold text-center">Lifeline</h2>
                    <h2 className="text-base text-gray-600 font-bold text-center">Your personal journey through life, easily documented</h2>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col">
                    <h2 className="p-5 text-2xl font-bold text-center">8 Dimensions of wellbeing</h2>
                    <h2 className="text-base text-gray-600 font-bold text-center">Feeling good, determined on so many levels</h2>
                    <Image src="/8-dimensions-of-wellbeing.png" alt="8 Dimensions of Wellbeing" width={500} height={500} />
                </div>
            </div>
            <div className="flex justify-center ">
                <div className="flex flex-col">
                    <h2 className="p-5 text-2xl font-bold text-center">Quiz</h2>
                    <h2 className="text-base text-gray-600 font-bold text-center">Quizzes to better understand your personality</h2>

                    {MBTIReflectionQuiz && MBTIReflectionQuiz && <DynamicQuiz quiz={MBTIReflectionQuiz} MBValues={MBValues} />}
                    {StaticQuizWithQuestions && <StaticQuiz data={StaticQuizWithQuestions} previousResult={StaticQuizResults.results} />}
                </div>
            </div>

        </main>

    );
}