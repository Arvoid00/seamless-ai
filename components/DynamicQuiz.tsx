'use client'

import React from 'react'
import { Button } from './ui/button'
import { MBCharacteristics } from './MBForm'
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

function Question({ question, results, handleChange }: { question: any, results: any, handleChange: any }) {
    return (
        <>
            <div className='font-bold'>{question}</div>
            <div className="flex justify-between">
                <span>Strongly disagree</span>
                <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[results[question]] || [3]}
                    onValueChange={(vals: number[]) => {
                        handleChange(question, vals[0]);
                    }}
                    className='w-1/2'
                />
                <span>Strongly agree</span>
            </div>
        </>
    )
}

function DynamicQuiz({ quiz, MBValues }: { quiz: any, MBValues: MBCharacteristics }) {
    const [currentQuestion, setCurrentQuestion] = React.useState(0)
    const [loading, setLoading] = React.useState(false)
    const [dynamicQuestions, setDynamicQuestions] = React.useState(null)
    const [results, setResults] = React.useState({})

    const getDynamicQuestions = async () => {
        setLoading(true)
        const response = await generateDynamicQuestions(MBValues)
        setDynamicQuestions(response.questions)
        setResults(response.questions.reduce((acc, question) => {
            acc[question.question] = 3
            return acc
        }, {}))
        setLoading(false)
    }

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
                    {!dynamicQuestions && !loading ? <Button className='my-4' disabled={loading} onClick={() => getDynamicQuestions()} >Start Quiz</Button> : !dynamicQuestions && loading && <Button disabled className='my-4'>Generating your personalized quiz...</Button>}
                </div>
            </CardHeader>
            <CardContent className='my-4'>
                <form onSubmit={handleSubmit} className='w-full grid gap-4 space-y-4'>
                    {dynamicQuestions && dynamicQuestions.map((question, index) =>
                        <Question key={index} question={question.question} results={results} handleChange={handleChange} />
                    )}
                    {dynamicQuestions && <div className='flex justify-center'>
                        <Button type='submit'>Submit results</Button>
                    </div>
                    }
                </form>
            </CardContent>
            <CardFooter>
                <div className='flex flex-col'>
                    {/* <div>Results:</div> */}
                    {!isEmptyObject(results) && <pre className='text-left'>{JSON.stringify(results, null, 2)}</pre>}
                </div>
            </CardFooter>
        </Card >
    </>
    )
}

export default DynamicQuiz