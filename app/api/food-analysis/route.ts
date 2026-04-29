import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const JSON_SCHEMA = `{
  "name": "食物名稱（簡短）",
  "amount": "份量描述",
  "calories": 數字（大卡）,
  "protein": 數字（克）,
  "carbs": 數字（克）,
  "fat": 數字（克）
}`;

const JSON_NOTES = `注意：
1. 依照台灣一般餐廳的正常份量估算
2. 數字取整數
3. 盡量精確，蛋白質/碳水/脂肪的熱量要合理（protein*4 + carbs*4 + fat*9 ≈ calories）`;

export async function POST(req: NextRequest) {
  const { input, image, apiKey } = await req.json();

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'No API key' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: key });

  try {
    let message;

    if (image) {
      const match = (image as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });

      const mediaType = match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      const base64Data = match[2];

      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            { type: 'text', text: `你是一位營養師，請分析這張食物照片，估算營養資訊，用 JSON 格式回覆（只輸出 JSON，不要其他文字）：\n${JSON_SCHEMA}\n\n${JSON_NOTES}` },
          ],
        }],
      });
    } else {
      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: `你是一位營養師，使用者說他吃了：「${input}」\n\n請估算這份食物的營養資訊，用 JSON 格式回覆（只輸出 JSON，不要其他文字）：\n${JSON_SCHEMA}\n\n注意：\n1. 如果使用者沒有說份量，依照台灣一般餐廳的正常份量估算\n2. 數字取整數\n3. 盡量精確，蛋白質/碳水/脂肪的熱量要合理（protein*4 + carbs*4 + fat*9 ≈ calories）` }],
      });
    }

    const text = (message.content[0] as { type: string; text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
