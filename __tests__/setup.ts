// Test setup file for React components and environment variables
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
// @ts-expect-error This is a mock setup file
process.env.NODE_ENV = 'test'
// Environment setup for tests
process.env.DATABASE_TYPE = 'mock'
process.env.POCKETBASE_URL = 'http://localhost:8090'

// No Supabase mocks needed - using mock database

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Mock fetch for API calls
global.fetch = vi.fn()
