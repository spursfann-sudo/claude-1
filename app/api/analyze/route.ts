import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MODEL } from '@/lib/claude';
import { PropertyData, StrategyInputs } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    propertyData: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        price: { type: ['number', 'null'] },
        propertyType: { type: ['string', 'null'] },
        squareFeet: { type: ['number', 'null'] },
        bedrooms: { type: ['number', 'null'] },
        bathrooms: { type: ['number', 'null'] },
        yearBuilt: { type: ['number', 'null'] },
        lotSize: { type: ['number', 'null'] },
        hoaFees: { type: ['number', 'null'] },
        propertyTax: { type: ['number', 'null'] },
        neighborhoodName: { type: ['string', 'null'] },
        walkScore: { type: ['number', 'null'] },
        schoolRating: { type: ['number', 'null'] },
        medianAreaPrice: { type: ['number', 'null'] },
        estimatedRent: { type: ['number', 'null'] },
        priceHistory: {
          type: ['array', 'null'],
          items: {
            type: 'object',
            properties: {
              year: { type: 'number' },
              price: { type: 'number' },
            },
            required: ['year', 'price'],
            additionalProperties: false,
          },
        },
        researchSummary: { type: 'string' },
      },
      required: ['address', 'researchSummary'],
      additionalProperties: false,
    },
    strategies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          strategyId: {
            type: 'string',
            enum: ['brrrr', 'turnkey_rental', 'str', 'buy_hold', 'fix_flip', 'wholesale'],
          },
          strategyName: { type: 'string' },
          verdict: { type: 'string', enum: ['Strong Buy', 'Buy', 'Marginal', 'Avoid'] },
          investmentScore: { type: 'number' },
          totalCashInvested: { type: 'number' },
          cashOnCashReturn: { type: 'number' },
          cocIsAnnualized: { type: 'boolean' },
          summary: { type: 'string' },
          riskFactors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                factor: { type: 'string' },
                severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                description: { type: 'string' },
              },
              required: ['factor', 'severity', 'description'],
              additionalProperties: false,
            },
          },
          keyHighlights: { type: 'array', items: { type: 'string' } },
          grossAnnualIncome: { type: ['number', 'null'] },
          monthlyNetIncome: { type: ['number', 'null'] },
          annualNetIncome: { type: ['number', 'null'] },
          capRate: { type: ['number', 'null'] },
          grossRentMultiplier: { type: ['number', 'null'] },
          remainingCashPostRefi: { type: ['number', 'null'] },
          equityCaptured: { type: ['number', 'null'] },
          avgDailyRate: { type: ['number', 'null'] },
          occupancyRate: { type: ['number', 'null'] },
          revPAR: { type: ['number', 'null'] },
          costBreakdown: {
            type: ['object', 'null'],
            properties: {
              acquisitionCost: { type: 'number' },
              renovationCost: { type: ['number', 'null'] },
              carryCosts: { type: ['number', 'null'] },
              transactionCosts: { type: ['number', 'null'] },
              totalProjectCost: { type: 'number' },
            },
            required: ['acquisitionCost', 'totalProjectCost'],
            additionalProperties: false,
          },
          projectedArv: { type: ['number', 'null'] },
          netProfit: { type: ['number', 'null'] },
          holdPeriodMonths: { type: ['number', 'null'] },
          maxAllowableOffer: { type: ['number', 'null'] },
          assignmentFee: { type: ['number', 'null'] },
          valueProjections: {
            type: ['array', 'null'],
            items: {
              type: 'object',
              properties: {
                year: { type: 'number' },
                estimatedValue: { type: 'number' },
                cumulativeTotalReturn: { type: 'number' },
                equity: { type: 'number' },
              },
              required: ['year', 'estimatedValue', 'cumulativeTotalReturn', 'equity'],
              additionalProperties: false,
            },
          },
        },
        required: [
          'strategyId', 'strategyName', 'verdict', 'investmentScore',
          'totalCashInvested', 'cashOnCashReturn', 'cocIsAnnualized',
          'summary', 'riskFactors', 'keyHighlights',
        ],
        additionalProperties: false,
      },
    },
    comparativeSummary: { type: 'string' },
  },
  required: ['propertyData', 'strategies', 'comparativeSummary'],
  additionalProperties: false,
};

export async function POST(req: NextRequest) {
  let propertyData: PropertyData;
  let strategies: StrategyInputs[];
  try {
    const body = await req.json();
    propertyData = body.propertyData;
    strategies = body.strategies;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!propertyData || !strategies?.length) {
    return NextResponse.json(
      { error: 'propertyData and strategies are required' },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[analyze] ANTHROPIC_API_KEY is not set');
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local.' },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are an expert real estate investment analyst with deep knowledge of all major investment strategies including BRRRR, fix & flip, turnkey rentals, short-term rentals, buy & hold, and wholesaling.

Analyze the provided property data and return a comprehensive investment analysis for each requested strategy.

IMPORTANT METRICS:
- Cash-on-Cash Return (COCR) is the universal comparison metric. Always compute it.
  - Hold strategies: Annual Net Income / Total Cash Invested
  - Fix & Flip: (Net Profit / Total Cash Invested) × (12 / Hold Months) — annualized, set cocIsAnnualized: true
  - Wholesale: (Assignment Fee / Earnest Money) × (12 / Hold Days×30) — annualized, set cocIsAnnualized: true
  - BRRRR: computed AFTER the cash-out refinance — Annual Cash Flow / Remaining Cash Invested Post-Refi
- totalCashInvested = actual cash out of pocket (not purchase price)
- For hold strategies: assume down payment + closing costs (~3%) unless user specified
- investmentScore: 1–10 (10 = exceptional deal under this strategy)
- verdict: based on the numbers and market conditions
- valueProjections: for hold strategies, provide year 1 through holdPeriodYears (or 10 if not specified)

Use realistic, conservative assumptions. Be honest about weak deals. Include 3–5 risk factors per strategy.

Output ONLY a valid JSON object matching the provided schema. No markdown, no explanation, just the JSON.`;

  const userMessage = `Property Data:
${JSON.stringify(propertyData, null, 2)}

Strategies to analyze:
${JSON.stringify(strategies, null, 2)}

Analyze each strategy and return the complete JSON analysis matching this exact schema:
${JSON.stringify(ANALYSIS_SCHEMA, null, 2)}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: MODEL,
          max_tokens: 16000,
          thinking: { type: 'enabled', budget_tokens: 10000 },
          system: systemPrompt,
          messages: [{ role: 'user' as const, content: userMessage }],
        });

        let fullText = '';

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta?.type === 'text_delta'
          ) {
            const chunk = event.delta.text ?? '';
            fullText += chunk;
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'progress', text: chunk }) + '\n')
            );
          } else if (event.type === 'message_stop') {
            try {
              const jsonMatch = fullText.match(/\{[\s\S]*\}/);
              if (!jsonMatch) throw new Error('No JSON found');
              const parsed = JSON.parse(jsonMatch[0]);
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'result', data: parsed }) + '\n')
              );
            } catch {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'error',
                    message: 'Failed to parse analysis result.',
                  }) + '\n'
                )
              );
            }
          }
        }
      } catch (err) {
        console.error('[analyze] Stream error:', err);
        const message =
          err instanceof Error ? err.message : 'Unknown error during analysis';
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'error', message }) + '\n')
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
