import { useMemo, useState } from 'react'
import { tonnes } from '../lib/calculator.js'
import { BENCHMARKS } from '../lib/factors.js'

const EFFORT_LABEL = { 1: 'Effortless', 2: 'Easy', 3: 'Moderate', 4: 'Committed', 5: 'Big change' }

// The simulator lets the user toggle actions on and watch their projected
// footprint fall in real time, then commit to the set they'll actually do.
export default function Simulator({ footprint, actions, committedIds = [], onCommit }) {
  const [selected, setSelected] = useState(() => new Set(committedIds))

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const saved = useMemo(
    () => actions.filter((a) => selected.has(a.id)).reduce((s, a) => s + a.savingKg, 0),
    [selected, actions]
  )
  const newTotal = Math.max(0, footprint.total - saved)
  const pct = footprint.total ? Math.round((saved / footprint.total) * 100) : 0
  const hitsParis = tonnes(newTotal) <= BENCHMARKS.parisTarget2030

  const committedSet = new Set(committedIds)
  const isUnchanged =
    selected.size === committedSet.size && [...selected].every((id) => committedSet.has(id))

  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Your top moves, ranked by impact</h2>
        <p className="muted" style={{ marginTop: 4 }}>
          Sorted by biggest cut for least effort. Toggle the ones you'll commit to.
        </p>
        <div className="grid" style={{ gridTemplateColumns: '1fr', marginTop: 16 }}>
          {actions.map((a, i) => (
            <label key={a.id} className="action" style={{ cursor: 'pointer' }}>
              <span className="rank">{i + 1}</span>
              <div className="body">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <h3>{a.title}</h3>
                  <span className="save">-{a.savingKg} kg</span>
                </div>
                <p className="muted" style={{ margin: '6px 0 0', fontSize: 14 }}>{a.blurb}</p>
                <div className="tags">
                  <span className="tag">{EFFORT_LABEL[a.effort]}</span>
                  <span className="tag">{a.cost === 'free' ? 'No cost' : a.cost + ' cost'}</span>
                  <span className="tag">{a.category}</span>
                </div>
              </div>
              <input type="checkbox" className="toggle" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
            </label>
          ))}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', alignContent: 'start' }}>
        <div className="card">
          <p className="section-title" style={{ margin: '0 0 6px' }}>Projected footprint</p>
          <div className="sim-result">
            <span className="new">{tonnes(newTotal)}</span>
            <span className="muted">t · was </span>
            <span className="old">{tonnes(footprint.total)} t</span>
          </div>
          <div className="bar"><div style={{ width: `${100 - pct}%` }} /></div>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            {pct > 0
              ? `You'd cut ${pct}% — about ${saved.toLocaleString()} kg CO2e a year.`
              : 'Select actions to see your potential reduction.'}
          </p>
          {hitsParis && pct > 0 && (
            <div style={{ marginTop: 14 }}>
              <span className="pill good">You'd hit the Paris-aligned 2.3 t target</span>
            </div>
          )}
          <button
            className="btn"
            style={{ marginTop: 16, width: '100%' }}
            disabled={selected.size === 0 || isUnchanged}
            onClick={() => onCommit?.([...selected])}
          >
            {committedIds.length && isUnchanged
              ? 'Plan saved'
              : committedIds.length
                ? 'Update my plan'
                : `Commit to ${selected.size || ''} action${selected.size === 1 ? '' : 's'}`.replace('  ', ' ').trim()}
          </button>
        </div>

        <div className="card">
          <div className="grid grid-3">
            <Stat n={selected.size} l="actions chosen" />
            <Stat n={`${pct}%`} l="footprint cut" />
            <Stat n={equivalentTrees(saved)} l="trees / year*" />
          </div>
          <p className="footnote" style={{ marginTop: 14 }}>
            *Rough equivalence: a mature tree absorbs ~21 kg CO2 per year. Use it as an intuition pump, not an offset claim.
          </p>
        </div>
      </div>
    </div>
  )
}

function Stat({ n, l }) {
  return <div className="stat"><div className="n">{n}</div><div className="l">{l}</div></div>
}
function equivalentTrees(savedKg) {
  return Math.round(savedKg / 21)
}
