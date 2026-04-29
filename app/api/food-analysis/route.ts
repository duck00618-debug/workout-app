import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

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
        `你是一位熟悉台灣飲食的營養師。請判斷這張照片是「營養標示」還是「食物」，並依照以下規則回覆 JSON（只輸出 JSON，不要任何其他文字）：

如果是【營養標示/成分表】：
{
  "type": "label",
  "name": "產品名稱（繁體中文）",
  "servingSize": "每份份量（例如：30g、1匙）",
  "calories": 每份熱量數字,
  "protein": 每份蛋白質克數,
  "carbs": 每份碳水化合物克數,
  "fat": 每份脂肪克數
}

如果是【實際食物照片】：
{
  "type": "food",
  "name": "食物名稱（繁體中文，簡短）",
  "amount": "份量描述（例如：1碗、1個）",
  "calories": 估算熱量數字,
  "protein": 估算蛋白質克數,
  "carbs": 估算碳水化合物克數,
  "fat": 估算脂肪克數
}

規則：數字取整數，若看不清楚仍需盡力辨識，以台灣常見份量估算。`,
      ]);
    } else {
      result = await model.generateContent(
        `你是一位熟悉台灣飲食的營養師。使用者說他吃了：「${input}」，請估算熱量與營養素。
用 JSON 格式回覆（只輸出 JSON）：
{"type":"food","name":"食物名稱","amount":"份量","calories":數字,"protein":數字,"carbs":數字,"fat":數字}
規則：未說明份量則依台灣一般份量估算，數字取整數。`
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
