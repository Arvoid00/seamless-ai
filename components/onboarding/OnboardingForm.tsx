"use client";

import { Button } from "@/components/ui/button";
import { useMultiplestepForm } from "@/app/hooks/useMultiplestepForm";
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
import { processOnboarding } from "@/app/supabaseActions";

export const OnboardingFormSchema = HumanDesignFormSchema.merge(careerFormSchema).merge(MBCharacteristicsFormSchema);
export type FormItems = z.infer<typeof OnboardingFormSchema>;

export const initialFormValues: FormItems = {
    ...defaultHumanDesignFormValues,
    ...defaultCareerFormValues,
    ...defaultMBCharacteristics,
};

export default function OnboardingForm() {
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
        if (isLastStep) {
            console.log("Generating report...");
            console.log(data);
            const result = await processOnboarding(data)
            console.log(result);
            if (result.error) {
                console.error(result.error);
                return;
            }
            return;
        }
        nextStep();
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
                        <pre>{JSON.stringify(getValues(), null, 2)}</pre>
                    </form>
                )}
            </div>
        </div>
    );
}