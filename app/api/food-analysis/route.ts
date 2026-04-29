import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;

async function callGemini(key: string, parts: unknown[]) {
  const res = await fetch(GEMINI_URL(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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

      text = await callGemini(key, [
        { inlineData: { mimeType: match[1], data: match[2] } },
        { text: `你是一位熟悉台灣飲食的營養師。請判斷這張照片是「營養標示」還是「食物」，並只輸出 JSON，不要任何其他文字：

如果是【營養標示/成分表】：
{"type":"label","name":"產品名稱","servingSize":"每份份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}

如果是【實際食物照片】：
{"type":"food","name":"食物名稱（繁體中文）","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}

數字取整數，以台灣常見份量估算。` },
      ]);
    } else {
      text = await callGemini(key, [
        { text: `你是熟悉台灣飲食的營養師。使用者吃了：「${input}」，只輸出 JSON：{"type":"food","name":"食物名稱","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}。未說明份量則依台灣一般份量估算，數字取整數。` },
      ]);
    }

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error(`No JSON: ${text.slice(0, 200)}`);

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('food-analysis error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
