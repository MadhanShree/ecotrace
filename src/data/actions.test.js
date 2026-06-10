import { describe, it, expect } from 'vitest'
import { rankedActions } from './actions.js'

const baseProfile = {
  carKmPerWeek: 150,
  carFuel: 'petrol',
  transitKmPerWeek: 10,
  flightsShortPerYear: 2,
  flightsLongPerYear: 0,
  dietType: 'heavy_meat',
  electricityKwhPerMonth: 300,
  renewablePct: 0,
  heatingType: 'gas',
  heatingIntensity: 'medium',
  householdSize: 2,
  shoppingLevel: 'high',
}

describe('rankedActions', () => {
  it('returns actions sorted by impact-per-effort (descending score)', () => {
    const actions = rankedActions(baseProfile)
    for (let i = 1; i < actions.length; i++) {
      expect(actions[i - 1].score).toBeGreaterThanOrEqual(actions[i].score)
    }
  })

  it('only includes actions with a positive saving', () => {
    for (const a of rankedActions(baseProfile)) {
      expect(a.savingKg).toBeGreaterThan(0)
    }
  })

  it('hides the EV action for someone who already drives an EV', () => {
    const ids = rankedActions({ ...baseProfile, carFuel: 'ev' }).map((a) => a.id)
    expect(ids).not.toContain('switch-ev')
  })

  it('hides the green-tariff action when already on renewables', () => {
    const ids = rankedActions({ ...baseProfile, renewablePct: 100 }).map((a) => a.id)
    expect(ids).not.toContain('green-tariff')
  })

  it('suggests cutting red meat for a heavy-meat eater', () => {
    const ids = rankedActions(baseProfile).map((a) => a.id)
    expect(ids).toContain('cut-redmeat')
  })

  it('does not suggest cutting red meat for a vegan', () => {
    const ids = rankedActions({ ...baseProfile, dietType: 'vegan' }).map((a) => a.id)
    expect(ids).not.toContain('cut-redmeat')
  })
})
