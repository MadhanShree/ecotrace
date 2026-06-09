import { useState } from 'react'

const STEPS = ['Transport', 'Diet', 'Home', 'Lifestyle']

export default function Onboarding({ initial, onComplete }) {
  const [step, setStep] = useState(0)
  const [p, setP] = useState(
    initial || {
      carKmPerWeek: 120,
      carFuel: 'petrol',
      transitKmPerWeek: 20,
      flightsShortPerYear: 1,
      flightsLongPerYear: 0,
      dietType: 'average',
      electricityKwhPerMonth: 250,
      renewablePct: 0,
      heatingType: 'gas',
      heatingIntensity: 'medium',
      householdSize: 2,
      shoppingLevel: 'medium',
    }
  )
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }))
  const last = step === STEPS.length - 1

  return (
    <div className="quiz">
      <div className="progress">
        <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <p className="muted" style={{ marginTop: 0 }}>
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      {step === 0 && (
        <div>
          <h2>How do you get around?</h2>
          <p className="muted">Rough weekly numbers are fine — you can refine later.</p>
          <Number label="Car distance per week" hint="km" value={p.carKmPerWeek} onChange={(v) => set('carKmPerWeek', v)} />
          <Choice label="Car fuel type" value={p.carFuel} onChange={(v) => set('carFuel', v)}
            options={[['petrol','Petrol'],['diesel','Diesel'],['hybrid','Hybrid'],['ev','Electric'],['none','No car']]} />
          <Number label="Public transport per week" hint="km" value={p.transitKmPerWeek} onChange={(v) => set('transitKmPerWeek', v)} />
          <div className="row">
            <Number label="Short flights / year" hint="return trips" value={p.flightsShortPerYear} onChange={(v) => set('flightsShortPerYear', v)} />
            <Number label="Long flights / year" hint="return trips" value={p.flightsLongPerYear} onChange={(v) => set('flightsLongPerYear', v)} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2>What does your plate look like?</h2>
          <p className="muted">Pick the closest match to your typical week.</p>
          <Choice label="Diet" value={p.dietType} onChange={(v) => set('dietType', v)}
            options={[['heavy_meat','Meat with most meals'],['average','Average mix'],['low_meat','Light on meat'],['vegetarian','Vegetarian'],['vegan','Vegan']]} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Your home energy</h2>
          <Number label="Electricity use per month" hint="kWh — check a recent bill, or leave the estimate" value={p.electricityKwhPerMonth} onChange={(v) => set('electricityKwhPerMonth', v)} />
          <div className="field">
            <label>Share of renewable electricity <span className="hint">{p.renewablePct}%</span></label>
            <input type="range" min="0" max="100" step="5" value={p.renewablePct} onChange={(e) => set('renewablePct', Number(e.target.value))} />
          </div>
          <Choice label="Main heating" value={p.heatingType} onChange={(v) => set('heatingType', v)}
            options={[['gas','Gas'],['oil','Oil'],['electric','Electric'],['heat_pump','Heat pump'],['none','None']]} />
          <Choice label="Heating intensity" value={p.heatingIntensity} onChange={(v) => set('heatingIntensity', v)}
            options={[['low','Low'],['medium','Medium'],['high','High']]} />
          <Number label="People in your household" value={p.householdSize} onChange={(v) => set('householdSize', v)} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Shopping & stuff</h2>
          <p className="muted">How often do you buy new clothes, gadgets, and household goods?</p>
          <Choice label="Shopping level" value={p.shoppingLevel} onChange={(v) => set('shoppingLevel', v)}
            options={[['low','Minimal / mostly secondhand'],['medium','Average'],['high','I shop a lot']]} />
        </div>
      )}

      <div className="nav">
        <button className="btn secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
        {last
          ? <button className="btn" onClick={() => onComplete(p)}>See my footprint →</button>
          : <button className="btn" onClick={() => setStep((s) => s + 1)}>Next</button>}
      </div>
    </div>
  )
}

function Number({ label, hint, value, onChange }) {
  return (
    <div className="field">
      <label>{label} {hint && <span className="hint">({hint})</span>}</label>
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function Choice({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="choices">
        {options.map(([val, text]) => (
          <button key={val} type="button"
            className={`choice ${value === val ? 'active' : ''}`}
            onClick={() => onChange(val)}>{text}</button>
        ))}
      </div>
    </div>
  )
}
