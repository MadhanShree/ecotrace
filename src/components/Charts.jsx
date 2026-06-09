// Recharts is the largest dependency. Isolating the charts here lets App
// lazy-load this module so it stays out of the initial JS chunk and the first
// paint is faster — which matters for the public mobile demo link.
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import { tonnes } from '../lib/calculator.js'

export function BreakdownDonut({ data, colors }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((d) => <Cell key={d.key} fill={colors[d.key]} />)}
        </Pie>
        <Tooltip formatter={(v) => `${tonnes(v)} t`} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function BenchmarkBars({ data }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={78} tickLine={false} axisLine={false} style={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${v} t`} cursor={{ fill: '#f0f4f1' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.me ? '#16a34a' : '#cbd5cf'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
