'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (address: string) => void;
  loading?: boolean;
}

export default function AddressForm({ onSubmit, loading }: Props) {
  const [address, setAddress] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (address.trim()) onSubmit(address.trim());
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Real Estate Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            Enter a property address to begin your investment analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Austin, TX 78701"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-5 py-4 text-lg placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={!address.trim() || loading}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl py-4 text-lg transition-colors"
          >
            {loading ? 'Researching…' : 'Analyze Property'}
          </button>
        </form>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🔍', label: 'Live web research' },
            { icon: '📊', label: 'Multi-strategy analysis' },
            { icon: '📈', label: 'Visual dashboard' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-900 rounded-xl p-4">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-gray-400 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
