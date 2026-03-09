'use client';

import { useEffect, useRef, useState } from 'react';
import { PropertyData } from '@/lib/types';

interface Props {
  address: string;
  onComplete: (data: PropertyData) => void;
  onError: (msg: string) => void;
}

export default function ResearchStream({ address, onComplete, onError }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function runResearch() {
      try {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            if (!part.trim()) continue;
            try {
              const event = JSON.parse(part);
              if (cancelled) return;

              if (event.type === 'searching') {
                setSearching(true);
                setLines((prev) => [...prev, `🔍 Searching the web…`]);
              } else if (event.type === 'text') {
                setSearching(false);
                // Only show meaningful text lines, skip raw JSON fragments
                const text: string = event.text;
                if (text.includes('\n')) {
                  setLines((prev) => [...prev, ...text.split('\n').filter(Boolean)]);
                }
              } else if (event.type === 'result') {
                setLines((prev) => [
                  ...prev,
                  '',
                  '✅ Research complete. Review the details below.',
                ]);
                onComplete(event.data as PropertyData);
              } else if (event.type === 'error') {
                onError(event.message as string);
              }
            } catch {
              // ignore parse errors on partial lines
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : 'Research failed');
        }
      }
    }

    runResearch();
    return () => { cancelled = true; };
  }, [address, onComplete, onError]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
        <h2 className="text-white font-semibold text-lg">
          Researching: {address}
        </h2>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 min-h-[200px] max-h-[400px] overflow-y-auto font-mono text-sm space-y-1">
        {lines.length === 0 && (
          <span className="text-gray-500">Initializing research agent…</span>
        )}
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith('✅')
                ? 'text-green-400'
                : line.startsWith('🔍')
                ? 'text-sky-400'
                : 'text-gray-300'
            }
          >
            {line || '\u00A0'}
          </div>
        ))}
        {searching && (
          <div className="text-sky-400 animate-pulse">Fetching results…</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
