'use client'

import React from 'react'
import { Button } from './ui/button'
import { generateDynamicQuestions } from '@/app/AIActions'
import { Slider } from './ui/slider'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { isEmptyObject } from '@/lib/utils'
import { toast } from 'sonner'
import { upsertQuizResults } from '@/app/supabaseActions'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


function TextAnswer({ question, results, handleChange }: { question: any, results: any, handleChange: any }) {
    const value = results[question.query] || ''

    return (
        <div>
            <Textarea value={value} onChange={(e) => handleChange(question.query, e.target.value)} />
        </div>
    )
}

function RangeAnswer({ question, results, handleChange }: { question: any, results: any, handleChange: any }) {

    const min_label = question.options.min_label || 'Strongly disagree'
    const max_label = question.options.max_label || 'Strongly agree'
    const min = question.options.min || 1
    const max = question.options.max || 5
    const step = question.options.step || 1
    const middle = (max - min) / 2 + 1

    const currentValue = results[question.query] !== undefined ? [results[question.query]] : [middle]

    console.log(min_label, max_label, min, max, step, middle)
    console.log(results[question.query])
    console.log(results[question.query] !== undefined ? [results[question.query]] : [middle])

    return (
        <div>
            <div className="flex justify-between">
                <span>{min_label}</span>
                <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={currentValue}
                    onValueChange={(vals: number[]) => {
                        handleChange(question.query, vals[0]);
                    }}
                    className='w-1/2'
                />
                <span>{max_label}</span>
            </div>
        </div>
    )
}

function MultipleChoiceAnswer({ question, results, handleChange }: { question: any, results: any, handleChange: any }) {

    const defaultValue = question.options.default || ''
    const choices = question.options.choices || ['A', 'B']

    return (
        <div>
            <div className='grid gap-4'>
                <RadioGroup onValueChange={(value) => handleChange(question.query, value)} defaultValue={defaultValue}>
                    {choices.map((choice: string) =>
                        <div className="flex items-center space-x-2" key={choice.value}>
                            <RadioGroupItem value={choice.value} id={choice.value} />
                            <Label htmlFor={choice.value}>{choice.label}</Label>
                        </div>
                    )}
                </RadioGroup>
            </div>
        </div>
    )
}

function Question({ question, results, handleChange }: { question: any, results: any, handleChange: any }) {
    return (
        <>
            <div className='font-bold'>{question.query}</div>
            {question.type === 'text' && <TextAnswer question={question} results={results} handleChange={handleChange} />}
            {question.type === 'range' && <RangeAnswer question={question} results={results} handleChange={handleChange} />}
            {question.type === 'multiple_choice' && <MultipleChoiceAnswer question={question} results={results} handleChange={handleChange} />}
        </>
    )
}

function StaticQuiz({ data, previousResult }: { data: any, previousResult: any }) {
    const { quiz, questions: dataQuestions } = data
    const [currentQuestion, setCurrentQuestion] = React.useState(0)
    const [loading, setLoading] = React.useState(false)
    const [showQuestions, setShowQuestions] = React.useState(false)
    const [questions, setQuestions] = React.useState(dataQuestions)
    const [results, setResults] = React.useState(previousResult ?? {})

    const handleChange = (question: string, value: number) => {
        setResults({ ...results, [question]: value })
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const { data, error } = await upsertQuizResults(quiz.id, results)
        if (error) {
            console.error(error)
            toast.error('An error occurred while saving quiz results. Please try again later.')
            return
        }
        if (data) toast.success('Quiz results saved successfully!');
    }

    return (<>
        <Card className='my-4'>
            <CardHeader className='space-y-4'>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
                <div className='flex justify-center'>
                    {!questions && !loading ? <Button className='my-4' disabled={loading} onClick={() => setShowQuestions(true)} >Start Quiz</Button> : !questions && loading && <Button disabled className='my-4'>Generating your personalized quiz...</Button>}
                </div>
            </CardHeader>
            <CardContent className='my-4'>
                <form onSubmit={handleSubmit} className='w-full grid gap-4 space-y-4'>
                    {questions && questions.map((question, index) =>
                        <Question key={question.query} question={question} results={results} handleChange={handleChange} />
                    )}
                    {questions && <div className='flex justify-center'>
                        <Button type='submit'>Submit results</Button>
                    </div>
                    }
                </form>
            </CardContent>
            <CardFooter>
                <div className='flex flex-col'>
                    {!isEmptyObject(results) && <pre className='text-left'>{JSON.stringify(results, null, 2)}</pre>}
                </div>
            </CardFooter>
        </Card >
    </>
    )
}

export default StaticQuiz