import { useEffect, useMemo, useState } from 'react'
import Onboarding from './components/Onboarding.jsx'
import Dashboard from './components/Dashboard.jsx'
import Simulator from './components/Simulator.jsx'
import CommitmentBanner from './components/CommitmentBanner.jsx'
import { computeFootprint } from './lib/calculator.js'
import { rankedActions } from './data/actions.js'
import { loadCommitment, saveCommitment, clearCommitment } from './lib/commitments.js'

const STORAGE_KEY = 'ecotrace.profile.v1'

export default function App() {
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [editing, setEditing] = useState(false)
  const [commitment, setCommitment] = useState(() => loadCommitment())

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const footprint = useMemo(() => (profile ? computeFootprint(profile) : null), [profile])
  const actions = useMemo(() => (profile ? rankedActions(normalize(profile)) : []), [profile])

  const committedSavingKg = useMemo(() => {
    if (!commitment) return 0
    return actions
      .filter((a) => commitment.actionIds.includes(a.id))
      .reduce((s, a) => s + a.savingKg, 0)
  }, [commitment, actions])

  const showQuiz = !profile || editing

  const handleComplete = (p) => {
    setProfile(p)
    setEditing(false)
  }

  const commitTo = (ids) => {
    const c = { actionIds: ids, committedAt: Date.now(), lastCheckIn: null, checkInCount: 0 }
    setCommitment(c)
    saveCommitment(c)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const checkIn = () => {
    setCommitment((prev) => {
      if (!prev) return prev
      const next = { ...prev, lastCheckIn: Date.now(), checkInCount: prev.checkInCount + 1 }
      saveCommitment(next)
      return next
    })
  }
  const clearPlan = () => {
    setCommitment(null)
    clearCommitment()
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="dot">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6" />
            </svg>
          </span>
          EcoTrace
        </div>
        {profile && !editing && (
          <button className="ghost-btn" onClick={() => setEditing(true)}>Update answers</button>
        )}
      </header>

      {showQuiz && (
        <div className="card">
          <div className="center" style={{ maxWidth: 560, margin: '0 auto 26px' }}>
            <h1>{profile ? 'Update your details' : 'Know your footprint. Then shrink it.'}</h1>
            <p className="muted">
              {profile
                ? 'Tweak anything below and recalculate, and your plan stays intact.'
                : 'Answer a few quick questions to see where your carbon comes from, then act on the highest-impact, lowest-effort changes.'}
            </p>
          </div>
          <Onboarding initial={profile || undefined} onComplete={handleComplete} />
          {editing && (
            <div className="center" style={{ marginTop: 16 }}>
              <button className="btn secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>
      )}

      {profile && footprint && !editing && (
        <>
          <CommitmentBanner
            commitment={commitment}
            actions={actions}
            onCheckIn={checkIn}
            onClear={clearPlan}
          />
          <Dashboard footprint={footprint} topActions={actions.slice(0, 3)} committedSavingKg={committedSavingKg} />
          <p className="section-title">What if you changed a few things?</p>
          <Simulator
            footprint={footprint}
            actions={actions}
            committedIds={commitment?.actionIds || []}
            onCommit={commitTo}
          />
          <p className="footnote">
            EcoTrace gives directional estimates from published average emission factors, not an audited
            inventory. Numbers are designed to help you compare choices and prioritize. See the README for
            methodology and sources.
          </p>
        </>
      )}
    </div>
  )
}

// Onboarding stores numeric fields as strings from inputs; normalize for actions.
function normalize(p) {
  return {
    ...p,
    carKmPerWeek: Number(p.carKmPerWeek) || 0,
    transitKmPerWeek: Number(p.transitKmPerWeek) || 0,
    flightsShortPerYear: Number(p.flightsShortPerYear) || 0,
    flightsLongPerYear: Number(p.flightsLongPerYear) || 0,
    electricityKwhPerMonth: Number(p.electricityKwhPerMonth) || 0,
    renewablePct: Number(p.renewablePct) || 0,
    householdSize: Number(p.householdSize) || 1,
  }
}
