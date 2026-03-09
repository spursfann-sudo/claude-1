'use client';

import { useState } from 'react';
import { RealEstateAnalysis } from '@/lib/types';
import { getStrategyColor } from '@/lib/strategies';
import StrategyTab from './StrategyTab';
import ComparisonTab from './ComparisonTab';

export default function Dashboard({ analysis }: { analysis: RealEstateAnalysis }) {
  const { propertyData, strategies, comparativeSummary } = analysis;
  const tabs = [
    ...strategies.map((s) => ({ id: s.strategyId, label: s.strategyName })),
    ...(strategies.length > 1 ? [{ id: 'compare', label: 'Compare All' }] : []),
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');

  const activeStrategy = strategies.find((s) => s.strategyId === activeTab);

  return (
    <div className="space-y-6">
      {/* Property header */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h2 className="text-white font-bold text-xl">{propertyData.address}</h2>
        {propertyData.propertyType && (
          <span className="text-gray-400 text-sm">{propertyData.propertyType}</span>
        )}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
          {propertyData.price != null && (
            <span>
              <span className="text-gray-500">Price: </span>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(propertyData.price)}
            </span>
          )}
          {propertyData.bedrooms != null && (
            <span>{propertyData.bedrooms} bed</span>
          )}
          {propertyData.bathrooms != null && (
            <span>{propertyData.bathrooms} bath</span>
          )}
          {propertyData.squareFeet != null && (
            <span>{propertyData.squareFeet.toLocaleString()} sqft</span>
          )}
          {propertyData.yearBuilt != null && (
            <span>Built {propertyData.yearBuilt}</span>
          )}
        </div>
      </div>

      {/* Comparative summary */}
      {comparativeSummary && (
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-2">
            Analyst Summary
          </h3>
          <p className="text-gray-200 text-sm leading-relaxed">{comparativeSummary}</p>
        </div>
      )}

      {/* Strategy tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const color = tab.id !== 'compare' ? getStrategyColor(tab.id as never) : '#6b7280';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'text-gray-400 bg-gray-900 border-gray-700 hover:text-white hover:border-gray-600'
              }`}
              style={isActive ? { backgroundColor: color + '33', borderColor: color, color } : {}}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'compare' ? (
        <ComparisonTab strategies={strategies} />
      ) : activeStrategy ? (
        <StrategyTab strategy={activeStrategy} />
      ) : null}
    </div>
  );
}
