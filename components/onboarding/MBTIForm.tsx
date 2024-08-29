"use client"

import FormWrapper from "./FormWrapper";

import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Slider } from '@/components/ui/slider'
import { FormItems } from "./OnboardingForm";

export const MBCharacteristicsFormSchema = z.object({
    extraversion_score: z.number().min(0).max(100),
    introversion_score: z.number().min(0).max(100),
    sensing_score: z.number().min(0).max(100),
    intuition_score: z.number().min(0).max(100),
    thinking_score: z.number().min(0).max(100),
    feeling_score: z.number().min(0).max(100),
    judging_score: z.number().min(0).max(100),
    perceiving_score: z.number().min(0).max(100),
    assertive_score: z.number().min(0).max(100),
    turbulent_score: z.number().min(0).max(100),
    personality_type: z.string().min(0).max(6),
});

type FormData = z.infer<typeof MBCharacteristicsFormSchema>

export const defaultMBCharacteristics = {
    extraversion_score: 50,
    introversion_score: 50,
    sensing_score: 50,
    intuition_score: 50,
    thinking_score: 50,
    feeling_score: 50,
    judging_score: 50,
    perceiving_score: 50,
    assertive_score: 50,
    turbulent_score: 50,
    personality_type: ""
};

const MBTIForm = ({ form }: { form: UseFormReturn<FormItems> }) => {
    const { register, formState: { errors }, setValue, getValues } = form;

    const handleSliderChange = (key: string, oppositeKey: string, value: number) => {
        setValue(key as keyof FormData, value);
        setValue(oppositeKey as keyof FormData, 100 - value);
    };

    const calculatePersonalityType = () => {
        let result = "";
        result += getValues("extraversion_score") > 50 ? "E" : "I";
        result += getValues("sensing_score") > 50 ? "S" : "N";
        result += getValues("thinking_score") > 50 ? "T" : "F";
        result += getValues("judging_score") > 50 ? "J" : "P";
        result += getValues("assertive_score") > 50 ? "-A" : "-T";
        setValue("personality_type" as keyof FormData, result);
        return result;
    }

    const personalityScores = [
        { labelLeft: "Extraversion", labelRight: "Introversion", key: "extraversion_score", oppositeKey: "introversion_score" },
        { labelLeft: "Sensing", labelRight: "Intuition", key: "sensing_score", oppositeKey: "intuition_score" },
        { labelLeft: "Thinking", labelRight: "Feeling", key: "thinking_score", oppositeKey: "feeling_score" },
        { labelLeft: "Judging", labelRight: "Perceiving", key: "judging_score", oppositeKey: "perceiving_score" },
        { labelLeft: "Assertive", labelRight: "Turbulent", key: "assertive_score", oppositeKey: "turbulent_score" },
    ]

    return (
        <FormWrapper
            title="MBTI test"
            description="Please provide the results given by the MBTI test."
        >
            <div className="w-full flex flex-col gap-5">
                {personalityScores.map((item, index) => (
                    <div key={index} className='flex items-center justify-between gap-4'>
                        <p className="w-1/4 text-right">{item.labelLeft} {getValues(item.key as keyof FormData)}%</p>
                        <Slider
                            value={[Number(getValues(item.key as keyof FormData))]}
                            onValueChange={(vals: number[]) => handleSliderChange(item.key, item.oppositeKey, vals[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="w-1/2"
                        />
                        <p className="w-1/4">{item.labelRight} {getValues(item.oppositeKey as keyof FormData)}%</p>
                    </div>
                ))}
                <p>Your personality type based on the given answers is: <b>{calculatePersonalityType()}</b></p>
            </div>
        </FormWrapper>
    );
};

export default MBTIForm;