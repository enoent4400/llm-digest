'use client'

import Link from 'next/link'
import { Brain } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface AppHeaderProps {
  showNavigation?: boolean
  className?: string
  maxWidth?: string
}

export function AppHeader({ className = '', maxWidth = 'max-w-7xl' }: AppHeaderProps) {
  return (
    <div className={`border-b border-gray-800 bg-bg-secondary ${className}`}>
      <div className={`${maxWidth} mx-auto px-6 py-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Brand */}
            <Link href="/dashboard" className="glass-card px-4 py-2 hover:bg-accent-primary/10 transition-colors duration-200">
              <h1 className="text-xl font-semibold tracking-wide text-accent-primary flex items-center gap-2">
                <Brain className="w-6 h-6" />
                LLMDigest
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
