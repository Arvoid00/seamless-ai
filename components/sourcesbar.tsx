'use client'

import * as React from 'react'

import { useSourcesbar } from '@/lib/hooks/use-sources-bar'
import { cn } from '@/lib/utils'

export interface SourcesbarProps extends React.ComponentProps<'div'> { }

export function Sourcesbar({ className, children }: SourcesbarProps) {
    const { isSourcesbarOpen, isLoading } = useSourcesbar()

    return (
        <div
            data-state={isSourcesbarOpen && !isLoading ? 'open' : 'closed'}
            className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
        >
            {children}
        </div>
    )
}
