'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SourcesbarProvider } from '@/lib/hooks/use-sources-bar'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SidebarProvider>
        <SourcesbarProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SourcesbarProvider>
      </SidebarProvider>
    </NextThemesProvider>
  )
}
