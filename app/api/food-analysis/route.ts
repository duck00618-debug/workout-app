import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const PROMPT_SUFFIX = `
用 JSON 格式回覆（只輸出 JSON，不要任何其他文字）：
{
  "name": "食物名稱（繁體中文，簡短）",
  "amount": "份量描述（例如：1碗、1個、500ml）",
  "calories": 數字（大卡）,
  "protein": 數字（克）,
  "carbs": 數字（克）,
  "fat": 數字（克）
}

規則：以台灣一般餐廳或便利商店份量估算，數字取整數，protein×4 + carbs×4 + fat×9 ≈ calories。`;

export async function POST(req: NextRequest) {
  const { input, image, apiKey } = await req.json();

  const key = apiKey || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'No API key' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    let result;

    if (image) {
      const match = (image as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });

      result = await model.generateContent([
        { inlineData: { mimeType: match[1], data: match[2] } },
        `你是一位熟悉台灣飲食的營養師。請仔細觀察照片中的食物，辨識出主要食物並估算熱量與營養素。若看不清楚仍需盡力估算。${PROMPT_SUFFIX}`,
      ]);
    } else {
      result = await model.generateContent(
        `你是一位熟悉台灣飲食的營養師。使用者說他吃了：「${input}」，請估算熱量與營養素，若未說明份量則依台灣一般份量估算。${PROMPT_SUFFIX}`
      );
    }

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
