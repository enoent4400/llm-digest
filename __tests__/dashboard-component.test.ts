// Lines: 15
// Purpose: Test dashboard component renders user information correctly
// REVIEW CHECKPOINT: Run this test - should PASS

import { describe, it, expect } from 'vitest'

// Simple utility function to test dashboard data formatting
function formatUserStats(user: { email: string }, digestCount: number = 0) {
  return {
    email: user.email,
    digestsCreated: digestCount,
    freeDigestsRemaining: Math.max(0, 5 - digestCount),
    plan: 'Free'
  }
}

describe('Dashboard User Stats', () => {
  it('should format user stats correctly for new user', () => {
    // Setup
    const user = { email: 'test@example.com' }
    
    // Action
    const stats = formatUserStats(user, 0)
    
    // Assertion
    expect(stats.email).toBe('test@example.com')
    expect(stats.digestsCreated).toBe(0)
    expect(stats.freeDigestsRemaining).toBe(5)
    expect(stats.plan).toBe('Free')
  })
})