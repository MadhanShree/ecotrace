import { tonnes } from './calculator.js'
import { BENCHMARKS } from './factors.js'

/**
 * @typedef {Object} Coach
 * @property {string} text   The coaching message shown to the user.
 * @property {'gemini'|'local'} source Where the message came from.
 */

/**
 * Produce a short, personalized coaching message. Uses Google Gemini when an
 * API key is configured, and always falls back to a deterministic local coach
 * so the app stays fully functional without a key or network.
 *
 * @param {{ footprint: import('./calculator.js').Footprint, topActions: Array<{title:string,savingKg:number}> }} input
 * @returns {Promise<Coach>} The coaching message and its source.
 */
export async function getCoachMessage({ footprint, topActions }) {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (key) {
    try {
      return await geminiCoach({ footprint, topActions, key })
    } catch (e) {
      // Fall back to the local coach on any error (bad key, network, quota).
      if (import.meta.env.DEV) {
        console.warn('Gemini unavailable, using local coach:', e.message)
      }
    }
  }
  return localCoach({ footprint, topActions })
}

/**
 * Call the Gemini API for a coaching message.
 * @param {{ footprint: object, topActions: Array, key: string }} input
 * @returns {Promise<Coach>}
 */
async function geminiCoach({ footprint, topActions, key }) {
  const model = 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const actionList = topActions
    .map((a) => `- ${a.title} (~${a.savingKg} kg/yr)`)
    .join('\n')
  const prompt = `You are a warm, practical climate coach. The user's annual carbon footprint is ${tonnes(
    footprint.total
  )} tonnes CO2e (global average is ${BENCHMARKS.globalAvg} t, Paris-aligned target is ${
    BENCHMARKS.parisTarget2030
  } t).
Their biggest category is ${biggestCategory(footprint)}.
Their highest-leverage actions are:
${actionList}

Write 2-3 short, encouraging sentences. Lead with one concrete thing to do this week. No preamble, no lists, no emojis.`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) throw new Error('empty response')
  return { text, source: 'gemini' }
}

/**
 * Deterministic, rules-based coaching message used as a fallback.
 * @param {{ footprint: object, topActions: Array }} input
 * @returns {Coach}
 */
function localCoach({ footprint, topActions }) {
  const t = tonnes(footprint.total)
  const top = topActions[0]
  const vsAvg = t <= BENCHMARKS.globalAvg
  const lead = top
    ? `Start this week with one move: ${lower(top.title)}. On your numbers that's about ${top.savingKg} kg of CO2e a year for very little effort.`
    : `You're already running lean, so keep the habits that got you here.`
  const context = vsAvg
    ? `You're at ${t} t, already below the ${BENCHMARKS.globalAvg} t global average.`
    : `You're at ${t} t, above the ${BENCHMARKS.globalAvg} t global average, so there's real room to move.`
  const close = `Stack two or three of your top actions and the ${BENCHMARKS.parisTarget2030} t Paris-aligned target is genuinely in reach.`
  return { text: `${context} ${lead} ${close}`, source: 'local' }
}

/**
 * Return the key of the largest-emitting category.
 * @param {{ categories: Record<string, number> }} footprint
 * @returns {string} The category key.
 */
function biggestCategory(footprint) {
  return Object.entries(footprint.categories).sort((a, b) => b[1] - a[1])[0][0]
}

/** @param {string} s @returns {string} The string with a lower-cased first letter. */
function lower(s) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}
