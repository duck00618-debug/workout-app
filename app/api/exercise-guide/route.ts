import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: 'No API key' }, { status: 400 });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `你是一位健身教練。請為「${name}」提供教學說明，只輸出以下 JSON 格式，不要任何其他文字：
{
  "muscles": ["主要肌群1", "主要肌群2"],
  "steps": ["步驟1", "步驟2", "步驟3", "步驟4"],
  "tips": ["重點提示1", "重點提示2"],
  "mistakes": ["常見錯誤1", "常見錯誤2"]
}
用繁體中文，步驟要具體，4-5個步驟，2個提示，2個常見錯誤。`,
      }],
    }),
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ error: 'No JSON' }, { status: 500 });
  return NextResponse.json(JSON.parse(match[0]));
}
