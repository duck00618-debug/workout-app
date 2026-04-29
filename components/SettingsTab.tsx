'use client';

import { useEffect, useState } from 'react';
import { getUser, saveUser } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { calcAge, calcBMI, calcTDEE, calcMacros } from '@/lib/calculations';
import { Save, LogOut, Flame } from 'lucide-react';

export default function SettingsTab({ onLogout }: { onLogout: () => void }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [goal, setGoal] = useState<UserProfile['goal']>('maintain');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('moderate');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (u) {
      setUser(u);
      setWeight(String(u.weight));
      setBodyFat(u.bodyFat ? String(u.bodyFat) : '');
      setGoal(u.goal);
      setActivityLevel(u.activityLevel);
    }
  }, []);

  const save = () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      weight: Number(weight) || user.weight,
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      goal,
      activityLevel,
    };
    saveUser(updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  const age = calcAge(user.birthdate);
  const bmi = calcBMI(user.height, Number(weight) || user.weight);
  const tempUser: UserProfile = { ...user, weight: Number(weight) || user.weight, goal, activityLevel };
  const tdee = calcTDEE(tempUser);
  const macros = calcMacros(tempUser);

  const activityOptions = [
    { value: 'sedentary',  label: '久坐（幾乎不運動）' },
    { value: 'light',      label: '輕度活動（每週 1–3 天）' },
    { value: 'moderate',   label: '中度活動（每週 3–5 天）' },
    { value: 'active',     label: '高度活動（每週 6–7 天）' },
    { value: 'veryActive', label: '非常高強度' },
  ];

  return (
    <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>設定</h1>

      {/* Profile */}
      <div className="card animate-fadein" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
          {user.gender === 'male' ? '👨' : '👩'}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{user.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{age} 歲 · {user.height} cm · BMI {bmi}</div>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
            {new Date(user.birthdate).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} 出生
          </div>
        </div>
      </div>

      {/* TDEE card */}
      <div className="card animate-fadein" style={{ marginBottom: 16, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontWeight: 700, fontSize: 15 }}>
          <Flame size={18} color="var(--accent2)" /> 每日營養目標（即時計算）
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatItem label="TDEE" value={`${tdee} kcal`} color="var(--accent2)" />
          <StatItem label="目標熱量" value={`${macros.calories} kcal`} color="var(--accent)" />
          <StatItem label="蛋白質" value={`${macros.protein} g`} color="#6c63ff" />
          <StatItem label="碳水化合物" value={`${macros.carbs} g`} color="#ffa500" />
          <StatItem label="脂肪" value={`${macros.fat} g`} color="#ff6584" />
          <StatItem label="目標" value={{ bulk: '增肌 💪', cut: '減脂 🔥', maintain: '維持 ⚖️' }[goal]} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>* 根據 Mifflin-St Jeor 公式計算，數值會隨下方設定即時更新</p>
      </div>

      {/* Editable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fadein">
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>更新身體數據</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>體重（kg）</label>
                <input className="input" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>體脂率（%）</label>
                <input className="input" type="number" placeholder="選填" value={bodyFat} onChange={e => setBodyFat(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>目標與活動量</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[{ v: 'bulk' as const, l: '增肌' }, { v: 'cut' as const, l: '減脂' }, { v: 'maintain' as const, l: '維持' }].map(g => (
              <button key={g.v} onClick={() => setGoal(g.v)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${goal === g.v ? 'var(--accent)' : 'var(--border)'}`, background: goal === g.v ? 'rgba(108,99,255,0.15)' : 'var(--surface2)', color: goal === g.v ? 'var(--accent)' : 'var(--text)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {g.l}
              </button>
            ))}
          </div>
          <select className="input" value={activityLevel} onChange={e => setActivityLevel(e.target.value as UserProfile['activityLevel'])}>
            {activityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <button className="btn btn-primary" onClick={save} style={{ width: '100%' }}>
          <Save size={18} />
          {saved ? '已儲存 ✓' : '儲存設定'}
        </button>

        <button className="btn btn-danger" onClick={() => {
          if (confirm('確定要清除所有資料並重新開始嗎？此操作無法還原。')) onLogout();
        }} style={{ width: '100%' }}>
          <LogOut size={18} /> 清除資料 & 重新開始
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}
