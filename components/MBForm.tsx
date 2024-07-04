"use client"

import React, { useState } from 'react'
import { Slider } from './ui/slider'
import { Button } from '@/components/ui/button';
import { upsertMBCharacteristics } from '@/app/supabaseActions';
import { toast } from 'sonner';

export interface MBCharacteristics {
    extraversion_score: number;
    introversion_score: number;
    sensing_score: number;
    intuition_score: number;
    thinking_score: number;
    feeling_score: number;
    judging_score: number;
    perceiving_score: number;
}

function MBForm({ MBvalues }: { MBvalues: MBCharacteristics }) {
    const [values, setValues] = useState(MBvalues);

    const handleSliderChange = (key: string, oppositeKey: string, value: number) => {
        setValues({
            ...values,
            [key]: value,
            [oppositeKey]: 100 - value
        });
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        await upsertMBCharacteristics(values)
        toast.success('MB Characteristics saved successfully!');
    };

    return (
        <form onSubmit={handleSubmit} className='w-[1000px] grid gap-4'>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Extraversion {values.extraversion_score}%</p>
                <Slider
                    min={0}
                    max={100}
                    step={5}
                    value={[values.extraversion_score]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('extraversion_score', 'introversion_score', vals[0]);
                    }}
                    className="w-full"
                />
                <p>Introversion {values.introversion_score}%</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Sensing {values.sensing_score}%</p>
                <Slider
                    value={[values.sensing_score]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('sensing_score', 'intuition_score', vals[0]);
                    }}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                />
                <p>Intuition {values.intuition_score}%</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Thinking {values.thinking_score}%</p>
                <Slider
                    value={[values.thinking_score]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('thinking_score', 'feeling_score', vals[0]);
                    }}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                />
                <p>Feeling {values.feeling_score}%</p>
            </div>
            <div className='grid grid-cols-3 gap-8 items-center'>
                <p className="text-right">Judging {values.judging_score}%</p>
                <Slider
                    value={[values.judging_score]}
                    onValueChange={(vals: number[]) => {
                        handleSliderChange('judging_score', 'perceiving_score', vals[0]);
                    }}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                />
                <p>Perceiving {values.perceiving_score}%</p>
            </div>
            <div className='flex justify-center'>
                <Button type='submit'>Submit</Button>
            </div>
        </form>
    )
}

export default MBForm