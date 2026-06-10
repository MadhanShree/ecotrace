import { describe, it, expect } from 'vitest'
import { computeFootprint, tonnes } from './calculator.js'

describe('tonnes', () => {
  it('converts kg to tonnes rounded to 2 dp', () => {
    expect(tonnes(2300)).toBe(2.3)
    expect(tonnes(4890)).toBe(4.89)
    expect(tonnes(0)).toBe(0)
  })
})

describe('computeFootprint', () => {
  const profile = {
    carKmPerWeek: 100,
    carFuel: 'petrol',
    transitKmPerWeek: 0,
    flightsShortPerYear: 0,
    flightsLongPerYear: 0,
    dietType: 'vegan',
    electricityKwhPerMonth: 0,
    renewablePct: 100,
    heatingType: 'none',
    heatingIntensity: 'low',
    householdSize: 1,
    shoppingLevel: 'low',
  }

  it('returns a total and four category buckets', () => {
    const fp = computeFootprint(profile)
    expect(fp).toHaveProperty('total')
    expect(Object.keys(fp.categories).sort()).toEqual(['diet', 'goods', 'home', 'transport'])
  })

  it('computes transport from car distance and fuel factor', () => {
    // 100 km/wk * 52 * 0.192 kg/km = 998.4 -> 998
    expect(computeFootprint(profile).categories.transport).toBe(998)
  })

  it('zeroes grid electricity when on 100% renewables', () => {
    expect(computeFootprint(profile).categories.home).toBe(0)
  })

  it('uses the vegan diet factor', () => {
    expect(computeFootprint(profile).categories.diet).toBe(1500)
  })

  it('sums categories into the total', () => {
    const fp = computeFootprint(profile)
    const sum = Object.values(fp.categories).reduce((a, b) => a + b, 0)
    expect(fp.total).toBe(sum)
  })

  it('divides shared home energy across household size', () => {
    const base = { ...profile, electricityKwhPerMonth: 300, renewablePct: 0, householdSize: 1 }
    const shared = { ...base, householdSize: 3 }
    expect(computeFootprint(shared).categories.home).toBeLessThan(
      computeFootprint(base).categories.home
    )
  })

  it('handles an empty profile without throwing', () => {
    const fp = computeFootprint({})
    expect(Number.isFinite(fp.total)).toBe(true)
    expect(fp.total).toBeGreaterThan(0)
  })

  it('an EV emits less transport CO2 than petrol for the same distance', () => {
    const petrol = computeFootprint({ ...profile, carFuel: 'petrol' }).categories.transport
    const ev = computeFootprint({ ...profile, carFuel: 'ev' }).categories.transport
    expect(ev).toBeLessThan(petrol)
  })
})
