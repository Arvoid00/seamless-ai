"use client"

import React from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function convertObjectToArray(obj) {
    return Object.keys(obj).map(key => {
        return {
            intelligence: key,
            value: obj[key],
            fullMark: 100
        };
    });
}

export default function IntelligenceRadarChart({ data }: { data: any }) {
    const aggregatedData = convertObjectToArray(data);

    return (<>
        <ResponsiveContainer width="100%" height={350} >
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aggregatedData} width={500} height={500}>
                <PolarGrid />
                <PolarAngleAxis dataKey="intelligence" />
                <PolarRadiusAxis />
                <Radar name="Intelligences" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
        </ResponsiveContainer >
    </>
    )
}