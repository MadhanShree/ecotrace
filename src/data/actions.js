import { FACTORS } from '../lib/factors.js'

// Each action computes its *personalized* annual saving (kg CO2e) from the
// user's profile, so the same action saves different amounts for different
// people. effort is 1 (trivial) to 5 (hard). The app ranks actions by
// impact-per-effort so the highest-leverage, lowest-friction wins surface first.

export const ACTIONS = [
  {
    id: 'short-trips-active',
    title: 'Swap short car trips for biking or walking',
    category: 'transport',
    effort: 2,
    cost: 'free',
    blurb: 'Replace ~20% of your weekly car distance (mostly short trips) with active travel.',
    saving: (p) => {
      const carPerKm = FACTORS.car[p.carFuel] ?? 0
      return p.carKmPerWeek * 52 * carPerKm * 0.2
    },
  },
  {
    id: 'switch-ev',
    title: 'Switch your next car to an EV',
    category: 'transport',
    effort: 5,
    cost: 'high',
    blurb: 'When you next replace your car, going electric cuts per-km emissions dramatically.',
    saving: (p) => {
      const cur = FACTORS.car[p.carFuel] ?? 0
      const delta = Math.max(0, cur - FACTORS.car.ev)
      return p.carKmPerWeek * 52 * delta
    },
    appliesIf: (p) => p.carFuel !== 'ev' && p.carFuel !== 'none' && p.carKmPerWeek > 0,
  },
  {
    id: 'train-not-fly',
    title: 'Replace one short-haul flight with rail',
    category: 'transport',
    effort: 3,
    cost: 'low',
    blurb: 'Trade one short return flight a year for the train where you can.',
    saving: () => FACTORS.flightShort - 30, // train ~30kg
    appliesIf: (p) => p.flightsShortPerYear >= 1,
  },
  {
    id: 'cut-redmeat',
    title: 'Cut red meat to twice a week',
    category: 'diet',
    effort: 2,
    cost: 'free',
    blurb: 'Beef and lamb are the heaviest foods. Dialing them back is the single biggest diet lever.',
    saving: (p) =>
      Math.max(0, (FACTORS.diet[p.dietType] ?? FACTORS.diet.average) - FACTORS.diet.low_meat),
    appliesIf: (p) => ['heavy_meat', 'average'].includes(p.dietType),
  },
  {
    id: 'extra-veg-day',
    title: 'Add one fully plant-based day each week',
    category: 'diet',
    effort: 1,
    cost: 'free',
    blurb: 'One veg day a week is an easy, repeatable win with real impact.',
    saving: (p) => (FACTORS.diet[p.dietType] ?? FACTORS.diet.average) * 0.07,
    appliesIf: (p) => p.dietType !== 'vegan',
  },
  {
    id: 'green-tariff',
    title: 'Move to a renewable electricity tariff',
    category: 'home',
    effort: 1,
    cost: 'low',
    blurb: 'Switching your supplier or tariff to certified renewables zeroes out grid electricity emissions.',
    saving: (p) => {
      const elec =
        p.electricityKwhPerMonth * 12 * FACTORS.electricityPerKwh * (1 - p.renewablePct / 100)
      return elec / Math.max(1, p.householdSize)
    },
    appliesIf: (p) => p.renewablePct < 90,
  },
  {
    id: 'thermostat',
    title: 'Lower heating by 1°C',
    category: 'home',
    effort: 1,
    cost: 'free',
    blurb: 'A single degree on the thermostat trims roughly 6–8% off heating energy.',
    saving: (p) => {
      const heat =
        (FACTORS.heatingPerYear[p.heatingType] ?? 0) *
        (FACTORS.heatingIntensity[p.heatingIntensity] ?? 1)
      return (heat * 0.07) / Math.max(1, p.householdSize)
    },
    appliesIf: (p) => p.heatingType !== 'none',
  },
  {
    id: 'buy-less-new',
    title: 'Buy fewer new clothes & gadgets (and go secondhand)',
    category: 'goods',
    effort: 2,
    cost: 'free',
    blurb: 'Extending the life of what you own and choosing secondhand cuts embodied emissions.',
    saving: (p) => {
      const cur = FACTORS.shopping[p.shoppingLevel] ?? FACTORS.shopping.medium
      const target = p.shoppingLevel === 'high' ? FACTORS.shopping.medium : FACTORS.shopping.low
      return Math.max(0, cur - target)
    },
    appliesIf: (p) => p.shoppingLevel !== 'low',
  },
  {
    id: 'food-waste',
    title: 'Halve your food waste',
    category: 'diet',
    effort: 2,
    cost: 'free',
    blurb: 'Roughly a quarter of food is wasted. Planning meals and using leftovers cuts hidden emissions.',
    saving: (p) => (FACTORS.diet[p.dietType] ?? FACTORS.diet.average) * 0.12,
  },
  {
    id: 'air-dry',
    title: 'Air-dry laundry instead of tumble drying',
    category: 'home',
    effort: 1,
    cost: 'free',
    blurb: 'Skipping the dryer is a small but genuinely free recurring saving.',
    saving: () => 120,
  },
]

// Build a ranked, personalized action list for a given profile.
export function rankedActions(profile) {
  return ACTIONS
    .filter((a) => (a.appliesIf ? a.appliesIf(profile) : true))
    .map((a) => {
      const saving = Math.max(0, Math.round(a.saving(profile)))
      return { ...a, savingKg: saving, score: saving / a.effort }
    })
    .filter((a) => a.savingKg > 0)
    .sort((a, b) => b.score - a.score)
}
