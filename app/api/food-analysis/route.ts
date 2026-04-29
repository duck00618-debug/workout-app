import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://generativelanguage.googleapis.com';
const MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-002',
  'gemini-1.5-flash-8b-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
];

async function callGemini(key: string, model: string, parts: unknown[]): Promise<string> {
  const url = `${BASE}/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}:${err.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callWithFallback(key: string, parts: unknown[]): Promise<string> {
  const errors: string[] = [];
  for (const model of MODELS) {
    try {
      return await callGemini(key, model, parts);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.startsWith('404')) throw e; // 非 404 直接往外拋
      errors.push(`${model}: ${msg}`);
    }
  }
  throw new Error(`No available model. Tried:\n${errors.join('\n')}`);
}

export async function POST(req: NextRequest) {
  const { input, image, apiKey } = await req.json();

  const key = apiKey || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'No API key' }, { status: 400 });
  }

  try {
    let text: string;

    if (image) {
      const match = (image as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });

      text = await callWithFallback(key, [
        { inlineData: { mimeType: match[1], data: match[2] } },
        { text: `你是一位熟悉台灣飲食的營養師。請判斷這張照片是「營養標示」還是「食物」，只輸出 JSON，不要其他文字：

如果是【營養標示/成分表】：
{"type":"label","name":"產品名稱","servingSize":"每份份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}

如果是【實際食物照片】：
{"type":"food","name":"食物名稱（繁體中文）","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}

數字取整數，以台灣常見份量估算。` },
      ]);
    } else {
      text = await callWithFallback(key, [
        { text: `你是熟悉台灣飲食的營養師。使用者吃了：「${input}」，只輸出 JSON：{"type":"food","name":"食物名稱","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}。未說明份量則依台灣一般份量估算，數字取整數。` },
      ]);
    }

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error(`No JSON in: ${text.slice(0, 200)}`);

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('food-analysis:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
