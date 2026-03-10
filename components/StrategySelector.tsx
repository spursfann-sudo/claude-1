'use client';

import { useState } from 'react';
import { PropertyData, StrategyId, StrategyInputs } from '@/lib/types';
import { STRATEGIES, StrategyDefinition } from '@/lib/strategies';

interface Props {
  propertyData: PropertyData;
  onSubmit: (strategies: StrategyInputs[]) => void;
}

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex items-center bg-gray-900 rounded-lg border border-gray-600 focus-within:border-sky-500 transition-colors">
        {prefix && <span className="px-2 text-gray-500 text-xs border-r border-gray-600">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white px-2 py-2 text-sm focus:outline-none"
        />
        {suffix && <span className="px-2 text-gray-500 text-xs border-l border-gray-600">{suffix}</span>}
      </div>
    </div>
  );
}

function StrategyCard({
  strategy,
  selected,
  onToggle,
  inputs,
  onInputChange,
}: {
  strategy: StrategyDefinition;
  selected: boolean;
  onToggle: () => void;
  inputs: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
}) {
  const isHold = strategy.superStrategy === 'Acquire & Hold';

  return (
    <div
      className={`rounded-xl border-2 transition-all cursor-pointer ${
        selected ? 'border-sky-500 bg-gray-800' : 'border-gray-700 bg-gray-900 hover:border-gray-500'
      }`}
    >
      <div className="p-4" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: strategy.color }}
              />
              <span className="text-xs text-gray-400 font-medium">{strategy.superStrategy}</span>
            </div>
            <h3 className="text-white font-semibold text-base">{strategy.name}</h3>
            <p className="text-sky-400 text-xs mb-2">{strategy.tagline}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{strategy.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {strategy.typicalKpis.map((kpi) => (
                <span key={kpi} className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">
                  {kpi}
                </span>
              ))}
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded flex-shrink-0 border-2 mt-1 flex items-center justify-center ${
              selected ? 'bg-sky-500 border-sky-500' : 'border-gray-500'
            }`}
          >
            {selected && <span className="text-white text-xs font-bold">✓</span>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-4 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
          {/* Common financing inputs */}
          {isHold && strategy.id !== 'brrrr' && (
            <>
              <InputField label="Down Payment" value={inputs.downPaymentPct ?? ''} onChange={(v) => onInputChange('downPaymentPct', v)} suffix="%" placeholder="20" />
              <InputField label="Interest Rate" value={inputs.interestRate ?? ''} onChange={(v) => onInputChange('interestRate', v)} suffix="%" placeholder="7.0" />
            </>
          )}

          {/* Strategy-specific inputs */}
          {strategy.id === 'turnkey_rental' && (
            <>
              <InputField label="Monthly Rent" value={inputs.targetRent ?? ''} onChange={(v) => onInputChange('targetRent', v)} prefix="$" placeholder="from research" />
              <InputField label="Property Mgmt" value={inputs.propertyMgmtPct ?? ''} onChange={(v) => onInputChange('propertyMgmtPct', v)} suffix="%" placeholder="10" />
            </>
          )}

          {strategy.id === 'brrrr' && (
            <>
              <InputField label="Renovation Cost" value={inputs.renovationCost ?? ''} onChange={(v) => onInputChange('renovationCost', v)} prefix="$" />
              <InputField label="ARV Estimate" value={inputs.arvEstimate ?? ''} onChange={(v) => onInputChange('arvEstimate', v)} prefix="$" />
              <InputField label="Refi LTV" value={inputs.refiLtv ?? ''} onChange={(v) => onInputChange('refiLtv', v)} suffix="%" placeholder="75" />
              <InputField label="Property Mgmt" value={inputs.propertyMgmtPct ?? ''} onChange={(v) => onInputChange('propertyMgmtPct', v)} suffix="%" placeholder="10" />
            </>
          )}

          {strategy.id === 'str' && (
            <>
              <InputField label="Avg Nightly Rate" value={inputs.nightlyRate ?? ''} onChange={(v) => onInputChange('nightlyRate', v)} prefix="$" />
              <InputField label="Occupancy Rate" value={inputs.occupancyRate ?? ''} onChange={(v) => onInputChange('occupancyRate', v)} suffix="%" placeholder="65" />
              <InputField label="Platform Fee" value={inputs.platformFeePct ?? ''} onChange={(v) => onInputChange('platformFeePct', v)} suffix="%" placeholder="15" />
            </>
          )}

          {strategy.id === 'buy_hold' && (
            <>
              <InputField label="Hold Period" value={inputs.holdPeriodYears ?? ''} onChange={(v) => onInputChange('holdPeriodYears', v)} suffix="yrs" placeholder="10" />
              <InputField label="Annual Appreciation" value={inputs.annualAppreciationPct ?? ''} onChange={(v) => onInputChange('annualAppreciationPct', v)} suffix="%" placeholder="3" />
            </>
          )}

          {strategy.id === 'fix_flip' && (
            <>
              <InputField label="Renovation Cost" value={inputs.renovationCost ?? ''} onChange={(v) => onInputChange('renovationCost', v)} prefix="$" />
              <InputField label="ARV Estimate" value={inputs.arvEstimate ?? ''} onChange={(v) => onInputChange('arvEstimate', v)} prefix="$" />
              <InputField label="Hold Period" value={inputs.holdPeriodMonths ?? ''} onChange={(v) => onInputChange('holdPeriodMonths', v)} suffix="mo" placeholder="6" />
              <InputField label="Selling Costs" value={inputs.sellingCostsPct ?? ''} onChange={(v) => onInputChange('sellingCostsPct', v)} suffix="%" placeholder="8" />
            </>
          )}

          {strategy.id === 'wholesale' && (
            <>
              <InputField label="ARV Estimate" value={inputs.arvEstimate ?? ''} onChange={(v) => onInputChange('arvEstimate', v)} prefix="$" />
              <InputField label="Assignment Fee" value={inputs.assignmentFee ?? ''} onChange={(v) => onInputChange('assignmentFee', v)} prefix="$" />
              <InputField label="Earnest Money" value={inputs.earnestMoney ?? ''} onChange={(v) => onInputChange('earnestMoney', v)} prefix="$" placeholder="5000" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function StrategySelector({ propertyData, onSubmit }: Props) {
  const [selected, setSelected] = useState<Set<StrategyId>>(new Set());
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [inputs, setInputs] = useState<Record<StrategyId, Record<string, string>>>(
    {} as Record<StrategyId, Record<string, string>>
  );

  function toggleStrategy(id: StrategyId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!inputs[id]) {
      setInputs((prev) => ({ ...prev, [id]: {} }));
    }
  }

  function setInput(strategyId: StrategyId, key: string, value: string) {
    setInputs((prev) => ({
      ...prev,
      [strategyId]: { ...(prev[strategyId] ?? {}), [key]: value },
    }));
  }

  function handleSubmit() {
    const pp = purchasePrice ? Number(purchasePrice) : undefined;
    const strategies: StrategyInputs[] = Array.from(selected).map((id) => {
      const raw = inputs[id] ?? {};
      const num = (k: string) => (raw[k] ? Number(raw[k]) : undefined);
      return {
        strategyId: id,
        purchasePrice: pp,
        renovationCost: num('renovationCost'),
        arvEstimate: num('arvEstimate'),
        targetRent: num('targetRent'),
        nightlyRate: num('nightlyRate'),
        occupancyRate: num('occupancyRate'),
        holdPeriodYears: num('holdPeriodYears'),
        holdPeriodMonths: num('holdPeriodMonths'),
        sellingCostsPct: num('sellingCostsPct'),
        assignmentFee: num('assignmentFee'),
        earnestMoney: num('earnestMoney'),
        refiLtv: num('refiLtv'),
        propertyMgmtPct: num('propertyMgmtPct'),
        platformFeePct: num('platformFeePct'),
        annualAppreciationPct: num('annualAppreciationPct'),
        downPaymentPct: num('downPaymentPct'),
        interestRate: num('interestRate'),
        loanTermYears: num('loanTermYears'),
      };
    });
    onSubmit(strategies);
  }

  const holdStrategies = STRATEGIES.filter((s) => s.superStrategy === 'Acquire & Hold');
  const sellStrategies = STRATEGIES.filter((s) => s.superStrategy === 'Acquire & Sell');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-semibold text-xl mb-1">Select Investment Strategies</h2>
        <p className="text-gray-400 text-sm">
          Choose one or more strategies to analyze. Each will be evaluated independently — the same property can look
          very different across strategies.
        </p>
      </div>

      {/* Deal Terms */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
        <h3 className="text-gray-300 font-medium text-sm uppercase tracking-wider mb-3">Deal Terms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">List Price</label>
            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 px-3 py-2">
              <span className="text-gray-500 text-sm mr-1">$</span>
              <span className="text-gray-300 text-sm">
                {propertyData.price != null
                  ? propertyData.price.toLocaleString()
                  : '—'}
              </span>
            </div>
          </div>
          <InputField
            label="Purchase Price"
            value={purchasePrice}
            onChange={setPurchasePrice}
            prefix="$"
            placeholder={propertyData.price?.toString() ?? 'Enter offer price'}
          />
        </div>
      </div>

      <div>
        <h3 className="text-gray-300 font-medium text-sm uppercase tracking-wider mb-3">
          Acquire &amp; Hold
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {holdStrategies.map((s) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              selected={selected.has(s.id)}
              onToggle={() => toggleStrategy(s.id)}
              inputs={inputs[s.id] ?? {}}
              onInputChange={(k, v) => setInput(s.id, k, v)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-gray-300 font-medium text-sm uppercase tracking-wider mb-3">
          Acquire &amp; Sell
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {sellStrategies.map((s) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              selected={selected.has(s.id)}
              onToggle={() => toggleStrategy(s.id)}
              inputs={inputs[s.id] ?? {}}
              onInputChange={(k, v) => setInput(s.id, k, v)}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.size === 0}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl py-3 text-base transition-colors"
      >
        {selected.size === 0
          ? 'Select at least one strategy'
          : `Run Analysis (${selected.size} ${selected.size === 1 ? 'strategy' : 'strategies'}) →`}
      </button>
    </div>
  );
}
