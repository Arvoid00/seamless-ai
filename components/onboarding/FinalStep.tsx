"use client";

import FormWrapper from "./FormWrapper";
import { FormItems } from "./OnboardingForm";
import { UseFormReturn } from "react-hook-form";

const FinalStep = ({ form }: { form: UseFormReturn<FormItems> }) => {

  return (
    <FormWrapper
      title="Finishing Up"
      description="Thank you for providing your information. We will now generate a report based on your info."
    >
      <div className="">
      </div>
    </FormWrapper>
  );
};

export default FinalStep;
