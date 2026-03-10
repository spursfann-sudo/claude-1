'use client';

import { useState } from 'react';
import { PropertyData } from '@/lib/types';

interface Props {
  initial: PropertyData;
  onConfirm: (data: PropertyData) => void;
}

const SQFT_PER_ACRE = 43560;

function Field({
  label,
  value,
  onChange,
  type = 'text',
  prefix,
  suffix,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-sky-500 transition-colors">
        {prefix && (
          <span className="px-3 text-gray-500 border-r border-gray-700">{prefix}</span>
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-white px-3 py-2 text-sm focus:outline-none"
        />
        {suffix && (
          <span className="px-3 text-gray-500 border-l border-gray-700">{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function PropertyForm({ initial, onConfirm }: Props) {
  const [data, setData] = useState<PropertyData>(initial);
  const [lotSizeUnit, setLotSizeUnit] = useState<'sqft' | 'acres'>(
    initial.lotSizeUnit ?? 'acres'
  );

  function set<K extends keyof PropertyData>(key: K, raw: string) {
    const numericKeys: (keyof PropertyData)[] = [
      'price', 'squareFeet', 'bedrooms', 'bathrooms', 'yearBuilt',
      'lotSize', 'hoaFees', 'propertyTax',
      'medianAreaPrice', 'estimatedRent',
    ];
    const value = numericKeys.includes(key)
      ? raw === '' ? undefined : Number(raw)
      : raw;
    setData((prev) => ({ ...prev, [key]: value }));
  }

  // lotSize is stored internally in sqft. Convert for display based on selected unit.
  const lotSizeDisplay =
    data.lotSize != null
      ? lotSizeUnit === 'acres'
        ? parseFloat((data.lotSize / SQFT_PER_ACRE).toFixed(2))
        : data.lotSize
      : '';

  function handleLotSizeChange(raw: string) {
    if (raw === '') {
      setData((prev) => ({ ...prev, lotSize: undefined }));
      return;
    }
    const num = Number(raw);
    // Convert user input back to sqft for internal storage
    const sqft = lotSizeUnit === 'acres' ? Math.round(num * SQFT_PER_ACRE) : num;
    setData((prev) => ({ ...prev, lotSize: sqft }));
  }

  function handleUnitChange(unit: 'sqft' | 'acres') {
    setLotSizeUnit(unit);
  }

  function handleConfirm() {
    onConfirm({ ...data, lotSizeUnit });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-semibold text-xl mb-1">Review Property Details</h2>
        <p className="text-gray-400 text-sm">
          Confirm or correct the data Claude found. Fill in any missing fields.
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl p-4 text-sm text-gray-300 border border-gray-700">
        <span className="text-gray-500 font-medium">Research summary: </span>
        {data.researchSummary}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Address" value={data.address} onChange={(v) => set('address', v)} />
        <Field label="Property Type" value={data.propertyType ?? ''} onChange={(v) => set('propertyType', v)} />
        <Field label="List / Estimated Price" value={data.price} onChange={(v) => set('price', v)} type="number" prefix="$" />
        <Field label="Square Feet" value={data.squareFeet} onChange={(v) => set('squareFeet', v)} type="number" suffix="sqft" />
        <Field label="Bedrooms" value={data.bedrooms} onChange={(v) => set('bedrooms', v)} type="number" />
        <Field label="Bathrooms" value={data.bathrooms} onChange={(v) => set('bathrooms', v)} type="number" />
        <Field label="Year Built" value={data.yearBuilt} onChange={(v) => set('yearBuilt', v)} type="number" />

        {/* Lot Size with unit toggle */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Lot Size</label>
          <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 focus-within:border-sky-500 transition-colors">
            <input
              type="number"
              value={lotSizeDisplay}
              onChange={(e) => handleLotSizeChange(e.target.value)}
              className="flex-1 bg-transparent text-white px-3 py-2 text-sm focus:outline-none"
            />
            <select
              value={lotSizeUnit}
              onChange={(e) => handleUnitChange(e.target.value as 'sqft' | 'acres')}
              className="bg-gray-700 text-gray-300 text-xs border-l border-gray-700 px-2 py-2 focus:outline-none rounded-r-lg cursor-pointer"
            >
              <option value="acres">acres</option>
              <option value="sqft">sqft</option>
            </select>
          </div>
        </div>

        <Field label="Monthly HOA Fees" value={data.hoaFees} onChange={(v) => set('hoaFees', v)} type="number" prefix="$" />
        <Field label="Annual Property Tax" value={data.propertyTax} onChange={(v) => set('propertyTax', v)} type="number" prefix="$" />
        <Field label="Estimated Monthly Rent (LTR)" value={data.estimatedRent} onChange={(v) => set('estimatedRent', v)} type="number" prefix="$" />
        <Field label="Median Area Price" value={data.medianAreaPrice} onChange={(v) => set('medianAreaPrice', v)} type="number" prefix="$" />
      </div>

      <button
        onClick={handleConfirm}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl py-3 text-base transition-colors"
      >
        Continue to Strategy Selection →
      </button>
    </div>
  );
}
