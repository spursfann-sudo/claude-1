'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { StrategyAnalysis } from '@/lib/types';

function money(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function HoldProjection({ strategy }: { strategy: StrategyAnalysis }) {
  const projections = strategy.valueProjections;
  if (!projections?.length) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-white font-semibold mb-4">Value &amp; Return Projections</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={projections} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={false}
            label={{ value: 'Year', position: 'insideBottom', offset: -4, fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
            formatter={(v: number, name: string) => [money(v), name]}
          />
          <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="estimatedValue"
            name="Estimated Value"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cumulativeTotalReturn"
            name="Cumulative Return"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CostVsArvChart({ strategy }: { strategy: StrategyAnalysis }) {
  const cb = strategy.costBreakdown;
  if (!cb) return null;

  const segments = [
    { name: 'Acquisition', value: cb.acquisitionCost, color: '#0ea5e9' },
    ...(cb.renovationCost ? [{ name: 'Renovation', value: cb.renovationCost, color: '#8b5cf6' }] : []),
    ...(cb.carryCosts ? [{ name: 'Carry Costs', value: cb.carryCosts, color: '#f59e0b' }] : []),
    ...(cb.transactionCosts ? [{ name: 'Transaction', value: cb.transactionCosts, color: '#6b7280' }] : []),
  ];

  const data = [
    ...segments.map((s) => ({ name: s.name, value: s.value, color: s.color })),
    {
      name: 'ARV / Sale Price',
      value: strategy.projectedArv ?? cb.totalProjectCost,
      color: '#10b981',
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h3 className="text-white font-semibold mb-1">Cost Breakdown vs. ARV</h3>
      <p className="text-gray-400 text-xs mb-4">
        Total Project Cost: {money(cb.totalProjectCost)}
        {strategy.netProfit != null && (
          <span className="ml-2 text-green-400 font-medium">
            → Net Profit: {money(strategy.netProfit)}
          </span>
        )}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
            formatter={(v: number) => [money(v)]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ProjectionChart({ strategy }: { strategy: StrategyAnalysis }) {
  const isHold = ['turnkey_rental', 'brrrr', 'str', 'buy_hold'].includes(strategy.strategyId);
  if (isHold) return <HoldProjection strategy={strategy} />;
  return <CostVsArvChart strategy={strategy} />;
}
