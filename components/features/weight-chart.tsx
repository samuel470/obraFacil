'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" fontSize={12} />
          <YAxis fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#6EC6A8" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
