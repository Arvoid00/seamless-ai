'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TagsProvider } from '@/lib/hooks/use-tags'
import { AgentProvider } from '@/lib/hooks/use-current-agent'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <AgentProvider>
        <SidebarProvider>
          <TooltipProvider>
            <TagsProvider>
              {children}
            </TagsProvider>
          </TooltipProvider>
        </SidebarProvider>
      </AgentProvider>
    </NextThemesProvider>
  )
}
