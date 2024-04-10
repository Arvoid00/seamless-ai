'use client'

import * as React from 'react'

import { useSourcesbar } from '@/lib/hooks/use-sources-bar'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'

export function SourcesbarToggle() {
    const { toggleSourcesbar } = useSourcesbar()

    return (
        <Button
            variant="ghost"
            className="-ml-2 hidden size-9 p-0 lg:flex"
            onClick={() => {
                toggleSourcesbar()
            }}
        >
            {/* <IconSidebar className="size-6" /> */}
            🧠
            <span className="sr-only">Toggle Sourcesbar</span>
        </Button>
    )
}
