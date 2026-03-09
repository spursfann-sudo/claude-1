'use client';

import { StrategyAnalysis } from '@/lib/types';

function fmt(n: number | undefined | null, opts: Intl.NumberFormatOptions = {}): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', opts).format(n);
}

function money(n: number | undefined | null) {
  return fmt(n, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function pct(n: number | undefined | null) {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  tooltip?: string;
}

function Card({ label, value, sub, highlight, tooltip }: CardProps) {
  return (
    <div
      className={`rounded-xl p-4 ${highlight ? 'bg-sky-900/40 border border-sky-700' : 'bg-gray-800 border border-gray-700'}`}
      title={tooltip}
    >
      <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-sky-300' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function MetricsCards({ strategy }: { strategy: StrategyAnalysis }) {
  const s = strategy;
  const id = s.strategyId;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {/* Universal cards */}
      <Card
        label={s.cocIsAnnualized ? 'Annualized COCR *' : 'Cash-on-Cash Return'}
        value={pct(s.cashOnCashReturn)}
        sub={s.cocIsAnnualized ? 'Annualized' : 'Annual'}
        highlight
        tooltip={
          s.cocIsAnnualized
            ? 'Annualized COCR = (Net Profit / Cash Invested) × (12 / Hold Months). Enables apples-to-apples comparison with hold strategies.'
            : 'Annual Net Income / Total Cash Invested'
        }
      />
      <Card label="Total Cash Invested" value={money(s.totalCashInvested)} sub="Out of pocket" />
      <Card
        label="Investment Score"
        value={`${s.investmentScore.toFixed(1)} / 10`}
        sub={s.verdict}
      />

      {/* Hold strategy metrics */}
      {(id === 'turnkey_rental' || id === 'brrrr' || id === 'str' || id === 'buy_hold') && (
        <>
          {s.grossAnnualIncome != null && (
            <Card label="Gross Annual Income" value={money(s.grossAnnualIncome)} />
          )}
          {s.annualNetIncome != null && (
            <Card label="Annual Net Income" value={money(s.annualNetIncome)} />
          )}
          {s.monthlyNetIncome != null && (
            <Card label="Monthly Net Income" value={money(s.monthlyNetIncome)} />
          )}
          {s.capRate != null && (
            <Card label="Cap Rate" value={pct(s.capRate)} sub="NOI / Price" />
          )}
          {s.grossRentMultiplier != null && (
            <Card label="Gross Rent Multiplier" value={s.grossRentMultiplier.toFixed(1) + 'x'} />
          )}
        </>
      )}

      {/* BRRRR-specific */}
      {id === 'brrrr' && (
        <>
          {s.remainingCashPostRefi != null && (
            <Card label="Remaining Cash (Post-Refi)" value={money(s.remainingCashPostRefi)} sub="Cash left in deal" />
          )}
          {s.equityCaptured != null && (
            <Card label="Equity Captured" value={money(s.equityCaptured)} sub="Pulled via refi" />
          )}
        </>
      )}

      {/* STR-specific */}
      {id === 'str' && (
        <>
          {s.avgDailyRate != null && (
            <Card label="Avg Daily Rate" value={money(s.avgDailyRate)} />
          )}
          {s.occupancyRate != null && (
            <Card label="Occupancy Rate" value={pct(s.occupancyRate)} />
          )}
          {s.revPAR != null && (
            <Card label="RevPAR" value={money(s.revPAR)} sub="Revenue per available night" />
          )}
        </>
      )}

      {/* Sell strategy metrics */}
      {(id === 'fix_flip' || id === 'wholesale') && (
        <>
          {s.projectedArv != null && (
            <Card label="Projected ARV" value={money(s.projectedArv)} sub="After Repair Value" />
          )}
          {s.netProfit != null && (
            <Card label="Net Profit" value={money(s.netProfit)} highlight />
          )}
          {s.holdPeriodMonths != null && (
            <Card label="Hold Period" value={`${s.holdPeriodMonths} months`} />
          )}
        </>
      )}

      {/* Wholesale-specific */}
      {id === 'wholesale' && (
        <>
          {s.maxAllowableOffer != null && (
            <Card label="Max Allowable Offer" value={money(s.maxAllowableOffer)} sub="70% rule MAO" />
          )}
          {s.assignmentFee != null && (
            <Card label="Assignment Fee" value={money(s.assignmentFee)} />
          )}
        </>
      )}
    </div>
  );
}
