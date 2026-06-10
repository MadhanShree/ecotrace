import { lazy, Suspense, useEffect, useState } from 'react'
import { tonnes } from '../lib/calculator.js'
import { BENCHMARKS } from '../lib/factors.js'
import { getCoachMessage } from '../lib/ai.js'
import ShareCard from './ShareCard.jsx'

// Charts (and their heavy Recharts dependency) load lazily so they stay out
// of the initial bundle and the first paint is fast.
const Charts = lazy(() =>
  import('./Charts.jsx').then((m) => ({
    default: function Bundle(props) {
      return props.which === 'donut'
        ? <m.BreakdownDonut {...props} />
        : <m.BenchmarkBars {...props} />
    },
  }))
)

const CAT_COLORS = { transport: '#2563eb', diet: '#d97706', home: '#16a34a', goods: '#7c3aed' }
const CAT_LABELS = { transport: 'Transport', diet: 'Diet', home: 'Home energy', goods: 'Goods & shopping' }

/**
 * Results dashboard: hero footprint, category donut, AI coach nudge, benchmark comparison, and the share card.
 * @param {{footprint:object, topActions:Array, committedSavingKg?:number}} props
 */
export default function Dashboard({ footprint, topActions, committedSavingKg = 0 }) {
  const t = tonnes(footprint.total)
  const belowAvg = t <= BENCHMARKS.globalAvg
  const pieData = Object.entries(footprint.categories).map(([k, v]) => ({ name: CAT_LABELS[k], key: k, value: v }))
  const benchData = [
    { name: 'You', value: t, me: true },
    { name: 'Global avg', value: BENCHMARKS.globalAvg },
    { name: 'Paris 2030', value: BENCHMARKS.parisTarget2030 },
    { name: 'US avg', value: BENCHMARKS.usAvg },
  ]

  const [coach, setCoach] = useState(null)
  useEffect(() => {
    let active = true
    getCoachMessage({ footprint, topActions }).then((c) => active && setCoach(c))
    return () => { active = false }
  }, [footprint, topActions])

  return (
    <div className="grid grid-2">
      <div className="card">
        <p className="section-title" style={{ margin: '0 0 10px' }}>Your annual footprint</p>
        <div className="hero-num">{t}<span>t CO2e / year</span></div>
        <div style={{ marginTop: 12 }}>
          <span className={`pill ${belowAvg ? 'good' : 'warn'}`}>
            {belowAvg
              ? `Below the ${BENCHMARKS.globalAvg} t global average`
              : `Above the ${BENCHMARKS.globalAvg} t global average`}
          </span>
        </div>

        <div style={{ height: 200, marginTop: 18 }}>
          <Suspense fallback={<ChartLoading />}>
            <Charts which="donut" data={pieData} colors={CAT_COLORS} />
          </Suspense>
        </div>
        <div className="legend">
          {pieData.map((d) => (
            <span key={d.key}><i style={{ background: CAT_COLORS[d.key] }} />{d.name} · {tonnes(d.value)} t</span>
          ))}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card coach">
          <p className="src">{coach?.source === 'gemini' ? 'AI coach · Gemini' : 'Your coach'}</p>
          <h2>This week's nudge</h2>
          <p style={{ margin: '8px 0 0' }}>{coach ? coach.text : 'Reading your numbers…'}</p>
        </div>
        <div className="card">
          <h2>How you compare</h2>
          <div style={{ height: 170, marginTop: 8 }}>
            <Suspense fallback={<ChartLoading />}>
              <Charts which="bars" data={benchData} />
            </Suspense>
          </div>
        </div>
        <ShareCard footprint={footprint} committedSavingKg={committedSavingKg} />
      </div>
    </div>
  )
}

function ChartLoading() {
  return <div className="muted" style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: 13 }}>Loading chart…</div>
}
