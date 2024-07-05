"use client"

import React, { useState } from 'react'
import { Slider } from './ui/slider'
import { Button } from '@/components/ui/button';
import { upsertIntelligences, upsertMBCharacteristics } from '@/app/supabaseActions';
import { toast } from 'sonner';
import IntelligenceRadarChart from './radar-chart';

export interface Intelligences {
    linguistic: number;
    naturalist: number;
    musical: number;
    logical_mathematical: number;
    existential: number;
    bodily_kinesthetic: number;
    intrapersonal: number;
    interpersonal: number;
    spatial: number;
}

const defaultIntelligences: Intelligences = {
    linguistic: 0,
    naturalist: 0,
    musical: 0,
    logical_mathematical: 0,
    existential: 0,
    bodily_kinesthetic: 0,
    intrapersonal: 0,
    interpersonal: 0,
    spatial: 0,
};

function IntelligencesForm({ intelligenceValues }: { intelligenceValues: Intelligences }) {
    const [values, setValues] = useState(intelligenceValues ?? defaultIntelligences as Intelligences);
    // console.log(values)

    const handleSliderChange = (key: string, value: number) => {
        setValues({
            ...values,
            [key]: value,
        });
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        await upsertIntelligences(values)
        toast.success('Intelligences saved successfully!');
    };

    return (
        <form onSubmit={handleSubmit} className='w-[1000px] grid gap-4'>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Linguistic</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.linguistic ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('linguistic', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.linguistic ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Naturalist</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.naturalist ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('naturalist', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.naturalist ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Musical</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.musical ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('musical', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.musical ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Logical-Mathematical</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.logical_mathematical ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('logical_mathematical', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.logical_mathematical ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Existential</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.existential ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('existential', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.existential ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Bodily-kinesthetic</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.bodily_kinesthetic ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('bodily_kinesthetic', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.bodily_kinesthetic ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Intrapersonal</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.intrapersonal ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('intrapersonal', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.intrapersonal ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Interpersonal</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.interpersonal ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('interpersonal', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.interpersonal ?? 0} / 100`}</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Spatial</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.spatial ?? 0]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('spatial', vals[0]);
                    }}
                    className="w-full"
                />
                <p>{`${values.spatial ?? 0} / 100`}</p>
            </div>

            <IntelligenceRadarChart data={values} />

            <div className='flex justify-center'>
                <Button type='submit'>Submit intelligences</Button>
            </div>
            <p>9 Intellingence scales: 0 to 100 %</p>
            <pre className='text-left'>{JSON.stringify(values, null, 2)}</pre>

        </form>
    )
}

export default IntelligencesForm