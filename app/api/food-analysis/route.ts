import { NextRequest, NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODELS = [
  'llama-3.2-11b-vision-preview',
  'llama-3.2-90b-vision-preview',
];

const PROMPT_IMAGE = `你是一位熟悉台灣飲食的營養師。請判斷這張照片是「營養標示」還是「食物」，只輸出 JSON，不要其他文字：

如果是【營養標示/成分表】：
{"type":"label","name":"產品名稱","servingSize":"每份份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}

如果是【實際食物照片】：
{"type":"food","name":"食物名稱（繁體中文）","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}

數字取整數，以台灣常見份量估算。`;

async function groqVision(key: string, model: string, imageUrl: string, prompt: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: prompt },
        ],
      }],
      max_tokens: 400,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}:${err.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

async function groqText(key: string, prompt: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  const { input, image, apiKey } = await req.json();

  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'No API key' }, { status: 400 });
  }

  try {
    let text: string;

    if (image) {
      const match = (image as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });

      const imageUrl = image as string;
      let lastErr = '';
      text = '';
      for (const model of VISION_MODELS) {
        try {
          text = await groqVision(key, model, imageUrl, PROMPT_IMAGE);
          break;
        } catch (e) {
          lastErr = e instanceof Error ? e.message : String(e);
        }
      }
      if (!text) throw new Error(lastErr);
    } else {
      text = await groqText(
        key,
        `你是熟悉台灣飲食的營養師。使用者吃了：「${input}」，只輸出 JSON：{"type":"food","name":"食物名稱","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}。未說明份量則依台灣一般份量估算，數字取整數。`
      );
    }

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error(`No JSON: ${text.slice(0, 200)}`);

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('food-analysis:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
