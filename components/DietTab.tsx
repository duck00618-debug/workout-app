'use client';

import { useEffect, useState } from 'react';
import { getUser, getDietLog, addFoodEntry, removeFoodEntry } from '@/lib/storage';
import { calcMacros, today } from '@/lib/calculations';
import { FoodEntry } from '@/lib/types';
import { MacroTargets } from '@/lib/calculations';
import { FOOD_DB, searchFood, CATEGORIES, getFoodByCategory, FoodItem } from '@/lib/food-database';
import { Plus, Trash2, Search, Apple, X, ChevronDown, Camera, RefreshCw } from 'lucide-react';

type Panel = 'log' | 'search' | 'manual' | 'photo';
type PhotoState = 'idle' | 'analyzing' | 'result' | 'error' | 'nokey';

export default function DietTab() {
  const [macros, setMacros] = useState<MacroTargets | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [panel, setPanel] = useState<Panel>('log');
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [manual, setManual] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', amount: '' });
  const [photoState, setPhotoState] = useState<PhotoState>('idle');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoResult, setPhotoResult] = useState<FoodEntry | null>(null);
  const goalLabel = { bulk: '增肌', cut: '減脂', maintain: '維持' };

  const reload = () => {
    const u = getUser();
    if (u) setMacros(calcMacros(u));
    setEntries(getDietLog(today()).entries);
  };

  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (query.trim()) setResults(searchFood(query));
    else setResults([]);
  }, [query]);

  const addFromDB = (item: FoodItem) => {
    const entry: FoodEntry = {
      id: `food_${Date.now()}`,
      name: item.name,
      amount: item.amount,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    };
    addFoodEntry(today(), entry);
    reload();
    setPanel('log');
    setQuery('');
  };

  const addManual = () => {
    if (!manual.name || !manual.calories) return;
    const entry: FoodEntry = {
      id: `food_${Date.now()}`,
      name: manual.name,
      amount: manual.amount || '1份',
      calories: Number(manual.calories),
      protein: Number(manual.protein) || 0,
      carbs: Number(manual.carbs) || 0,
      fat: Number(manual.fat) || 0,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    };
    addFoodEntry(today(), entry);
    setManual({ name: '', calories: '', protein: '', carbs: '', fat: '', amount: '' });
    reload();
    setPanel('log');
  };

  const remove = (id: string) => { removeFoodEntry(today(), id); reload(); };

  const compressImage = (dataUrl: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, 1024 / img.width);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const compressed = await compressImage(raw);
      setPhotoPreview(compressed);
      setPhotoState('analyzing');

      try {
        const u = getUser();
        const res = await fetch('/api/food-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: compressed, apiKey: u?.apiKey }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setPhotoResult({
          id: `food_${Date.now()}`,
          name: data.name,
          amount: data.amount,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        });
        setPhotoState('result');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '';
        setPhotoState(msg.includes('No API key') ? 'nokey' : 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmPhotoEntry = () => {
    if (!photoResult) return;
    addFoodEntry(today(), photoResult);
    reload();
    setPanel('log');
    setPhotoState('idle');
    setPhotoPreview(null);
    setPhotoResult(null);
  };

  const resetPhoto = () => {
    setPhotoState('idle');
    setPhotoPreview(null);
    setPhotoResult(null);
  };

  const totals = entries.reduce(
    (acc, e) => ({ cal: acc.cal + e.calories, p: acc.p + e.protein, c: acc.c + e.carbs, f: acc.f + e.fat }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );
  const pct = (v: number, t: number) => Math.min(100, t ? Math.round((v / t) * 100) : 0);

  return (
    <div style={{ padding: '24px 16px', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>飲食追蹤</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        {(() => { const u = getUser(); return u ? goalLabel[u.goal] : ''; })()}
      </p>

      {/* Macro summary */}
      {macros && (
        <div className="card animate-fadein" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>今日目標</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
                {macros.calories} <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>kcal</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>已攝取</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{totals.cal}</div>
            </div>
          </div>
          <div className="progress-bar" style={{ marginBottom: 14 }}>
            <div className="progress-fill" style={{
              width: `${pct(totals.cal, macros.calories)}%`,
              background: totals.cal > macros.calories * 1.1 ? 'var(--accent2)' : 'var(--accent)'
            }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <MacroBar label="蛋白質" current={totals.p} target={macros.protein} color="#6c63ff" />
            <MacroBar label="碳水" current={totals.c} target={macros.carbs} color="#ffa500" />
            <MacroBar label="脂肪" current={totals.f} target={macros.fat} color="#ff6584" />
          </div>
        </div>
      )}

      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([['log', '今日記錄'], ['search', '搜尋食物'], ['manual', '手動輸入'], ['photo', '拍照辨識']] as [Panel, string][]).map(([p, l]) => (
          <button key={p} onClick={() => { setPanel(p); if (p !== 'photo') resetPhoto(); }}
            className="btn"
            style={{ flex: 1, padding: '9px 2px', fontSize: 11, background: panel === p ? 'var(--accent)' : 'var(--surface2)', color: panel === p ? 'white' : 'var(--muted)', border: `1px solid ${panel === p ? 'var(--accent)' : 'var(--border)'}` }}>
            {l}
          </button>
        ))}
      </div>

      {/* Search panel */}
      {panel === 'search' && (
        <div className="animate-fadein">
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="搜尋食物名稱，例如：雞胸肉、滷肉飯..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {query ? (
            results.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map((item, i) => <FoodRow key={i} item={item} onAdd={addFromDB} />)}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>找不到「{query}」，試試手動輸入</p>
            )
          ) : (
            <div>
              {/* Category tabs */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: `1px solid ${activeCategory === cat ? 'var(--accent)' : 'var(--border)'}`, background: activeCategory === cat ? 'rgba(108,99,255,0.15)' : 'var(--surface2)', color: activeCategory === cat ? 'var(--accent)' : 'var(--muted)' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getFoodByCategory(activeCategory).map((item, i) => <FoodRow key={i} item={item} onAdd={addFromDB} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual input panel */}
      {panel === 'manual' && (
        <div className="card animate-fadein">
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>手動輸入食物</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>食物名稱 *</label>
                <input className="input" placeholder="例：雞胸肉" value={manual.name} onChange={e => setManual(m => ({ ...m, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>份量</label>
                <input className="input" placeholder="例：100g" value={manual.amount} onChange={e => setManual(m => ({ ...m, amount: e.target.value }))} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>熱量（kcal）*</label>
              <input className="input" type="number" placeholder="0" value={manual.calories} onChange={e => setManual(m => ({ ...m, calories: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>蛋白質 g</label>
                <input className="input" type="number" placeholder="0" value={manual.protein} onChange={e => setManual(m => ({ ...m, protein: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>碳水 g</label>
                <input className="input" type="number" placeholder="0" value={manual.carbs} onChange={e => setManual(m => ({ ...m, carbs: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>脂肪 g</label>
                <input className="input" type="number" placeholder="0" value={manual.fat} onChange={e => setManual(m => ({ ...m, fat: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={addManual} disabled={!manual.name || !manual.calories} style={{ width: '100%' }}>
              <Plus size={16} /> 新增到今日記錄
            </button>
          </div>
        </div>
      )}

      {/* Photo panel */}
      {panel === 'photo' && (
        <div className="animate-fadein">
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />

          {photoState === 'idle' && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Camera size={40} style={{ margin: '0 auto 12px', color: 'var(--accent)' }} />
              <p style={{ marginBottom: 8, fontWeight: 600 }}>拍下你的餐點</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>AI 會自動辨識食物並估算熱量</p>
              <label htmlFor="photo-input" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
                <Camera size={16} /> 拍照 / 選擇圖片
              </label>
            </div>
          )}

          {(photoState === 'analyzing' || photoState === 'result' || photoState === 'error') && photoPreview && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
              <img src={photoPreview} alt="食物照片" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {photoState === 'analyzing' && (
            <div className="card animate-fadein" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>AI 辨識中...</p>
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>正在分析食物熱量</p>
            </div>
          )}

          {photoState === 'nokey' && (
            <div className="card animate-fadein" style={{ padding: '20px' }}>
              <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--accent2)' }}>功能尚未啟用</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                請到 Vercel 後台設定 <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>GOOGLE_AI_API_KEY</code> 環境變數後重新部署。
              </p>
              <button className="btn btn-ghost" onClick={resetPhoto} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={15} /> 返回
              </button>
            </div>
          )}

          {photoState === 'error' && (
            <div className="card animate-fadein" style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ color: 'var(--accent2)', fontWeight: 600, marginBottom: 12 }}>辨識失敗，請再試一次</p>
              <button className="btn btn-primary" onClick={resetPhoto} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={15} /> 重新拍照
              </button>
            </div>
          )}

          {photoState === 'result' && photoResult && (
            <div className="card animate-fadein">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{photoResult.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{photoResult.amount}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, textAlign: 'center', marginBottom: 16 }}>
                <TotalItem label="熱量" value={`${photoResult.calories}`} unit="kcal" />
                <TotalItem label="蛋白質" value={`${photoResult.protein}`} unit="g" />
                <TotalItem label="碳水" value={`${photoResult.carbs}`} unit="g" />
                <TotalItem label="脂肪" value={`${photoResult.fat}`} unit="g" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={confirmPhotoEntry} style={{ flex: 1 }}>
                  <Plus size={15} /> 加入記錄
                </button>
                <button className="btn btn-ghost" onClick={resetPhoto} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={15} /> 重拍
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log panel */}
      {panel === 'log' && (
        <div className="animate-fadein">
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <Apple size={36} style={{ margin: '0 auto 12px' }} />
              <p style={{ marginBottom: 16 }}>今天還沒有飲食記錄</p>
              <button className="btn btn-primary" onClick={() => setPanel('search')}>
                <Search size={16} /> 搜尋食物
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(entry => (
                <div key={entry.id} className="card animate-fadein" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{entry.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{entry.amount} · {entry.time}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>{entry.calories} kcal</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>蛋白 {entry.protein}g</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>碳水 {entry.carbs}g</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>脂肪 {entry.fat}g</span>
                      </div>
                    </div>
                    <button onClick={() => remove(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', marginLeft: 8 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="card" style={{ marginTop: 4, padding: '14px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
                <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--accent)', fontSize: 14 }}>今日合計</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                  <TotalItem label="熱量" value={`${totals.cal}`} unit="kcal" />
                  <TotalItem label="蛋白質" value={`${totals.p}`} unit="g" />
                  <TotalItem label="碳水" value={`${totals.c}`} unit="g" />
                  <TotalItem label="脂肪" value={`${totals.f}`} unit="g" />
                </div>
              </div>

              <button className="btn btn-ghost" onClick={() => setPanel('search')} style={{ width: '100%', marginTop: 4 }}>
                <Plus size={16} /> 繼續新增食物
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FoodRow({ item, onAdd }: { item: FoodItem; onAdd: (item: FoodItem) => void }) {
  return (
    <div className="card animate-fadein" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.amount}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{item.calories} kcal</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>蛋白 {item.protein}g</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>碳 {item.carbs}g</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>脂 {item.fat}g</span>
        </div>
      </div>
      <button
        onClick={() => onAdd(item)}
        style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(108,99,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent)' }}>
        <Plus size={18} />
      </button>
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min(100, target ? Math.round((current / target) * 100) : 0);
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color }}>{current}<span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>/{target}g</span></div>
      <div className="progress-bar" style={{ height: 4, marginTop: 5 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TotalItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{value} <span style={{ fontSize: 10, color: 'var(--muted)' }}>{unit}</span></div>
    </div>
  );
}
