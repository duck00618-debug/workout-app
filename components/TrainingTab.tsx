'use client';

import { useEffect, useState } from 'react';
import { getUser, getActivePlan, savePlan, setActivePlan, getLogs, saveLog } from '@/lib/storage';
import { WorkoutPlan, WorkoutLog, UserProfile } from '@/lib/types';
import { generatePlan } from '@/lib/workout-generator';
import { today } from '@/lib/calculations';
import { Dumbbell, Plus, ChevronRight, CheckCircle, Circle, Zap, Home, Wind, PlayCircle, X } from 'lucide-react';
import { EquipmentType } from '@/lib/types';

type View = 'overview' | 'create' | 'workout';

export default function TrainingTab() {
  const [view, setView] = useState<View>('overview');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeLog, setActiveLog] = useState<WorkoutLog | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [tutorialEx, setTutorialEx] = useState<string | null>(null);

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

  if (tutorialEx) return (
    <ExerciseTutorial name={tutorialEx} onClose={() => setTutorialEx(null)} />
  );

  if (view === 'workout' && activeLog && plan) {
    return (
      <WorkoutView
        log={activeLog}
        plan={plan}
        dayIdx={activeDayIdx}
        onFinish={() => { setPlan(getActivePlan()); setView('overview'); }}
        onTutorial={setTutorialEx}
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
                  {plan.equipment && (
                    <span className="badge" style={{ background: 'rgba(255,165,0,0.1)', color: '#ffa500' }}>
                      {{ gym: '🏋️ 健身房', dumbbells: '💪 啞鈴', bodyweight: '🏠 徒手' }[plan.equipment]}
                    </span>
                  )}
                  {plan.includeCardio && (
                    <span className="badge" style={{ background: 'rgba(255,101,132,0.1)', color: '#ff6584' }}>有氧</span>
                  )}
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
                        <div key={ei} style={{ fontSize: 12, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button onClick={() => setTutorialEx(ex.name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, padding: 0, textAlign: 'left' }}>
                            <PlayCircle size={13} />
                            {ex.name}
                          </button>
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
  const [equipment, setEquipment] = useState<EquipmentType>('gym');
  const [includeCardio, setIncludeCardio] = useState(false);

  const splits = [
    { v: 'fullBody',   l: '全身訓練',     d: '每次練全身，每週 3 次 — 新手首選',       badge: '' },
    { v: 'gluteLeg',   l: '臀腿強化',     d: '臀腿為主 + 上半身輔助，每週 4–5 次',    badge: '女性推薦' },
    { v: 'upperLower', l: '上下半身分化', d: '上半身 / 下半身交替，每週 4 次',         badge: '' },
    { v: 'PPL',        l: '推拉腿（PPL）', d: '推 / 拉 / 腿三天循環，每週 6 次',      badge: '' },
    { v: 'chestBack',  l: '胸背腿',       d: '傳統三分化，每週 5–6 次',               badge: '' },
    { v: 'bro',        l: '部位分化',     d: '每天專攻一個部位，每週 5–6 次',          badge: '' },
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
    const partial = generatePlan(split, trainingGoal, level, equipment, includeCardio);
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
                <div style={{ fontWeight: 700, color: split === s.v ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {s.l}
                  {s.v === 'fullBody' && <span className="badge" style={{ background: 'rgba(0,212,170,0.15)', color: 'var(--green)', fontSize: 10 }}>新手推薦</span>}
                  {s.badge && <span className="badge" style={{ background: 'rgba(255,101,132,0.15)', color: '#ff6584', fontSize: 10 }}>{s.badge}</span>}
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

        {/* Equipment */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>訓練環境</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              { v: 'gym'        as EquipmentType, l: '健身房', sub: '完整器材：槓鈴、機器、啞鈴都有', icon: '🏋️' },
              { v: 'dumbbells'  as EquipmentType, l: '啞鈴居家', sub: '只有啞鈴，適合在家訓練', icon: '💪' },
              { v: 'bodyweight' as EquipmentType, l: '徒手居家', sub: '完全不需器材，隨時隨地可練', icon: '🏠' },
            ]).map(e => (
              <button key={e.v} onClick={() => setEquipment(e.v)}
                style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${equipment === e.v ? 'var(--accent)' : 'var(--border)'}`, background: equipment === e.v ? 'rgba(108,99,255,0.15)' : 'var(--surface)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: equipment === e.v ? 'var(--accent)' : 'var(--text)', marginRight: 8 }}>{e.icon} {e.l}</span>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{e.sub}</div>
                </div>
                {equipment === e.v && <CheckCircle size={18} color="var(--accent)" />}
              </button>
            ))}
          </div>
        </div>

        {/* Cardio */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>有氧訓練</label>
          <button onClick={() => setIncludeCardio(v => !v)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${includeCardio ? 'var(--accent)' : 'var(--border)'}`, background: includeCardio ? 'rgba(108,99,255,0.15)' : 'var(--surface)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wind size={18} color={includeCardio ? 'var(--accent)' : 'var(--muted)'} />
              <div>
                <div style={{ fontWeight: 700, color: includeCardio ? 'var(--accent)' : 'var(--text)', fontSize: 14 }}>加入有氧</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>每次訓練結尾加入 20-30 分鐘有氧</div>
              </div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: includeCardio ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: includeCardio ? 22 : 2, width: 20, height: 20, borderRadius: 10, background: 'white', transition: 'left 0.2s' }} />
            </div>
          </button>
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
function WorkoutView({ log, plan, dayIdx, onFinish, onTutorial }: { log: WorkoutLog; plan: WorkoutPlan; dayIdx: number; onFinish: () => void; onTutorial: (name: string) => void }) {
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{ex.name}</div>
                  <button onClick={() => onTutorial(ex.name)}
                    style={{ background: 'rgba(108,99,255,0.12)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--accent)', padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <PlayCircle size={13} /> 教學
                  </button>
                </div>
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

// ── Exercise Tutorial ─────────────────────────────────────────
type GuideData = { muscles: string[]; steps: string[]; tips: string[]; mistakes: string[] };

// wger muscle IDs + which body view they appear on
// SVGs served from wger.de static files (Wikimedia Commons origin, CC BY 3.0)
const WGER_BASE = 'https://wger.de/static/images/muscles';
type MuscleView = 'front' | 'back';
const MUSCLE_IDS: Record<string, { id: number; view: MuscleView }> = {
  '胸大肌': { id: 4, view: 'front' }, '上胸': { id: 4, view: 'front' },
  '下胸': { id: 4, view: 'front' }, '前鋸肌': { id: 3, view: 'front' },
  '三角肌': { id: 2, view: 'front' }, '三角肌前束': { id: 2, view: 'front' },
  '三角肌側束': { id: 2, view: 'front' }, '後三角肌': { id: 2, view: 'back' },
  '後三角/斜方': { id: 2, view: 'back' }, '二頭肌': { id: 1, view: 'front' },
  '二頭肌/肱肌': { id: 1, view: 'front' }, '三頭肌': { id: 5, view: 'back' },
  '三頭肌長頭': { id: 5, view: 'back' }, '背闊肌': { id: 12, view: 'back' },
  '中背部': { id: 12, view: 'back' }, '全背部': { id: 12, view: 'back' },
  '斜方肌': { id: 9, view: 'back' }, '股四頭肌': { id: 10, view: 'front' },
  '股四頭肌/臀部': { id: 10, view: 'front' }, '腿後腱': { id: 11, view: 'back' },
  '下背/腿後腱': { id: 11, view: 'back' }, '臀大肌': { id: 8, view: 'back' },
  '臀中肌': { id: 8, view: 'back' }, '小腿': { id: 7, view: 'back' },
  '腹直肌': { id: 6, view: 'front' }, '核心': { id: 6, view: 'front' },
  '下腹部': { id: 6, view: 'front' }, '腹斜肌': { id: 6, view: 'front' },
};

function MuscleDiagram({ muscles }: { muscles: string[] }) {
  const hits = muscles.map(m => MUSCLE_IDS[m]).filter(Boolean);
  const frontIds = [...new Set(hits.filter(h => h.view === 'front').map(h => h.id))];
  const backIds  = [...new Set(hits.filter(h => h.view === 'back').map(h => h.id))];
  const showFront = frontIds.length > 0;
  const showBack  = backIds.length > 0;
  if (!showFront && !showBack) return null;

  const Panel = ({ view, ids }: { view: MuscleView; ids: number[] }) => (
    <div style={{ flex: 1, position: 'relative' }}>
      <img src={`${WGER_BASE}/muscular_system_${view}.svg`} alt={view}
        style={{ width: '100%', display: 'block', filter: 'grayscale(100%) brightness(0.85)' }} />
      {ids.map(id => (
        <img key={id} src={`${WGER_BASE}/main/muscle-${id}.svg`} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      ))}
    </div>
  );

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, background: 'var(--surface2)', borderRadius: 14, padding: 12 }}>
        {showFront && <Panel view="front" ids={frontIds} />}
        {showBack  && <Panel view="back"  ids={backIds} />}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>
        Muscle diagram · wger project · CC BY 3.0
      </div>
    </div>
  );
}


function ExerciseTutorial({ name, onClose }: { name: string; onClose: () => void }) {
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/exercise-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setGuide(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [name]);


  const Section = ({ emoji, title, items, color }: { emoji: string; title: string; items: string[]; color: string }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ minWidth: 22, height: 22, borderRadius: 6, background: `${color}22`, color, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>動作教學</div>
        </div>
        <button onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>AI 正在生成教學…</span>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--muted)', marginBottom: 8 }}>載入失敗，請再試一次</p>
            <p style={{ color: '#ff6584', fontSize: 12, marginBottom: 16, wordBreak: 'break-all' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => {
              setLoading(true); setError('');
              fetch('/api/exercise-guide', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
                .then(r => r.json()).then(d => { if (d.error) throw new Error(d.error); setGuide(d); }).catch(e => setError(e.message)).finally(() => setLoading(false));
            }}>重新載入</button>
          </div>
        )}

        {guide && !loading && (
          <div className="animate-fadein">
            {/* Muscle tags */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>💪</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>目標肌群</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {guide.muscles.map((m, i) => (
                  <span key={i} className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', padding: '6px 12px', fontSize: 13, borderRadius: 20 }}>{m}</span>
                ))}
              </div>
            </div>

            <Section emoji="📋" title="動作步驟" items={guide.steps} color="var(--accent)" />
            <Section emoji="⭐" title="重點提示" items={guide.tips} color="var(--green)" />
            <Section emoji="⚠️" title="常見錯誤" items={guide.mistakes} color="#ff6584" />
          </div>
        )}
      </div>
    </div>
  );
}
