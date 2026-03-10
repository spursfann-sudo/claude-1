import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { RESEARCH_MODEL } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let address: string;
  try {
    const body = await req.json();
    address = body.address;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: 'address is required' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[research] ANTHROPIC_API_KEY is not set');
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local.' },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 4 });

  const systemPrompt = `You are a real estate research assistant. Your job is to gather factual property data about a given address using web search.
Search for: listing price or estimated value, property details (beds/baths/sqft/year built/lot size), HOA fees, annual property tax, neighborhood name, walk score, school ratings, estimated monthly rent, median area home price, and recent price history.
After gathering data, output ONLY a valid JSON object matching this schema (no markdown, no explanation):
{
  "address": string,
  "price": number | null,
  "propertyType": string | null,
  "squareFeet": number | null,
  "bedrooms": number | null,
  "bathrooms": number | null,
  "yearBuilt": number | null,
  "lotSize": number | null,
  "hoaFees": number | null,
  "propertyTax": number | null,
  "neighborhoodName": string | null,
  "walkScore": number | null,
  "schoolRating": number | null,
  "medianAreaPrice": number | null,
  "estimatedRent": number | null,
  "priceHistory": [{"year": number, "price": number}] | null,
  "researchSummary": string
}
Use null for any field you could not find data for. The researchSummary should be 2-3 sentences summarizing what you found.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: RESEARCH_MODEL,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            {
              role: 'user' as const,
              content: `Research this property address and return the JSON data: ${address}`,
            },
          ],
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
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
              encoder.encode(
                JSON.stringify({ type: 'text', text: chunk }) + '\n'
              )
            );
          } else if (
            event.type === 'content_block_start' &&
            event.content_block?.type === 'server_tool_use'
          ) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'searching',
                  tool: event.content_block.name,
                }) + '\n'
              )
            );
          } else if (event.type === 'message_stop') {
            try {
              const jsonMatch = fullText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({ type: 'result', data: parsed }) + '\n'
                  )
                );
              } else {
                throw new Error('No JSON object found in response');
              }
            } catch {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: 'error',
                    message: 'Could not parse property data from research results.',
                  }) + '\n'
                )
              );
            }
          }
        }
      } catch (err) {
        console.error('[research] Stream error:', err);
        let message =
          err instanceof Error ? err.message : 'Unknown error during research';
        if (message.includes('rate_limit_error')) {
          message = 'Rate limit reached. Please wait a minute and try again.';
        } else if (message.includes('authentication_error')) {
          message = 'Invalid API key. Please check your ANTHROPIC_API_KEY configuration.';
        }
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
