import { FACTORS } from './factors.js'

// Returns the annual footprint in kg CO2e, broken down by category.
// profile shape is produced by the onboarding quiz (see Onboarding.jsx).
export function computeFootprint(profile) {
  const p = withDefaults(profile)
  const household = Math.max(1, p.householdSize)

  // Transport
  const carPerKm = FACTORS.car[p.carFuel] ?? 0
  const carAnnual = p.carKmPerWeek * 52 * carPerKm
  const transitAnnual = p.transitKmPerWeek * 52 * FACTORS.publicTransitPerKm
  const flightsAnnual =
    p.flightsShortPerYear * FACTORS.flightShort +
    p.flightsLongPerYear * FACTORS.flightLong
  const transport = carAnnual + transitAnnual + flightsAnnual

  // Diet (personal, not divided)
  const diet = FACTORS.diet[p.dietType] ?? FACTORS.diet.average

  // Home: electricity + heating, shared across household
  const elecAnnual =
    p.electricityKwhPerMonth * 12 *
    FACTORS.electricityPerKwh *
    (1 - p.renewablePct / 100)
  const heatBase = FACTORS.heatingPerYear[p.heatingType] ?? 0
  const heatAnnual = heatBase * (FACTORS.heatingIntensity[p.heatingIntensity] ?? 1)
  const home = (elecAnnual + heatAnnual) / household

  // Goods / shopping
  const goods = FACTORS.shopping[p.shoppingLevel] ?? FACTORS.shopping.medium

  const categories = {
    transport: round(transport),
    diet: round(diet),
    home: round(home),
    goods: round(goods),
  }
  const total = round(
    categories.transport + categories.diet + categories.home + categories.goods
  )

  return { total, categories, perDay: round(total / 365) }
}

export function tonnes(kg) {
  return Math.round((kg / 1000) * 100) / 100
}

function round(n) {
  return Math.round(n)
}

function withDefaults(p = {}) {
  return {
    carKmPerWeek: num(p.carKmPerWeek),
    carFuel: p.carFuel || 'petrol',
    transitKmPerWeek: num(p.transitKmPerWeek),
    flightsShortPerYear: num(p.flightsShortPerYear),
    flightsLongPerYear: num(p.flightsLongPerYear),
    dietType: p.dietType || 'average',
    electricityKwhPerMonth: num(p.electricityKwhPerMonth, 250),
    renewablePct: clamp(num(p.renewablePct), 0, 100),
    heatingType: p.heatingType || 'gas',
    heatingIntensity: p.heatingIntensity || 'medium',
    householdSize: num(p.householdSize, 1),
    shoppingLevel: p.shoppingLevel || 'medium',
  }
}

function num(v, d = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n))
}
