import { useState } from 'react'
import { tonnes } from '../lib/calculator.js'
import { APP_URL, REPO_URL } from '../config.js'

// Ties the live product to the contest's LinkedIn submission artifact.
/**
 * Share card with a LinkedIn deep-link and a copyable, pre-filled caption.
 * @param {{footprint:object, committedSavingKg?:number}} props
 */
export default function ShareCard({ footprint, committedSavingKg = 0 }) {
  const [copied, setCopied] = useState(false)
  const t = tonnes(footprint.total)
  const savedLine = committedSavingKg > 0
    ? ` I've committed to changes that cut about ${committedSavingKg.toLocaleString()} kg CO₂e a year.`
    : ''

  const caption =
    `My annual carbon footprint is ${t} tonnes CO₂e.${savedLine} ` +
    `I mapped it and found my highest-impact actions with EcoTrace — try it: ${APP_URL} ` +
    `(open source: ${REPO_URL}) #sustainability #climateaction #PromptWars`

  const linkedInUrl =
    'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(APP_URL)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — user can still use the button below */
    }
  }

  return (
    <div className="card">
      <h2>Share your result</h2>
      <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
        Post your footprint to LinkedIn — and copy a ready-made caption.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <a className="btn" href={linkedInUrl} target="_blank" rel="noreferrer">Share on LinkedIn</a>
        <button className="btn secondary" onClick={copy}>{copied ? 'Copied!' : 'Copy caption'}</button>
      </div>
      <p className="footnote" style={{ marginTop: 14 }}>{caption}</p>
    </div>
  )
}
