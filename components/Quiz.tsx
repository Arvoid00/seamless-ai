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

function Question({ question }) {
    return (
        <div>
            <div>{question}</div>
            <div className='flex flex-col'>

                {/* <label className='flex items-center'>
                        <input
                            type='radio'
                            name={`question-${question}`}
                            onChange={(e) => handleOptionChange(e.target.value)}
                        />
                        <span className='ml-2'>{option}</span>
                    </label> */}
            </div>
        </div>
    )
}

function Quiz({ quiz, MBValues }: { quiz: any, MBValues: MBCharacteristics }) {
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
        console.log(question, value)
        // const { id, value } = e.target
        setResults({ ...results, [question]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(results)
    }

    return (<>
        <Card className='my-4'>
            <CardHeader className='space-y-4'>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
                {!dynamicQuestions && !loading ? <Button className='my-4' disabled={loading} onClick={() => getDynamicQuestions()} >Start Quiz</Button> : !dynamicQuestions && loading && <Button disabled className='my-4'>Generating your personalized quiz...</Button>}
            </CardHeader>
            <CardContent className='my-4'>
                {dynamicQuestions && <div className='space-y-8'>
                    {dynamicQuestions.map((question, index) =>
                        <div className=''>
                            <div className='font-bold mb-4'>{question.question}</div>
                            <div className="grid grid-cols-3 gap-8 items-center">
                                <span>Strongly agree</span>
                                <Slider
                                    min={1}
                                    max={5}
                                    step={1}
                                    value={[results[question.question]] || [3]}
                                    onValueChange={(vals: number[]) => {
                                        handleChange(question.question, vals[0]);
                                    }}
                                    className='w-full'
                                />
                                <span> Strongly disagree</span>
                            </div>
                        </div>
                    )}
                </div>}
            </CardContent>
            <CardFooter>
                <div className='flex flex-col'>
                    {/* <div>Results:</div> */}
                    {!isEmptyObject(results) && <pre className='text-left'>{JSON.stringify(results, null, 2)}</pre>}
                </div>
            </CardFooter>
        </Card>
        <div className='my-4'>
            <div className='text-xl'></div>
            <div></div>
        </div>
        <div className='my-4'>


        </div >
    </>
    )
}

export default Quiz