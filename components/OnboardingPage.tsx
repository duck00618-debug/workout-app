'use client';

import { useState } from 'react';
import { saveUser } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { Dumbbell, ChevronRight, ChevronLeft, User, Scale, Target } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const steps = ['基本資料', '身體數據', '訓練目標'];

export default function OnboardingPage({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<UserProfile>>({
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'moderate',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof UserProfile, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.name?.trim()) e.name = '請輸入姓名';
      if (!form.birthdate) e.birthdate = '請輸入生日';
      else {
        const birth = new Date(form.birthdate);
        const age = new Date().getFullYear() - birth.getFullYear();
        if (age < 10 || age > 100) e.birthdate = '請確認生日是否正確（用於計算年齡）';
      }
    }
    if (step === 1) {
      if (!form.height || Number(form.height) < 100 || Number(form.height) > 250)
        e.height = '請輸入正確的身高（100–250 cm）';
      if (!form.weight || Number(form.weight) < 20 || Number(form.weight) > 300)
        e.weight = '請輸入正確的體重（20–300 kg）';
      if (form.bodyFat !== undefined && form.bodyFat !== null && form.bodyFat !== ('' as unknown as number)) {
        if (Number(form.bodyFat) < 3 || Number(form.bodyFat) > 60)
          e.bodyFat = '體脂率請介於 3–60%';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) setStep(s => s + 1);
    else finish();
  };

  const finish = () => {
    const user: UserProfile = {
      name: form.name!,
      gender: form.gender!,
      birthdate: form.birthdate!,
      height: Number(form.height),
      weight: Number(form.weight),
      bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      goal: form.goal!,
      activityLevel: form.activityLevel!,
    };
    saveUser(user);
    onComplete();
  };

  const activityOptions = [
    { value: 'sedentary',  label: '久坐（幾乎不運動）' },
    { value: 'light',      label: '輕度活動（每週 1–3 天）' },
    { value: 'moderate',   label: '中度活動（每週 3–5 天）' },
    { value: 'active',     label: '高度活動（每週 6–7 天）' },
    { value: 'veryActive', label: '非常高強度（每天訓練）' },
  ];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--background)' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }} className="animate-fadein">
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Dumbbell size={32} color="white" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800 }} className="gradient-text">FitAI</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>智能健身 × 飲食助手</p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 32 : 8, height: 8, borderRadius: 4,
            background: i === step ? 'var(--accent)' : i < step ? 'rgba(108,99,255,0.5)' : 'var(--border)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>

      {/* Card */}
      <div className="card animate-fadein" style={{ width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          {step === 0 && <><User size={18} />基本資料</>}
          {step === 1 && <><Scale size={18} />身體數據</>}
          {step === 2 && <><Target size={18} />訓練目標</>}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>步驟 {step + 1} / {steps.length}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {step === 0 && (
            <>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>姓名</label>
                <input className="input" placeholder="你的名字" value={form.name || ''} onChange={e => set('name', e.target.value)} />
                {errors.name && <p style={{ color: 'var(--accent2)', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>性別</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ v: 'male', l: '男 👨' }, { v: 'female', l: '女 👩' }].map(g => (
                    <button key={g.v} onClick={() => set('gender', g.v)}
                      style={{
                        flex: 1, padding: '12px', borderRadius: 10,
                        border: `2px solid ${form.gender === g.v ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.gender === g.v ? 'rgba(108,99,255,0.15)' : 'var(--surface2)',
                        color: form.gender === g.v ? 'var(--accent)' : 'var(--text)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: 15
                      }}>
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  出生日期
                  <span style={{ color: 'var(--accent2)', marginLeft: 4 }}>（請務必填正確，用於計算年齡與 TDEE）</span>
                </label>
                <input className="input" type="date" value={form.birthdate || ''} onChange={e => set('birthdate', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                {errors.birthdate && <p style={{ color: 'var(--accent2)', fontSize: 12, marginTop: 4 }}>{errors.birthdate}</p>}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>身高（cm）</label>
                <input className="input" type="number" placeholder="例：175" value={form.height || ''} onChange={e => set('height', e.target.value)} />
                {errors.height && <p style={{ color: 'var(--accent2)', fontSize: 12, marginTop: 4 }}>{errors.height}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>體重（kg）</label>
                <input className="input" type="number" placeholder="例：70" value={form.weight || ''} onChange={e => set('weight', e.target.value)} />
                {errors.weight && <p style={{ color: 'var(--accent2)', fontSize: 12, marginTop: 4 }}>{errors.weight}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  體脂率（%）<span style={{ color: 'var(--muted)' }}>— 選填</span>
                </label>
                <input className="input" type="number" placeholder="例：20（選填）" value={form.bodyFat || ''} onChange={e => set('bodyFat', e.target.value)} />
                {errors.bodyFat && <p style={{ color: 'var(--accent2)', fontSize: 12, marginTop: 4 }}>{errors.bodyFat}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>目標</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { v: 'bulk',     l: '增肌 💪', d: '熱量盈餘 +300 kcal，增加肌肉量' },
                    { v: 'cut',      l: '減脂 🔥', d: '熱量赤字 -500 kcal，燃脂保肌' },
                    { v: 'maintain', l: '維持 ⚖️', d: '維持現有體態與體重' },
                  ].map(g => (
                    <button key={g.v} onClick={() => set('goal', g.v)}
                      style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${form.goal === g.v ? 'var(--accent)' : 'var(--border)'}`, background: form.goal === g.v ? 'rgba(108,99,255,0.15)' : 'var(--surface2)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ fontWeight: 700, color: form.goal === g.v ? 'var(--accent)' : 'var(--text)', fontSize: 15 }}>{g.l}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{g.d}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>日常活動量</label>
                <select className="input" value={form.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                  {activityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>
              <ChevronLeft size={18} /> 上一步
            </button>
          )}
          <button className="btn btn-primary" onClick={next} style={{ flex: 2 }}>
            {step === steps.length - 1 ? '開始使用 💪' : '下一步'}
            {step < steps.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
