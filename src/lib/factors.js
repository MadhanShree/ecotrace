// Emission factors (kg CO2e). Figures are rounded, documented in README.md.
// Sources: UK DEFRA 2023 conversion factors, IPCC AR6, Our World in Data,
// Poore & Nemecek (2018) for diet, Scarborough et al. (2014).

export const FACTORS = {
  // --- Transport (kg CO2e per km) ---
  car: {
    petrol: 0.192,
    diesel: 0.171,
    hybrid: 0.120,
    ev: 0.053, // grid-average charging
    none: 0,
  },
  publicTransitPerKm: 0.045, // bus/rail blended
  // Per return trip
  flightShort: 500, // < ~1500 km return
  flightLong: 1800, // long-haul return

  // --- Diet (kg CO2e per year, per person) ---
  diet: {
    heavy_meat: 3300, // meat in most meals
    average: 2500,
    low_meat: 1900,
    vegetarian: 1700,
    vegan: 1500,
  },

  // --- Home energy ---
  electricityPerKwh: 0.40, // global grid average
  heatingPerYear: {
    gas: 1800,
    oil: 2400,
    electric: 1200,
    heat_pump: 600,
    none: 0,
  },
  heatingIntensity: { low: 0.7, medium: 1.0, high: 1.3 },

  // --- Consumption / goods (kg CO2e per year) ---
  shopping: {
    low: 600, // mostly secondhand / minimal new
    medium: 1400,
    high: 2800, // frequent new clothes, gadgets
  },
}

// Benchmarks (tonnes CO2e per person per year)
export const BENCHMARKS = {
  globalAvg: 4.7,
  indiaAvg: 1.9,
  usAvg: 14.4,
  parisTarget2030: 2.3, // ~1.5C-aligned per-capita budget
}
