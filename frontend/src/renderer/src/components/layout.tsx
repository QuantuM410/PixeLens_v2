'use client'

import { ReactNode } from 'react'
import { TitleBar } from './TitleBar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
        <TitleBar onOpenSettings={() => {}} onShowAbout={() => {}} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}