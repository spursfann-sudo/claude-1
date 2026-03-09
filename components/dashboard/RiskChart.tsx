'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RiskFactor } from '@/lib/types';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const SEVERITY_VALUES: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export default function RiskChart({ riskFactors }: { riskFactors: RiskFactor[] }) {
  if (!riskFactors.length) return null;

  const data = riskFactors.map((r) => ({
    factor: r.factor.length > 22 ? r.factor.slice(0, 22) + '…' : r.factor,
    fullFactor: r.factor,
    value: SEVERITY_VALUES[r.severity],
    severity: r.severity,
    description: r.description,
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-white font-semibold mb-4">Risk Factors</h3>
      <ResponsiveContainer width="100%" height={data.length * 44 + 20}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 3]} hide />
          <YAxis
            type="category"
            dataKey="factor"
            width={160}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: '#374151' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-w-xs text-sm">
                  <div className="font-semibold text-white mb-1">{d.fullFactor}</div>
                  <div
                    className="text-xs font-medium mb-1 capitalize"
                    style={{ color: SEVERITY_COLORS[d.severity] }}
                  >
                    {d.severity} severity
                  </div>
                  <div className="text-gray-400">{d.description}</div>
                </div>
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={SEVERITY_COLORS[entry.severity]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-3">
        {(['low', 'medium', 'high'] as const).map((sev) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[sev] }} />
            <span className="text-xs text-gray-400 capitalize">{sev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
