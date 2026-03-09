'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { VERDICT_COLORS } from '@/lib/strategies';
import { StrategyAnalysis } from '@/lib/types';

export default function ScoreGauge({ strategy }: { strategy: StrategyAnalysis }) {
  const score = strategy.investmentScore;
  const color = VERDICT_COLORS[strategy.verdict] ?? '#6b7280';

  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="w-40 h-40 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={[{ value: score, fill: color }]}
            startAngle={225}
            endAngle={-45}
          >
            <PolarAngleAxis type="number" domain={[0, 10]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: '#374151' }} dataKey="value" angleAxisId={0} cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score.toFixed(1)}</span>
          <span className="text-xs text-gray-400">/ 10</span>
        </div>
      </div>
      <div
        className="mt-2 text-sm font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: color + '33', color }}
      >
        {strategy.verdict}
      </div>
    </div>
  );
}
