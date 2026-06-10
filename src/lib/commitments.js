// Lightweight persistence for the "track" half of the product: the set of
// actions a user has committed to, when they committed, and their check-ins.

const KEY = 'ecotrace.commitment.v1'

/**
 * Load the saved commitment from localStorage, guarding against malformed data.
 * @returns {{actionIds:string[],committedAt:number,lastCheckIn:number|null,checkInCount:number}|null}
 */
export function loadCommitment() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const c = JSON.parse(raw)
    // Guard against malformed / stale shapes.
    if (!c || !Array.isArray(c.actionIds) || !c.actionIds.length) return null
    if (!Number.isFinite(c.committedAt)) return null
    return {
      actionIds: c.actionIds,
      committedAt: c.committedAt,
      lastCheckIn: Number.isFinite(c.lastCheckIn) ? c.lastCheckIn : null,
      checkInCount: Number.isFinite(c.checkInCount) ? c.checkInCount : 0,
    }
  } catch {
    return null
  }
}

/**
 * Persist a commitment to localStorage.
 * @param {object} c The commitment to save.
 */
export function saveCommitment(c) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* storage unavailable — non-fatal */
  }
}

/** Remove any saved commitment from localStorage. */
export function clearCommitment() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Whole days elapsed since a timestamp.
 * @param {number} ts A millisecond timestamp.
 * @returns {number} Days since `ts` (0 for today or invalid input).
 */
export function daysSince(ts) {
  if (!Number.isFinite(ts)) return 0
  const d = Math.floor((Date.now() - ts) / 86_400_000)
  return d > 0 ? d : 0
}

/**
 * A friendly relative label for a timestamp ("today", "yesterday", "3 days ago").
 * @param {number} ts A millisecond timestamp.
 * @returns {string}
 */
export function daysAgoLabel(ts) {
  const d = daysSince(ts)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d} days ago`
}
