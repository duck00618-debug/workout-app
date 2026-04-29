'use client';

import { useEffect, useState } from 'react';
import { getUser, getActivePlan, getLogs, getDietLog } from '@/lib/storage';
import { calcAge, calcTDEE, calcMacros, calcBMI, bmiCategory, today } from '@/lib/calculations';
import { UserProfile } from '@/lib/types';
import { Flame, Dumbbell, Apple, TrendingUp, ChevronRight, Zap } from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export default function DashboardTab({ onNavigate }: Props) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasPlan, setHasPlan] = useState(false);
  const [todayCalories, setTodayCalories] = useState(0);
  const [weekWorkouts, setWeekWorkouts] = useState(0);
  const [targetCalories, setTargetCalories] = useState(0);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    if (u) {
      const macros = calcMacros(u);
      setTargetCalories(macros.calories);
    }
    setHasPlan(!!getActivePlan());

    const todayLog = getDietLog(today());
    const cal = todayLog.entries.reduce((s, e) => s + e.calories, 0);
    setTodayCalories(cal);

    const logs = getLogs();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    setWeekWorkouts(logs.filter(l => l.completed && new Date(l.date) >= weekAgo).length);
  }, []);

  if (!user) return null;

  const age = calcAge(user.birthdate);
  const tdee = calcTDEE(user);
  const macros = calcMacros(user);
  const bmi = calcBMI(user.height, user.weight);
  const goalLabel = { bulk: '增肌', cut: '減脂', maintain: '維持' }[user.goal];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早安' : hour < 17 ? '午安' : '晚安';

  const calPct = Math.min(100, Math.round((todayCalories / targetCalories) * 100));

  return (
    <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }} className="animate-fadein">
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>{greeting}，</p>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>{user.name} 💪</h1>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent)' }}>{goalLabel}</span>
          <span className="badge" style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--green)' }}>{age} 歲</span>
          <span className="badge" style={{ background: 'rgba(255,101,132,0.1)', color: 'var(--accent2)' }}>BMI {bmi} · {bmiCategory(bmi)}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }} className="animate-fadein">
        <StatCard icon={<Flame size={20} color="#ff6584" />} label="TDEE" value={`${tdee}`} unit="kcal/天" color="#ff6584" />
        <StatCard icon={<TrendingUp size={20} color="#6c63ff" />} label="目標熱量" value={`${macros.calories}`} unit="kcal/天" color="#6c63ff" />
        <StatCard icon={<Dumbbell size={20} color="#00d4aa" />} label="本週訓練" value={`${weekWorkouts}`} unit="次" color="#00d4aa" />
        <StatCard icon={<Apple size={20} color="#ffa500" />} label="今日攝取" value={`${todayCalories}`} unit={`/ ${targetCalories} kcal`} color="#ffa500" />
      </div>

      {/* Today calories bar */}
      <div className="card animate-fadein" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>今日熱量進度</span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{calPct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${calPct}%`,
            background: calPct > 110 ? 'var(--accent2)' : calPct > 90 ? 'var(--green)' : 'var(--accent)'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
          <span>蛋白質目標：{macros.protein}g</span>
          <span>碳水：{macros.carbs}g</span>
          <span>脂肪：{macros.fat}g</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fadein">
        {!hasPlan ? (
          <ActionCard
            icon={<Dumbbell size={20} />}
            title="建立你的訓練課表"
            desc="讓 AI 幫你規劃個人化訓練計劃"
            color="var(--accent)"
            onClick={() => onNavigate('training')}
          />
        ) : (
          <ActionCard
            icon={<Dumbbell size={20} />}
            title="查看今日訓練"
            desc="開始記錄你的訓練組數"
            color="var(--accent)"
            onClick={() => onNavigate('training')}
          />
        )}
        <ActionCard
          icon={<Apple size={20} />}
          title="記錄今日飲食"
          desc="輸入你吃的食物，AI 幫你算熱量"
          color="var(--green)"
          onClick={() => onNavigate('diet')}
        />
      </div>

      {/* Body info */}
      <div className="card animate-fadein" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>身體數據</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <InfoItem label="身高" value={`${user.height} cm`} />
          <InfoItem label="體重" value={`${user.weight} kg`} />
          {user.bodyFat ? <InfoItem label="體脂" value={`${user.bodyFat}%`} /> : <InfoItem label="BMI" value={`${bmi}`} />}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
  return (
    <div className="card" style={{ padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{unit}</div>
    </div>
  );
}

function ActionCard({ icon, title, desc, color, onClick }: { icon: React.ReactNode; title: string; desc: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
      padding: '16px', display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s'
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <ChevronRight size={18} color="var(--muted)" />
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
    </div>
  );
}
