import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return NextResponse.json({ error: 'No API key configured' });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  );
  const data = await res.json();

  if (!res.ok) return NextResponse.json({ error: data });

  const names = (data.models ?? [])
    .map((m: { name: string; supportedGenerationMethods?: string[] }) => ({
      name: m.name,
      generateContent: m.supportedGenerationMethods?.includes('generateContent'),
    }))
    .filter((m: { generateContent: boolean }) => m.generateContent)
    .map((m: { name: string }) => m.name);

  return NextResponse.json({ available: names });
}
