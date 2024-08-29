import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { FormItems } from "./OnboardingForm";
import FormWrapper from "./FormWrapper";

export const HumanDesignFormSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(3, "Name should be at least 3 characters long").max(25, "Name should be no longer than 25 characters"),
    day: z.number().min(1).max(31),
    month: z.number().min(1).max(12),
    year: z.number().min(1900).max(new Date().getFullYear()),
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
    place_of_birth: z.string().min(1, "Location is required"),
});

export const defaultHumanDesignFormValues = {
    name: "",
    day: 1,
    month: 1,
    year: 1990,
    hour: 0,
    minute: 0,
    place_of_birth: "",
};

const HumanDesignForm = ({ form }: { form: UseFormReturn<FormItems> }) => {
    const { register, formState: { errors }, setValue, getValues } = form;

    return (
        <FormWrapper
            title="Your Human Design"
            description="Please provide your name, date and time of birth, and birth location."
        >
            <div className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        autoFocus
                        type="text"
                        id="name"
                        placeholder="e.g. Stephen King"
                        {...register("name")}
                        className="w-full"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div className="flex flex-row gap-2">
                    <div>
                        <Label htmlFor="day">Day</Label>
                        <Input
                            type="text"
                            id="day"
                            placeholder="DD"
                            {...register("day", { setValueAs: (value) => parseInt(value) })}
                            className="w-full"
                        />
                        {errors.day && <p className="text-red-500 text-sm">{errors.day.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="month">Month</Label>
                        <Input
                            type="text"
                            id="month"
                            placeholder="MM"
                            {...register("month", { setValueAs: (value) => parseInt(value) })}
                            className="w-full"

                        />
                        {errors.month && <p className="text-red-500 text-sm">{errors.month.message}</p>}

                    </div>
                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                            type="text"
                            id="year"
                            placeholder="YYYY"
                            {...register("year", { setValueAs: (value) => parseInt(value) })}
                            className="w-full"

                        />
                    </div>
                    {errors.year && <p className="text-red-500 text-sm">{errors.year.message}</p>}

                </div>
                <div className="flex flex-row gap-2 justify-start">
                    <div>
                        <Label htmlFor="hour">Hour</Label>
                        <Input
                            type="text"
                            id="hour"
                            placeholder="HH"
                            {...register("hour", { setValueAs: (value) => parseInt(value) })}
                            className="w-full"

                        />
                        {errors.hour && <p className="text-red-500 text-sm">{errors.hour.message}</p>}

                    </div>
                    <div>
                        <Label htmlFor="minute">Minute</Label>
                        <Input
                            type="text"
                            id="minute"
                            placeholder="MM"{...register("minute", { setValueAs: (value) => parseInt(value) })}
                            className="w-full"

                        />
                    </div>
                    {errors.minute && <p className="text-red-500 text-sm">{errors.minute.message}</p>}

                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="place_of_birth">Place of Birth</Label>
                    <Input
                        type="text"
                        id="place_of_birth"
                        placeholder="Enter a state, city, or country"
                        {...register("place_of_birth")}
                        className="w-full"

                    />
                    {errors.place_of_birth && <p className="text-red-500 text-sm">{errors.place_of_birth.message}</p>}
                </div>
            </div>
        </FormWrapper >
    );
};

export default HumanDesignForm;