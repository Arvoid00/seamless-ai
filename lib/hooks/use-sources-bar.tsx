'use client'

import * as React from 'react'

const LOCAL_STORAGE_KEY = 'sourcesbar'

interface SourcesbarContext {
    isSourcesbarOpen: boolean
    toggleSourcesbar: () => void
    isLoading: boolean
}

const SourcesbarContext = React.createContext<SourcesbarContext | undefined>(
    undefined
)

export function useSourcesbar() {
    const context = React.useContext(SourcesbarContext)
    if (!context) {
        throw new Error('useSourcesbarContext must be used within a SourcesbarProvider')
    }
    return context
}

interface SourcesbarProviderProps {
    children: React.ReactNode
}

export function SourcesbarProvider({ children }: SourcesbarProviderProps) {
    const [isSourcesbarOpen, setSourcesbarOpen] = React.useState(true)
    const [isLoading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const value = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (value) {
            setSourcesbarOpen(JSON.parse(value))
        }
        setLoading(false)
    }, [])

    const toggleSourcesbar = () => {
        setSourcesbarOpen(value => {
            const newState = !value
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState))
            return newState
        })
    }

    if (isLoading) {
        return null
    }

    return (
        <SourcesbarContext.Provider
            value={{ isSourcesbarOpen, toggleSourcesbar, isLoading }}
        >
            {children}
        </SourcesbarContext.Provider>
    )
}