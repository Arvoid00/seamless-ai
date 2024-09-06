"use client";

import { Button } from "@/components/ui/button";
import { useMultiplestepForm } from "@/hooks/useMultiplestepForm";
import { AnimatePresence } from "framer-motion";
import FinalStep from "@/components/onboarding/FinalStep";
import SuccessMessage from "@/components/onboarding/SuccessMessage";
import MultiStepSideBar from "@/components/onboarding/MultiStepSidebar";
import MBTIForm, { defaultMBCharacteristics, MBCharacteristicsFormSchema } from "./MBTIForm";
import CareerForm, { careerFormSchema, defaultCareerFormValues } from "./CareerForm";
import HumanDesignForm, { defaultHumanDesignFormValues, HumanDesignFormSchema } from "./HumanDesignForm";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getOnboardingData, processOnboarding } from "@/app/supabaseActions";
import { useRouter } from 'next/navigation';
import { useActions } from "ai/rsc";
import { toast } from "sonner";



export const OnboardingFormSchema = HumanDesignFormSchema.merge(careerFormSchema).merge(MBCharacteristicsFormSchema);
export type FormItems = z.infer<typeof OnboardingFormSchema>;

export const initialFormValues: FormItems = {
    ...defaultHumanDesignFormValues,
    ...defaultCareerFormValues,
    ...defaultMBCharacteristics,
};

export default function OnboardingForm() {
    const router = useRouter();
    const form = useForm<FormItems>({
        resolver: zodResolver(OnboardingFormSchema),
        defaultValues: initialFormValues,
        mode: "onBlur",
    })

    const { register, handleSubmit, formState: { errors }, setValue, getValues } = form;

    const {
        previousStep,
        nextStep,
        currentStepIndex,
        isFirstStep,
        isLastStep,
        steps,
        goTo,
        showSuccessMsg,
    } = useMultiplestepForm(4);

    const onSubmit: SubmitHandler<FormItems> = async (data) => {
        console.log(data);
        console.log(isLastStep);
        console.log(currentStepIndex);

        if (!isLastStep) {
            nextStep();
            return;
        }

        console.log("Generating report...");
        console.log(data);
        const result = await processOnboarding(data)
        console.log(result);

        if (result.error) {
            console.error(result.error);
            return;
        }

        const { data: onboardingProfile, error: onboardingProfileError } = await getOnboardingData()

        if (onboardingProfileError) {
            console.error(onboardingProfileError);
            toast.error("Error fetching onboarding data");
            return;
        }

        const onboardingPrompt = `
        You are an AI agent tasked with generating a comprehensive and integrated report for a trainee who has shared their Human Design profile and MBTI type. Your goal is to combine and analyze data from both systems to provide a holistic overview of the trainee's personality, strengths, and potential, with actionable insights for personal and professional growth. The report should cover the following areas:
        Integrated Personality Analysis: Synthesize the information from the trainee's MBTI type and Human Design profile to provide a cohesive description of their core personality traits. Explain how the cognitive functions of the MBTI interact with the energy centers and gates in Human Design, giving a unique perspective on how they think, feel, and behave.
        Strengths and Weaknesses: Combine insights from both systems to highlight the trainee's strengths and potential challenges. Explain how specific MBTI functions align with aspects of their Human Design, such as their type, profile, and authority, to provide a nuanced understanding of what they excel at and where they might struggle.
        Energy Dynamics and Decision-Making: Discuss the trainee's energy dynamics, incorporating insights from both their Human Design energy centers and MBTI cognitive functions. Analyze how these elements influence their decision-making process, including how they approach choices, handle pressure, and manage their energy levels throughout the day.
        Information Processing and Communication Style: Provide an integrated view of how the trainee processes information and communicates with others. Consider how the trainee's MBTI type influences their cognitive approach, and how their Human Design profile impacts the way they share ideas, articulate thoughts, and connect with others.
        Collaboration and Work Preferences: Explore the trainee's collaboration style and work environment preferences, drawing from both systems. Discuss how their Human Design type and profile might influence their role within a team and how their MBTI type shapes their approach to teamwork, leadership, and conflict resolution.
        Stress Management and Growth Opportunities: Analyze how the trainee manages stress, considering both their MBTI functions and Human Design centers. Offer personalized strategies for stress management and highlight growth opportunities that align with their unique design and type. Suggest practical steps they can take to enhance their well-being and further develop their potential.
        Career and Life Path Recommendations: Synthesize insights from both systems to offer tailored career and life path recommendations. Discuss how the trainee's strengths, energy dynamics, and decision-making style can guide them towards fulfilling career choices and life goals that resonate with their true nature.
        Ideal Work Environment: Describe the ideal work environment for the trainee, combining factors from both their Human Design and MBTI. Explain how their energy needs, communication style, and collaboration preferences can be best supported in a work setting, and suggest the types of environments where they are likely to thrive.
        Throughout the report, ensure that your analysis is deeply integrated, with each insight clearly connecting the trainee's Human Design and MBTI elements. Explain the relevance of each point and how the combination of both systems provides a richer, more complete understanding of the trainee's potential. Your objective is to deliver a report that is not only insightful but also actionable, empowering the trainee to make informed decisions and pursue growth in both their personal and professional life. Every section should have a short introduction and than all data should be in tables and have the following columns:
        Attribute: Concise name representing a key trait or characteristic.
        Tag: Category of the attribute (e.g., MBTI Function, Strength, Decision-Making Style).
        Description: Detailed explanation that highlights the specific input elements (MBTI functions, Human Design traits, Professional Background) combined to derive the insight.
        Gathered from: Specific sources of insight (e.g., MBTI type, Human Design profile, Professional Background).

        Trainee data:
        ${JSON.stringify(onboardingProfile, null, 2)}
        `

        console.log(onboardingPrompt); // This is the final report that the AI agent will generate

        localStorage.setItem("onboardingComplete", "true");
        localStorage.setItem("userOnboardingData", onboardingPrompt);
        nextStep();

        setTimeout(() => {
            router.push("/chat");
        }, 3000);
    };

    return (
        <div
            className={`flex justify-between w-11/12 max-w-4xl relative m-1 rounded-lg border border-neutral-700 bg-[#262626] p-4 text-white`}
        >
            {!showSuccessMsg ? (
                <MultiStepSideBar currentStepIndex={currentStepIndex} goTo={goTo} />
            ) : (
                ""
            )}
            <div
                className={`${showSuccessMsg ? "w-full" : "w-full md:mt-5 md:w-[65%]"}`}
            >
                {showSuccessMsg ? (
                    <AnimatePresence mode="wait">
                        <SuccessMessage />
                    </AnimatePresence>
                ) : (
                    <form
                        // onSubmit={handleSubmit(onSubmit)}
                        className="w-full flex flex-col justify-between h-full space-y-4"
                    >
                        <AnimatePresence mode="wait">
                            {currentStepIndex === 0 && (
                                <HumanDesignForm key="step1" form={form} />
                            )}
                            {currentStepIndex === 1 && (
                                <CareerForm key="step2" form={form} />
                            )}
                            {currentStepIndex === 2 && (
                                <MBTIForm key="step3" form={form} />
                            )}
                            {currentStepIndex === 3 && (
                                <FinalStep key="step4" form={form} />
                            )}
                        </AnimatePresence>
                        <div className="w-full items-center flex justify-between">
                            <div className="">
                                <Button
                                    onClick={previousStep}
                                    type="button"
                                    variant="ghost"
                                    className={`${isFirstStep
                                        ? "invisible"
                                        : "visible p-0 text-neutral-200 hover:text-white"
                                        }`}
                                >
                                    Go Back
                                </Button>
                            </div>
                            <div className="flex items-center">
                                <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition">
                                    <Button
                                        // type="submit"
                                        type="button"
                                        onClick={() => onSubmit(getValues())}
                                        className="relative text-neutral-200 bg-neutral-900 border border-black/20 shadow-input shadow-black/10 rounded-xl hover:text-white"
                                    >
                                        {isLastStep ? "Generate Report" : "Next Step"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {/* <pre>{JSON.stringify(getValues(), null, 2)}</pre> */}
                    </form>
                )}
            </div>
        </div>
    );
}