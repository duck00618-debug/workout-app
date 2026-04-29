'use client';

import { useEffect, useState } from 'react';
import { getUser, getActivePlan, savePlan, setActivePlan, getLogs, saveLog } from '@/lib/storage';
import { WorkoutPlan, WorkoutLog, UserProfile } from '@/lib/types';
import { generatePlan } from '@/lib/workout-generator';
import { today } from '@/lib/calculations';
import { Dumbbell, Plus, ChevronRight, CheckCircle, Circle, Zap } from 'lucide-react';

type View = 'overview' | 'create' | 'workout';

export default function TrainingTab() {
  const [view, setView] = useState<View>('overview');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeLog, setActiveLog] = useState<WorkoutLog | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  useEffect(() => {
    setUser(getUser());
    const p = getActivePlan();
    setPlan(p);
  }, []);

  const startWorkout = (dayIdx: number) => {
    if (!plan) return;
    const day = plan.schedule[dayIdx];
    const existingLogs = getLogs();
    const existing = existingLogs.find(l => l.date === today() && l.planId === plan.id && !l.completed);
    if (existing) {
      setActiveLog(existing);
    } else {
      const log: WorkoutLog = {
        id: `log_${Date.now()}`,
        planId: plan.id,
        dayFocus: day.focus,
        date: today(),
        exercises: day.exercises.map(ex => ({
          name: ex.name,
          sets: Array(ex.sets).fill(null).map(() => ({ reps: 0, weight: 0, completed: false })),
        })),
        completed: false,
      };
      setActiveLog(log);
      saveLog(log);
    }
    setActiveDayIdx(dayIdx);
    setView('workout');
  };

  const onPlanCreated = (newPlan: WorkoutPlan) => {
    savePlan(newPlan);
    setActivePlan(newPlan.id);
    setPlan(newPlan);
    setView('overview');
  };

  if (view === 'create') return <CreatePlanView user={user} onCreated={onPlanCreated} onBack={() => setView('overview')} />;
  if (view === 'workout' && activeLog && plan) {
    return (
      <WorkoutView
        log={activeLog}
        plan={plan}
        dayIdx={activeDayIdx}
        onFinish={() => { setPlan(getActivePlan()); setView('overview'); }}
      />
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>訓練課表</h1>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setView('create')}>
          <Plus size={16} /> 新建
        </button>
      </div>

      {!plan ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }} className="animate-fadein">
          <Dumbbell size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>還沒有訓練課表</p>
          <button className="btn btn-primary" onClick={() => setView('create')}>
            <Zap size={18} /> 幫我生成課表
          </button>
        </div>
      ) : (
        <div className="animate-fadein">
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 16 }}>{plan.name}</h2>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent)' }}>
                    {{ hypertrophy: '肌肥大', strength: '增力', endurance: '肌耐力' }[plan.trainingGoal]}
                  </span>
                  <span className="badge" style={{ background: 'rgba(0,212,170,0.1)', color: 'var(--green)' }}>
                    {{ beginner: '新手', intermediate: '中階', advanced: '進階' }[plan.level]}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setView('create')}>更換</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plan.schedule.map((day, idx) => {
              const isRest = day.focus === '休息' || day.exercises.length === 0;
              const logs = getLogs();
              const done = logs.some(l => l.completed && l.dayFocus === day.focus);
              return (
                <div key={idx} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: isRest ? 'var(--surface2)' : done ? 'rgba(0,212,170,0.15)' : 'rgba(108,99,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isRest ? 'var(--muted)' : done ? 'var(--green)' : 'var(--accent)',
                      fontWeight: 700, fontSize: 13, flexShrink: 0
                    }}>
                      {day.day}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{day.focus}</div>
                      {!isRest && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {day.exercises.length} 個動作
                        </div>
                      )}
                    </div>
                    {!isRest && (
                      <button
                        className="btn"
                        style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0, background: done ? 'rgba(0,212,170,0.15)' : 'rgba(108,99,255,0.15)', color: done ? 'var(--green)' : 'var(--accent)', border: `1px solid ${done ? 'rgba(0,212,170,0.3)' : 'rgba(108,99,255,0.3)'}` }}
                        onClick={() => startWorkout(idx)}>
                        {done ? <CheckCircle size={16} /> : <ChevronRight size={16} />}
                        {done ? '已完成' : '開始'}
                      </button>
                    )}
                  </div>
                  {!isRest && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      {day.exercises.map((ex, ei) => (
                        <div key={ei} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
                          <span>{ex.name}</span>
                          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ex.sets} 組 × {ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create Plan ──────────────────────────────────────────────
function CreatePlanView({ user, onCreated, onBack }: { user: UserProfile | null; onCreated: (p: WorkoutPlan) => void; onBack: () => void }) {
  const [split, setSplit] = useState('PPL');
  const [trainingGoal, setTrainingGoal] = useState<'hypertrophy' | 'strength' | 'endurance'>('hypertrophy');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const splits = [
    { v: 'fullBody',   l: '全身訓練',     d: '每次練全身，每週 3 次 — 新手首選' },
    { v: 'upperLower', l: '上下半身分化', d: '上半身 / 下半身交替，每週 4 次' },
    { v: 'PPL',        l: '推拉腿（PPL）', d: '推 / 拉 / 腿三天循環，每週 6 次' },
    { v: 'chestBack',  l: '胸背腿',       d: '傳統三分化，每週 5–6 次' },
    { v: 'bro',        l: '部位分化',     d: '每天專攻一個部位，每週 5–6 次' },
  ];

  const goals = [
    { v: 'hypertrophy' as const, l: '肌肥大', d: `${trainingGoal === 'hypertrophy' ? '' : ''}8–12 下 × 3–4 組`, rec: true },
    { v: 'strength'    as const, l: '增力',   d: '3–6 下 × 4–5 組' },
    { v: 'endurance'   as const, l: '肌耐力', d: '15–20 下 × 2–3 組' },
  ];

  const levels = [
    { v: 'beginner'     as const, l: '新手', sub: '健身不到 1 年，動作偏少、附說明' },
    { v: 'intermediate' as const, l: '中階', sub: '健身 1–3 年' },
    { v: 'advanced'     as const, l: '進階', sub: '健身超過 3 年' },
  ];

  const generate = () => {
    const partial = generatePlan(split, trainingGoal, level);
    const plan: WorkoutPlan = {
      ...partial,
      id: `plan_${Date.now()}`,
      createdAt: today(),
    };
    onCreated(plan);
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={onBack}>← 返回</button>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>建立訓練課表</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Split */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>訓練分化方式</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {splits.map(s => (
              <button key={s.v} onClick={() => setSplit(s.v)}
                style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${split === s.v ? 'var(--accent)' : 'var(--border)'}`, background: split === s.v ? 'rgba(108,99,255,0.15)' : 'var(--surface)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: 700, color: split === s.v ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.l}
                  {s.v === 'fullBody' && <span className="badge" style={{ background: 'rgba(0,212,170,0.15)', color: 'var(--green)', fontSize: 10 }}>新手推薦</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.d}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>訓練目標</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {goals.map(g => (
              <button key={g.v} onClick={() => setTrainingGoal(g.v)}
                style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: `2px solid ${trainingGoal === g.v ? 'var(--accent)' : 'var(--border)'}`, background: trainingGoal === g.v ? 'rgba(108,99,255,0.15)' : 'var(--surface)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: trainingGoal === g.v ? 'var(--accent)' : 'var(--text)' }}>
                  {g.l}
                  {g.rec && <span style={{ display: 'block', fontSize: 9, color: 'var(--green)', marginTop: 2 }}>建議</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{g.d}</div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(108,99,255,0.08)', borderRadius: 10, fontSize: 12, color: 'var(--muted)' }}>
            {trainingGoal === 'hypertrophy' && '💡 肌肥大是增肌最有效的訓練方式，大多數人的首選'}
            {trainingGoal === 'strength' && '💡 低次數、高重量，專注在提升最大力量'}
            {trainingGoal === 'endurance' && '💡 高次數、輕重量，提升肌肉持久度'}
          </div>
        </div>

        {/* Level */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>訓練程度</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {levels.map(l => (
              <button key={l.v} onClick={() => setLevel(l.v)}
                style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${level === l.v ? 'var(--accent)' : 'var(--border)'}`, background: level === l.v ? 'rgba(108,99,255,0.15)' : 'var(--surface)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: level === l.v ? 'var(--accent)' : 'var(--text)' }}>{l.l}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={generate} style={{ width: '100%' }}>
          <Zap size={18} /> 立刻生成我的課表
        </button>
      </div>
    </div>
  );
}

// ── Workout Logging ──────────────────────────────────────────
function WorkoutView({ log, plan, dayIdx, onFinish }: { log: WorkoutLog; plan: WorkoutPlan; dayIdx: number; onFinish: () => void }) {
  const [currentLog, setCurrentLog] = useState<WorkoutLog>(log);
  const day = plan.schedule[dayIdx];

  const updateSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    setCurrentLog(prev => {
      const updated = {
        ...prev,
        exercises: prev.exercises.map((ex, ei) =>
          ei !== exIdx ? ex : {
            ...ex,
            sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s),
          }
        ),
      };
      saveLog(updated);
      return updated;
    });
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    setCurrentLog(prev => {
      const updated = {
        ...prev,
        exercises: prev.exercises.map((ex, ei) =>
          ei !== exIdx ? ex : {
            ...ex,
            sets: ex.sets.map((s, si) => si === setIdx ? { ...s, completed: !s.completed } : s),
          }
        ),
      };
      saveLog(updated);
      return updated;
    });
  };

  const finish = () => {
    const done: WorkoutLog = { ...currentLog, completed: true };
    saveLog(done);
    onFinish();
  };

  const totalSets = currentLog.exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const completedSets = currentLog.exercises.reduce((s, ex) => s + ex.sets.filter(set => set.completed).length, 0);
  const pct = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={onFinish}>← 返回</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800 }}>{day.focus}</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{day.day}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>完成進度</span>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>{completedSets} / {totalSets} 組</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--accent)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {currentLog.exercises.map((ex, exIdx) => {
          const planEx = day.exercises[exIdx];
          return (
            <div key={exIdx} className="card">
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  目標：{planEx?.sets} 組 × {planEx?.reps} 下 · 休息 {planEx?.restSeconds}s
                </div>
                {planEx?.notes && (
                  <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, padding: '6px 10px', background: 'rgba(108,99,255,0.1)', borderRadius: 8 }}>
                    💡 {planEx.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, marginBottom: 6, padding: '0 2px' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>組</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>kg</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>次數</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>✓</span>
              </div>

              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', opacity: set.completed ? 0.4 : 1 }}>{setIdx + 1}</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    style={{ textAlign: 'center', padding: '8px 4px', opacity: set.completed ? 0.5 : 1 }}
                    value={set.weight || ''}
                    placeholder="0"
                    onChange={e => updateSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    style={{ textAlign: 'center', padding: '8px 4px', opacity: set.completed ? 0.5 : 1 }}
                    value={set.reps || ''}
                    placeholder="0"
                    onChange={e => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                  />
                  <button onClick={() => toggleSet(exIdx, setIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                    {set.completed
                      ? <CheckCircle size={22} color="var(--green)" />
                      : <Circle size={22} color="var(--border)" />}
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button className="btn btn-primary" onClick={finish} style={{ width: '100%', marginTop: 20 }}>
        <CheckCircle size={18} /> 完成今日訓練 💪
      </button>
    </div>
  );
}
