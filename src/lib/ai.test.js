import { describe, it, expect } from 'vitest'
import { getCoachMessage } from './ai.js'
import { computeFootprint, tonnes } from './calculator.js'
import { rankedActions } from '../data/actions.js'

const profile = {
  carKmPerWeek: 120,
  carFuel: 'petrol',
  transitKmPerWeek: 20,
  flightsShortPerYear: 1,
  flightsLongPerYear: 0,
  dietType: 'average',
  electricityKwhPerMonth: 250,
  renewablePct: 0,
  heatingType: 'gas',
  heatingIntensity: 'medium',
  householdSize: 2,
  shoppingLevel: 'medium',
}

describe('getCoachMessage (no API key -> local fallback)', () => {
  it('returns a local coaching message with text', async () => {
    const footprint = computeFootprint(profile)
    const topActions = rankedActions(profile).slice(0, 3)
    const coach = await getCoachMessage({ footprint, topActions })
    expect(coach.source).toBe('local')
    expect(typeof coach.text).toBe('string')
    expect(coach.text.length).toBeGreaterThan(0)
  })

  it('mentions the user\'s tonnage in the message', async () => {
    const footprint = computeFootprint(profile)
    const coach = await getCoachMessage({ footprint, topActions: rankedActions(profile).slice(0, 3) })
    expect(coach.text).toContain(String(tonnes(footprint.total)))
  })
})
