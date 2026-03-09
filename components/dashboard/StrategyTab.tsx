'use client';

import { StrategyAnalysis } from '@/lib/types';
import { VERDICT_COLORS } from '@/lib/strategies';
import MetricsCards from './MetricsCards';
import ScoreGauge from './ScoreGauge';
import RiskChart from './RiskChart';
import ProjectionChart from './ProjectionChart';

export default function StrategyTab({ strategy }: { strategy: StrategyAnalysis }) {
  const verdictColor = VERDICT_COLORS[strategy.verdict] ?? '#6b7280';

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5">
        <ScoreGauge strategy={strategy} />
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: verdictColor + '22', color: verdictColor }}
            >
              {strategy.verdict}
            </div>
            <p className="text-gray-200 leading-relaxed text-sm">{strategy.summary}</p>
          </div>

          {strategy.cocIsAnnualized && (
            <p className="text-gray-500 text-xs mt-3 border-t border-gray-700 pt-3">
              * Annualized COCR = (Net Profit / Cash Invested) × (12 / Hold Months). Enables apples-to-apples comparison with hold strategies.
            </p>
          )}
        </div>
      </div>

      {/* Universal metrics grid */}
      <MetricsCards strategy={strategy} />

      {/* Section A: Income / Returns — shown as cost breakdown for sell strategies via ProjectionChart */}
      <ProjectionChart strategy={strategy} />

      {/* Risk factors */}
      <RiskChart riskFactors={strategy.riskFactors} />

      {/* Key highlights */}
      {strategy.keyHighlights.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h3 className="text-white font-semibold mb-3">Key Highlights</h3>
          <ul className="space-y-2">
            {strategy.keyHighlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-sky-400 mt-0.5 flex-shrink-0">→</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
