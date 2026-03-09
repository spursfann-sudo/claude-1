'use client';

import { StrategyAnalysis } from '@/lib/types';
import { VERDICT_COLORS } from '@/lib/strategies';

function money(n: number | null | undefined) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function pct(n: number | null | undefined, annualized?: boolean) {
  if (n == null) return '—';
  return `${n.toFixed(1)}%${annualized ? '*' : ''}`;
}

export default function ComparisonTab({ strategies }: { strategies: StrategyAnalysis[] }) {
  if (strategies.length < 2) return null;

  const metrics: { label: string; render: (s: StrategyAnalysis) => string }[] = [
    { label: 'Investment Score', render: (s) => `${s.investmentScore.toFixed(1)} / 10` },
    { label: 'Verdict', render: (s) => s.verdict },
    { label: 'COCR', render: (s) => pct(s.cashOnCashReturn, s.cocIsAnnualized) },
    { label: 'Total Cash Invested', render: (s) => money(s.totalCashInvested) },
    { label: 'Monthly Net Income', render: (s) => money(s.monthlyNetIncome) },
    { label: 'Annual Net Income', render: (s) => money(s.annualNetIncome) },
    { label: 'Cap Rate', render: (s) => pct(s.capRate) },
    { label: 'Net Profit', render: (s) => money(s.netProfit) },
    { label: 'Projected ARV', render: (s) => money(s.projectedArv) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">Strategy Comparison</h3>
        <p className="text-gray-400 text-sm">
          Side-by-side metrics anchored on universal COCR and Investment Score.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 pr-4 text-gray-400 font-medium w-40">Metric</th>
              {strategies.map((s) => (
                <th key={s.strategyId} className="text-left py-3 px-3 text-white font-semibold">
                  {s.strategyName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.label} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="py-3 pr-4 text-gray-400">{metric.label}</td>
                {strategies.map((s) => {
                  const value = metric.render(s);
                  const isVerdict = metric.label === 'Verdict';
                  const color = isVerdict ? (VERDICT_COLORS[value] ?? '#9ca3af') : undefined;
                  return (
                    <td
                      key={s.strategyId}
                      className="py-3 px-3 font-medium"
                      style={{ color: color ?? (value === '—' ? '#6b7280' : '#e5e7eb') }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {strategies.some((s) => s.cocIsAnnualized) && (
        <p className="text-gray-500 text-xs">
          * Annualized COCR — comparable to hold strategy COCR on an annual basis.
        </p>
      )}
    </div>
  );
}
