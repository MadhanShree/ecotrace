import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadCommitment,
  saveCommitment,
  clearCommitment,
  daysSince,
  daysAgoLabel,
} from './commitments.js'

const DAY = 86_400_000

beforeEach(() => {
  localStorage.clear()
})

describe('daysSince', () => {
  it('returns 0 for now and invalid input', () => {
    expect(daysSince(Date.now())).toBe(0)
    expect(daysSince(NaN)).toBe(0)
    expect(daysSince(undefined)).toBe(0)
  })

  it('counts whole elapsed days', () => {
    expect(daysSince(Date.now() - 2 * DAY)).toBe(2)
  })
})

describe('daysAgoLabel', () => {
  it('renders friendly relative labels', () => {
    expect(daysAgoLabel(Date.now())).toBe('today')
    expect(daysAgoLabel(Date.now() - DAY)).toBe('yesterday')
    expect(daysAgoLabel(Date.now() - 3 * DAY)).toBe('3 days ago')
  })
})

describe('commitment persistence', () => {
  it('saves and reloads a commitment', () => {
    const c = { actionIds: ['a', 'b'], committedAt: Date.now(), lastCheckIn: null, checkInCount: 0 }
    saveCommitment(c)
    expect(loadCommitment()).toEqual(c)
  })

  it('returns null after clearing', () => {
    saveCommitment({ actionIds: ['a'], committedAt: Date.now(), lastCheckIn: null, checkInCount: 0 })
    clearCommitment()
    expect(loadCommitment()).toBeNull()
  })

  it('rejects malformed stored data', () => {
    localStorage.setItem('ecotrace.commitment.v1', JSON.stringify({ actionIds: [], committedAt: 'nope' }))
    expect(loadCommitment()).toBeNull()
  })
})
