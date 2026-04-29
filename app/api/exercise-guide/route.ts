import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: 'No API key configured' }, { status: 400 });

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1200,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: '你是健身教練。只輸出純 JSON，禁止任何其他文字或 markdown。每個字串控制在 30 字以內。',
          },
          {
            role: 'user',
            content: `「${name}」的教學 JSON：{"muscles":["肌群1","肌群2"],"steps":["步驟1","步驟2","步驟3","步驟4"],"tips":["提示1","提示2"],"mistakes":["錯誤1","錯誤2"]}。繁體中文，簡潔。`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Groq error:', errText);
      return NextResponse.json({ error: `Groq ${res.status}: ${errText.slice(0, 200)}` }, { status: 500 });
    }

    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error('No JSON found in:', text.slice(0, 300));
      return NextResponse.json({ error: `No JSON in response: ${text.slice(0, 100)}` }, { status: 500 });
    }

    const data = JSON.parse(match[0]);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('exercise-guide:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
