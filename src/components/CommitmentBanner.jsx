import { daysAgoLabel, daysSince } from '../lib/commitments.js'

// The "track" half of the product: shows the user what they committed to,
// how long ago, and lets them check in. Renders nothing if no commitment.
export default function CommitmentBanner({ commitment, actions, onCheckIn, onClear }) {
  if (!commitment) return null

  const chosen = actions.filter((a) => commitment.actionIds.includes(a.id))
  const savedKg = chosen.reduce((s, a) => s + a.savingKg, 0)
  const streakDays = daysSince(commitment.committedAt)
  const checkedToday = commitment.lastCheckIn && daysSince(commitment.lastCheckIn) === 0

  return (
    <div className="card commit-banner">
      <div className="commit-head">
        <div>
          <p className="section-title" style={{ margin: 0 }}>Your plan · in progress</p>
          <h2 style={{ marginTop: 4 }}>
            {chosen.length} action{chosen.length > 1 ? 's' : ''} · ~{savedKg.toLocaleString()} kg CO₂e / yr
          </h2>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
            Committed {daysAgoLabel(commitment.committedAt)}
            {commitment.checkInCount > 0 && ` · ${commitment.checkInCount} check-in${commitment.checkInCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="commit-actions">
          <button className="btn" onClick={onCheckIn} disabled={checkedToday}>
            {checkedToday ? 'Checked in ✓' : 'Check in'}
          </button>
          <button className="ghost-btn" onClick={onClear}>Clear</button>
        </div>
      </div>
      <div className="commit-list">
        {chosen.map((a) => (
          <span key={a.id} className="tag">{a.title}</span>
        ))}
      </div>
      {streakDays >= 1 && (
        <p className="muted" style={{ margin: '10px 0 0', fontSize: 13 }}>
          You've been at this for {streakDays} day{streakDays > 1 ? 's' : ''}. Small, steady changes compound — keep going.
        </p>
      )}
    </div>
  )
}
