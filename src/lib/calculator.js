import { FACTORS } from './factors.js'

/**
 * @typedef {Object} Profile
 * @property {number} carKmPerWeek        Weekly car distance in km.
 * @property {string} carFuel             One of petrol|diesel|hybrid|ev|none.
 * @property {number} transitKmPerWeek    Weekly public-transport distance in km.
 * @property {number} flightsShortPerYear Short-haul return flights per year.
 * @property {number} flightsLongPerYear  Long-haul return flights per year.
 * @property {string} dietType            One of heavy_meat|average|low_meat|vegetarian|vegan.
 * @property {number} electricityKwhPerMonth Monthly grid electricity in kWh.
 * @property {number} renewablePct        Share of electricity from renewables (0-100).
 * @property {string} heatingType         One of gas|oil|electric|heat_pump|none.
 * @property {string} heatingIntensity    One of low|medium|high.
 * @property {number} householdSize       Number of people sharing home energy.
 * @property {string} shoppingLevel       One of low|medium|high.
 */

/**
 * @typedef {Object} Footprint
 * @property {number} total   Annual footprint in kg CO2e.
 * @property {{transport:number,diet:number,home:number,goods:number}} categories Per-category kg CO2e.
 * @property {number} perDay  Average daily footprint in kg CO2e.
 */

/**
 * Compute a person's annual carbon footprint from their profile.
 * Missing fields fall back to sensible defaults.
 *
 * @param {Partial<Profile>} profile Raw answers from the onboarding quiz.
 * @returns {Footprint} The total and per-category annual footprint.
 */
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

  // Diet (personal, not divided across the household)
  const diet = FACTORS.diet[p.dietType] ?? FACTORS.diet.average

  // Home: electricity + heating, shared across the household
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

/**
 * Convert kilograms of CO2e to tonnes, rounded to two decimals.
 * @param {number} kg Kilograms of CO2e.
 * @returns {number} Tonnes of CO2e.
 */
export function tonnes(kg) {
  return Math.round((kg / 1000) * 100) / 100
}

/** @param {number} n @returns {number} n rounded to the nearest integer. */
function round(n) {
  return Math.round(n)
}

/**
 * Fill a partial profile with defaults and coerce numeric fields.
 * @param {Partial<Profile>} [p] Raw profile.
 * @returns {Profile} A complete, normalized profile.
 */
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

/** @param {*} v @param {number} [d=0] @returns {number} A finite number or the default. */
function num(v, d = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

/** @param {number} n @param {number} lo @param {number} hi @returns {number} n clamped to [lo, hi]. */
function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n))
}
