import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { user, split, trainingGoal, level, apiKey } = await req.json();

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'No API key' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: key });

  const splitNames: Record<string, string> = {
    PPL: '推拉腿（Push/Pull/Legs）',
    upperLower: '上下半身分化',
    fullBody: '全身訓練',
    chestBack: '胸背腿',
    bro: '部位分化（Bro Split）',
  };

  const goalInfo: Record<string, string> = {
    hypertrophy: '肌肥大（每組 8–12 下，3–4 組，休息 60–90 秒）',
    strength: '增力（每組 3–6 下，4–5 組，休息 2–3 分鐘）',
    endurance: '肌耐力（每組 15–20 下，2–3 組，休息 30–45 秒）',
  };

  const levelInfo: Record<string, string> = {
    beginner: '新手（建議從複合動作入門，動作不超過 5 個）',
    intermediate: '中階',
    advanced: '進階',
  };

  const prompt = `你是一位專業健身教練，請幫這位使用者規劃一週訓練課表。

使用者資料：
- 姓名：${user.name}，年齡：${Math.floor((Date.now() - new Date(user.birthdate).getTime()) / (365.25 * 24 * 3600 * 1000))} 歲
- 性別：${user.gender === 'male' ? '男' : '女'}
- 體重：${user.weight} kg，身高：${user.height} cm
- 訓練分化：${splitNames[split]}
- 訓練目標：${goalInfo[trainingGoal]}
- 程度：${levelInfo[level]}

請輸出 JSON 格式的課表，格式如下（只輸出 JSON，不要其他文字）：
{
  "name": "課表名稱",
  "schedule": [
    {
      "day": "週一",
      "focus": "肌群重點",
      "exercises": [
        {
          "name": "動作名稱（中文）",
          "muscleGroup": "目標肌群",
          "sets": 4,
          "reps": "8-12",
          "restSeconds": 90,
          "notes": "新手注意事項（可選）"
        }
      ]
    }
  ]
}

注意：
1. 週期內要有休息日（標示 focus 為「休息」，exercises 為空陣列）
2. 動作名稱用中文
3. 新手的話動作數量不要超過 5 個，並在 notes 說明正確姿勢要點
4. 根據訓練目標給出正確的組數和次數範圍`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const plan = JSON.parse(jsonMatch[0]);
    return NextResponse.json(plan);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
