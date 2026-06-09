import { tonnes } from './calculator.js'
import { BENCHMARKS } from './factors.js'

// Personalized coaching message. Uses Google Gemini when a key is provided,
// otherwise falls back to a deterministic rules-based message so the app is
// always fully functional for evaluation (and if the API call fails).
export async function getCoachMessage({ footprint, topActions }) {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (key) {
    try {
      return await geminiCoach({ footprint, topActions, key })
    } catch (e) {
      // Falls through to the local coach on any error (bad key, network, quota).
      console.warn('Gemini unavailable, using local coach:', e.message)
    }
  }
  return localCoach({ footprint, topActions })
}

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

function biggestCategory(footprint) {
  return Object.entries(footprint.categories).sort((a, b) => b[1] - a[1])[0][0]
}
function lower(s) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}
