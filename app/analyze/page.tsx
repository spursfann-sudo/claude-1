'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PropertyData, StrategyInputs, RealEstateAnalysis } from '@/lib/types';
import ResearchStream from '@/components/ResearchStream';
import PropertyForm from '@/components/PropertyForm';
import StrategySelector from '@/components/StrategySelector';
import Dashboard from '@/components/dashboard/Dashboard';

type Step = 'research' | 'review' | 'strategy' | 'analyzing' | 'dashboard';

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'research', label: 'Research' },
    { id: 'review', label: 'Review' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'analyzing', label: 'Analyzing' },
    { id: 'dashboard', label: 'Dashboard' },
  ];
  const activeIndex = steps.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              i === activeIndex
                ? 'bg-sky-600 text-white'
                : i < activeIndex
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-900 text-gray-600'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                i < activeIndex ? 'bg-green-500 text-white' : ''
              }`}
            >
              {i < activeIndex ? '✓' : i + 1}
            </span>
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-4 h-px mx-1 ${i < activeIndex ? 'bg-gray-600' : 'bg-gray-800'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const address = searchParams.get('address') ?? '';

  const [step, setStep] = useState<Step>('research');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RealEstateAnalysis | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState('');

  useEffect(() => {
    if (!address) router.replace('/');
  }, [address, router]);

  const handleResearchComplete = useCallback((data: PropertyData) => {
    setPropertyData(data);
    setStep('review');
  }, []);

  const handleResearchError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const handlePropertyConfirm = useCallback((data: PropertyData) => {
    setPropertyData(data);
    setStep('strategy');
  }, []);

  const handleStrategiesSubmit = useCallback(
    async (strategies: StrategyInputs[]) => {
      if (!propertyData) return;
      setStep('analyzing');
      setAnalyzeProgress('');

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyData, strategies }),
        });

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            if (!part.trim()) continue;
            try {
              const event = JSON.parse(part);
              if (event.type === 'progress') {
                setAnalyzeProgress((prev) => prev + (event.text as string));
              } else if (event.type === 'result') {
                setAnalysis(event.data as RealEstateAnalysis);
                setStep('dashboard');
              } else if (event.type === 'error') {
                throw new Error(event.message as string);
              }
            } catch (parseErr) {
              if ((parseErr as Error).message !== 'Unexpected token') {
                throw parseErr;
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setStep('strategy');
      }
    },
    [propertyData]
  );

  if (!address) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← New Analysis
          </button>
          <StepIndicator current={step} />
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
            <strong>Error:</strong> {error}
            <button
              className="ml-4 text-red-400 underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {step === 'research' && (
          <ResearchStream
            address={address}
            onComplete={handleResearchComplete}
            onError={handleResearchError}
          />
        )}

        {step === 'review' && propertyData && (
          <PropertyForm initial={propertyData} onConfirm={handlePropertyConfirm} />
        )}

        {step === 'strategy' && propertyData && (
          <StrategySelector propertyData={propertyData} onSubmit={handleStrategiesSubmit} />
        )}

        {step === 'analyzing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="text-white font-semibold text-lg">Running Investment Analysis…</h2>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 min-h-[200px] border border-gray-800">
              {analyzeProgress ? (
                <p className="text-gray-400 text-sm font-mono whitespace-pre-wrap">{analyzeProgress}</p>
              ) : (
                <p className="text-gray-500 text-sm animate-pulse">
                  Calculating strategy metrics, risk factors, and projections…
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'dashboard' && analysis && <Dashboard analysis={analysis} />}
      </main>
    </div>
  );
}

export default function AnalyzePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading…</div>}>
      <AnalyzePage />
    </Suspense>
  );
}
