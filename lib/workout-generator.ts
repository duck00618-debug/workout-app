import { WorkoutPlan, WorkoutDay, Exercise } from './types';

type Goal = 'hypertrophy' | 'strength' | 'endurance';
type Level = 'beginner' | 'intermediate' | 'advanced';

interface SetScheme { sets: number; reps: string; rest: number }

const schemes: Record<Goal, Record<Level, SetScheme>> = {
  hypertrophy: {
    beginner:     { sets: 3, reps: '10-12', rest: 75 },
    intermediate: { sets: 4, reps: '8-12',  rest: 75 },
    advanced:     { sets: 4, reps: '8-12',  rest: 60 },
  },
  strength: {
    beginner:     { sets: 3, reps: '5-6',  rest: 150 },
    intermediate: { sets: 4, reps: '4-6',  rest: 180 },
    advanced:     { sets: 5, reps: '3-5',  rest: 180 },
  },
  endurance: {
    beginner:     { sets: 2, reps: '15-20', rest: 40 },
    intermediate: { sets: 3, reps: '15-20', rest: 40 },
    advanced:     { sets: 3, reps: '20-25', rest: 30 },
  },
};

interface ExDef { name: string; group: string; note?: string }

const DB: Record<string, ExDef[]> = {
  chest: [
    { name: '槓鈴臥推',     group: '胸大肌',  note: '新手注意：肩胛骨夾緊，手肘不要完全外張' },
    { name: '啞鈴臥推',     group: '胸大肌',  note: '動作全程保持核心收緊' },
    { name: '上斜啞鈴臥推', group: '上胸',    note: '斜板角度 30-45 度效果最好' },
    { name: '啞鈴飛鳥',     group: '胸大肌',  note: '手肘微彎，感受胸部拉伸' },
    { name: '伏地挺身',     group: '胸大肌',  note: '新手首選！核心不要塌腰' },
    { name: '蝴蝶機夾胸',   group: '胸大肌' },
    { name: '下斜臥推',     group: '下胸' },
  ],
  back: [
    { name: '引體向上',     group: '背闊肌',  note: '新手可以用輔助帶，手比肩略寬' },
    { name: '滑輪下拉',     group: '背闊肌',  note: '把槓拉到下巴位置，感受背部收縮' },
    { name: '坐姿划船',     group: '中背部' },
    { name: '啞鈴單臂划船', group: '背闊肌',  note: '保持背部平直，不要聳肩' },
    { name: '正握俯身划船', group: '中背部' },
    { name: '槓鈴硬舉',     group: '全背部',  note: '新手必學！背打直，腹部收緊' },
    { name: '直腿硬舉',     group: '下背/腿後腱' },
    { name: '反手滑輪下拉', group: '背闊肌' },
  ],
  shoulder: [
    { name: '啞鈴肩推',     group: '三角肌',  note: '不要完全鎖死手肘，保持張力' },
    { name: '槓鈴站姿肩推', group: '三角肌前束' },
    { name: '側平舉',       group: '三角肌側束', note: '手肘微彎，不要用甩的' },
    { name: '前平舉',       group: '三角肌前束' },
    { name: '面拉',         group: '後三角/斜方',note: '用繩索，肘部帶到耳朵高度' },
    { name: '俯身側平舉',   group: '後三角肌' },
    { name: '啞鈴聳肩',     group: '斜方肌' },
  ],
  biceps: [
    { name: '站姿槓鈴彎舉', group: '二頭肌',  note: '身體不要借力，手肘固定在身體側邊' },
    { name: '啞鈴交替彎舉', group: '二頭肌' },
    { name: '錘式彎舉',     group: '二頭肌/肱肌' },
    { name: '集中彎舉',     group: '二頭肌' },
    { name: '繩索彎舉',     group: '二頭肌' },
  ],
  triceps: [
    { name: '繩索三頭下壓', group: '三頭肌',  note: '手肘固定，只動前臂' },
    { name: '仰臥三頭伸展', group: '三頭肌' },
    { name: '過頭三頭伸展', group: '三頭肌長頭' },
    { name: '窄距臥推',     group: '三頭肌',  note: '手握距約肩寬，手肘貼緊身體' },
    { name: '雙槓撐體',     group: '三頭肌' },
  ],
  legs: [
    { name: '槓鈴深蹲',     group: '股四頭肌', note: '新手必練！膝蓋不要超過腳尖太多，背部打直' },
    { name: '腿推機',       group: '股四頭肌', note: '脚放高一點可以多練到腿後腱' },
    { name: '羅馬尼亞硬舉', group: '腿後腱',   note: '感受腿後側拉伸，背部全程打直' },
    { name: '腿彎舉',       group: '腿後腱' },
    { name: '腿伸展',       group: '股四頭肌' },
    { name: '啞鈴弓箭步',   group: '股四頭肌/臀部' },
    { name: '保加利亞分腿蹲', group: '股四頭肌/臀部' },
    { name: '坐姿腿推',     group: '臀大肌/股四頭' },
    { name: '站姿小腿提踵', group: '小腿',     note: '保持全幅度動作，頂點停頓一秒' },
    { name: '臀橋',         group: '臀大肌',   note: '新手練臀首選，感受臀部收緊' },
  ],
  abs: [
    { name: '捲腹',         group: '腹直肌',  note: '不是仰臥起坐，只需把肩膀離地即可' },
    { name: '平板支撐',     group: '核心',    note: '保持 30-60 秒，腹部收緊' },
    { name: '懸垂抬腿',     group: '下腹部' },
    { name: '俄羅斯轉體',   group: '腹斜肌' },
    { name: '山式爬行',     group: '核心' },
  ],
};

function pick(arr: ExDef[], n: number): ExDef[] {
  return arr.slice(0, n);
}

function toEx(def: ExDef, scheme: SetScheme): Exercise {
  return {
    name: def.name,
    muscleGroup: def.group,
    sets: scheme.sets,
    reps: scheme.reps,
    restSeconds: scheme.rest,
    notes: def.note,
  };
}

function makeDay(focus: string, groups: string[], s: SetScheme, level: Level, isBegin: boolean): WorkoutDay {
  const perGroup = isBegin ? 2 : 3;
  const exercises: Exercise[] = [];
  for (const g of groups) {
    const pool = DB[g] ?? [];
    pick(pool, perGroup).forEach(d => exercises.push(toEx(d, s)));
  }
  return { day: '', focus, exercises };
}

const WEEKDAYS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
const REST_DAY: WorkoutDay = { day: '', focus: '休息', exercises: [] };

export function generatePlan(
  split: string,
  trainingGoal: Goal,
  level: Level
): Omit<WorkoutPlan, 'id' | 'createdAt'> {
  const s = schemes[trainingGoal][level];
  const isBeg = level === 'beginner';
  const goalLabel = { hypertrophy: '肌肥大', strength: '增力', endurance: '肌耐力' }[trainingGoal];
  const levelLabel = { beginner: '新手', intermediate: '中階', advanced: '進階' }[level];

  let days: Omit<WorkoutDay, 'day'>[] = [];

  if (split === 'fullBody') {
    const fbGroups = isBeg
      ? [['chest', 'back', 'legs']]
      : [['chest', 'back', 'legs', 'shoulder'], ['chest', 'back', 'legs', 'abs']];
    if (isBeg) {
      days = [
        makeDay('全身訓練A', fbGroups[0], s, level, isBeg),
        { focus: '休息', exercises: [] },
        makeDay('全身訓練B', ['legs', 'back', 'chest'], s, level, isBeg),
        { focus: '休息', exercises: [] },
        makeDay('全身訓練A', fbGroups[0], s, level, isBeg),
        { focus: '休息', exercises: [] },
        { focus: '休息', exercises: [] },
      ];
    } else {
      days = [
        makeDay('全身訓練A', fbGroups[0], s, level, isBeg),
        { focus: '休息', exercises: [] },
        makeDay('全身訓練B', fbGroups[1], s, level, isBeg),
        { focus: '休息', exercises: [] },
        makeDay('全身訓練C', ['legs', 'shoulder', 'back', 'abs'], s, level, isBeg),
        { focus: '休息', exercises: [] },
        { focus: '休息', exercises: [] },
      ];
    }
  } else if (split === 'upperLower') {
    days = [
      makeDay('上半身A（推）', ['chest', 'shoulder', 'triceps'], s, level, isBeg),
      makeDay('下半身A', ['legs', 'abs'], s, level, isBeg),
      { focus: '休息', exercises: [] },
      makeDay('上半身B（拉）', ['back', 'biceps'], s, level, isBeg),
      makeDay('下半身B', ['legs', 'abs'], s, level, isBeg),
      { focus: '休息', exercises: [] },
      { focus: '休息', exercises: [] },
    ];
  } else if (split === 'PPL') {
    days = [
      makeDay('推（胸 + 肩 + 三頭）', ['chest', 'shoulder', 'triceps'], s, level, isBeg),
      makeDay('拉（背 + 二頭）', ['back', 'biceps'], s, level, isBeg),
      makeDay('腿 + 核心', ['legs', 'abs'], s, level, isBeg),
      { focus: '休息', exercises: [] },
      makeDay('推（胸 + 肩 + 三頭）', ['chest', 'shoulder', 'triceps'], s, level, isBeg),
      makeDay('拉（背 + 二頭）', ['back', 'biceps'], s, level, isBeg),
      makeDay('腿 + 核心', ['legs', 'abs'], s, level, isBeg),
    ];
  } else if (split === 'chestBack') {
    days = [
      makeDay('胸 + 三頭', ['chest', 'triceps'], s, level, isBeg),
      makeDay('背 + 二頭', ['back', 'biceps'], s, level, isBeg),
      makeDay('腿 + 核心', ['legs', 'abs'], s, level, isBeg),
      { focus: '休息', exercises: [] },
      makeDay('肩 + 手臂', ['shoulder', 'biceps', 'triceps'], s, level, isBeg),
      makeDay('腿（補強）', ['legs', 'abs'], s, level, isBeg),
      { focus: '休息', exercises: [] },
    ];
  } else {
    // bro split
    days = [
      makeDay('胸',       ['chest', 'triceps'], s, level, isBeg),
      makeDay('背',       ['back', 'biceps'],   s, level, isBeg),
      makeDay('腿',       ['legs', 'abs'],       s, level, isBeg),
      makeDay('肩',       ['shoulder'],          s, level, isBeg),
      makeDay('手臂 + 核心', ['biceps', 'triceps', 'abs'], s, level, isBeg),
      { focus: '休息', exercises: [] },
      { focus: '休息', exercises: [] },
    ];
  }

  const schedule: WorkoutDay[] = days.map((d, i) => ({ ...d, day: WEEKDAYS[i] }));

  const splitLabel: Record<string, string> = {
    PPL: 'PPL 推拉腿', upperLower: '上下分化', fullBody: '全身訓練',
    chestBack: '胸背腿', bro: '部位分化',
  };

  return {
    name: `${splitLabel[split]} · ${goalLabel} · ${levelLabel}`,
    split,
    trainingGoal,
    level,
    schedule,
  };
}
