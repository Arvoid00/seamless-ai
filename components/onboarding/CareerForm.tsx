"use client";

import React, { useState } from 'react'
import { useId } from 'react'
import { z } from 'zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { FormItems } from './OnboardingForm';
import FormWrapper from './FormWrapper';

export const careerFormSchema = z.object({
  currentPosition: z.string().min(1, "Current position is required"),
  company: z.string().min(1, "Company name is required"),
  yearsOfExperience: z.number().int().min(0, "Years of experience must be a positive number"),
  fieldOfWork: z.string().min(1, "Field of work is required"),
  skillsAndQualifications: z.array(z.string()).min(1, "At least one skill or qualification is required"),
  shortTermGoals: z.array(z.string()).min(1, "At least one short-term goal is required"),
  biggestChallenges: z.array(z.string()).min(1, "At least one challenge is required"),
})

export const defaultCareerFormValues = {
  currentPosition: '',
  company: '',
  yearsOfExperience: 0,
  fieldOfWork: '',
  skillsAndQualifications: [],
  shortTermGoals: [],
  biggestChallenges: [],
}

const CareerForm = ({ form }: { form: UseFormReturn<FormItems> }) => {
  const { register, formState: { errors }, setValue, getValues, watch } = form;

  return (
    <FormWrapper
      title="Your professional career"
      description="Please provide information about your career and professional goals."
    >
      <div className="space-y-2">
        <Label htmlFor="currentPosition">What is your current job title?</Label>
        <Input
          id="currentPosition"
          {...register('currentPosition')}
          placeholder="e.g. Software Engineer"
        />
        {errors.currentPosition && <p className="text-sm text-red-500">{errors.currentPosition.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Which company do you work for?</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="e.g. Tech Innovations Inc."
        />
        {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience">How many years of experience do you have in your field?</Label>
        <Input
          id="yearsOfExperience"
          type="number"
          {...register('yearsOfExperience', { valueAsNumber: true })}
          placeholder="e.g. 5"
        />
        {errors.yearsOfExperience && <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fieldOfWork">What is your field of work or specialization?</Label>
        <Input
          id="fieldOfWork"
          {...register('fieldOfWork')}
          placeholder="e.g. Web Development"
        />
        {errors.fieldOfWork && <p className="text-sm text-red-500">{errors.fieldOfWork.message}</p>}
      </div>

      <TagInput
        label="What specific skills or qualifications do you have?"
        value={watch('skillsAndQualifications')}
        onChange={(tags) => setValue('skillsAndQualifications', tags, { shouldValidate: true })}
        error={errors.skillsAndQualifications?.message}
      />

      <TagInput
        label="What are your short-term career goals (within the next 1-2 years)?"
        value={watch('shortTermGoals')}
        onChange={(tags) => setValue('shortTermGoals', tags, { shouldValidate: true })}
        error={errors.shortTermGoals?.message}
      />

      <TagInput
        label="What are the biggest challenges you are currently facing in your professional role?"
        value={watch('biggestChallenges')}
        onChange={(tags) => setValue('biggestChallenges', tags, { shouldValidate: true })}
        error={errors.biggestChallenges?.message}
      />

    </FormWrapper>
  );
};

export default CareerForm;


const TagInput = ({
  label,
  value,
  onChange,
  error
}: {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}) => {
  const [inputValue, setInputValue] = useState('')
  const inputId = useId()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      onChange([...value, inputValue])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md">
        {value.map((tag, index) => (
          <span key={index} className="flex items-center bg-primary text-primary-foreground px-2 py-1 rounded-md">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-1 h-4 w-4"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </Button>
          </span>
        ))}
        <Input
          id={inputId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow border-none shadow-none focus-visible:ring-0"
          placeholder="Type and press Enter"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

// export default function CareerForm({ updateForm, plan, yearly }: stepProps) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       skillsAndQualifications: [],
//       shortTermGoals: [],
//       biggestChallenges: [],
//     },
//   })

//   const onSubmit = (data: FormData) => {
//     console.log(data)
//     // Handle form submission here
//   }

//   return (
//     <Card className="w-full max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle>Career Information</CardTitle>
//         <CardDescription>Please provide information about your career and professional goals.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="currentPosition">What is your current job title?</Label>
//             <Input
//               id="currentPosition"
//               {...register('currentPosition')}
//               placeholder="e.g. Software Engineer"
//             />
//             {errors.currentPosition && <p className="text-sm text-red-500">{errors.currentPosition.message}</p>}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="company">Which company do you work for?</Label>
//             <Input
//               id="company"
//               {...register('company')}
//               placeholder="e.g. Tech Innovations Inc."
//             />
//             {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="yearsOfExperience">How many years of experience do you have in your field?</Label>
//             <Input
//               id="yearsOfExperience"
//               type="number"
//               {...register('yearsOfExperience', { valueAsNumber: true })}
//               placeholder="e.g. 5"
//             />
//             {errors.yearsOfExperience && <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="fieldOfWork">What is your field of work or specialization?</Label>
//             <Input
//               id="fieldOfWork"
//               {...register('fieldOfWork')}
//               placeholder="e.g. Web Development"
//             />
//             {errors.fieldOfWork && <p className="text-sm text-red-500">{errors.fieldOfWork.message}</p>}
//           </div>

//           <TagInput
//             label="What specific skills or qualifications do you have?"
//             value={watch('skillsAndQualifications')}
//             onChange={(tags) => setValue('skillsAndQualifications', tags, { shouldValidate: true })}
//             error={errors.skillsAndQualifications?.message}
//           />

//           <TagInput
//             label="What are your short-term career goals (within the next 1-2 years)?"
//             value={watch('shortTermGoals')}
//             onChange={(tags) => setValue('shortTermGoals', tags, { shouldValidate: true })}
//             error={errors.shortTermGoals?.message}
//           />

//           <TagInput
//             label="What are the biggest challenges you are currently facing in your professional role?"
//             value={watch('biggestChallenges')}
//             onChange={(tags) => setValue('biggestChallenges', tags, { shouldValidate: true })}
//             error={errors.biggestChallenges?.message}
//           />

//           <Button type="submit" className="w-full">Submit</Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }