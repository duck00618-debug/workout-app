import { WorkoutPlan, WorkoutDay, Exercise, EquipmentType } from './types';

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

// equip: 'gym' = 需要機器/槓鈴, 'db' = 啞鈴即可, 'bw' = 徒手
interface ExDef { name: string; group: string; note?: string; equip: 'gym' | 'db' | 'bw' }

const DB: Record<string, ExDef[]> = {
  glutes: [
    { name: '槓鈴臀推',     group: '臀大肌',  equip: 'gym', note: '肩膀靠在椅子上，頂點收緊臀部停頓 1 秒' },
    { name: '啞鈴臀推',     group: '臀大肌',  equip: 'db',  note: '感受臀部在頂點充分收縮' },
    { name: '繩索後踢',     group: '臀大肌',  equip: 'gym', note: '腳後踢到最高點時停頓收緊臀部' },
    { name: '髖外展機',     group: '臀中肌',  equip: 'gym' },
    { name: '相撲深蹲',     group: '臀大肌/大腿內側', equip: 'db', note: '腳大幅外張，下蹲感受臀部張力' },
    { name: '驢子踢腿',     group: '臀大肌',  equip: 'bw',  note: '核心收緊，腳跟朝天花板踢，頂點停頓' },
    { name: '消防栓式',     group: '臀中肌',  equip: 'bw',  note: '側向抬腿，訓練臀部外展肌群' },
    { name: '蚌殼式',       group: '臀中肌',  equip: 'bw',  note: '側躺膝蓋打開，用臀中肌帶動而不是腰' },
    { name: '臀橋',         group: '臀大肌',  equip: 'bw',  note: '頂點夾緊臀部停頓 2 秒，感受臀部發力' },
    { name: '單腳臀橋',     group: '臀大肌',  equip: 'bw',  note: '單腳版本增加難度，注意骨盆水平' },
  ],
  chest: [
    { name: '槓鈴臥推',       group: '胸大肌',  equip: 'gym', note: '新手注意：肩胛骨夾緊，手肘不要完全外張' },
    { name: '啞鈴臥推',       group: '胸大肌',  equip: 'db',  note: '動作全程保持核心收緊' },
    { name: '上斜啞鈴臥推',   group: '上胸',    equip: 'db',  note: '斜板角度 30-45 度效果最好' },
    { name: '啞鈴飛鳥',       group: '胸大肌',  equip: 'db',  note: '手肘微彎，感受胸部拉伸' },
    { name: '伏地挺身',       group: '胸大肌',  equip: 'bw',  note: '新手首選！核心不要塌腰' },
    { name: '上斜伏地挺身',   group: '上胸',    equip: 'bw',  note: '雙腳踩高處，訓練上胸' },
    { name: '菱形伏地挺身',   group: '胸大肌',  equip: 'bw',  note: '雙手成菱形，加強訓練胸部中線與三頭' },
    { name: '蝴蝶機夾胸',     group: '胸大肌',  equip: 'gym' },
    { name: '下斜臥推',       group: '下胸',    equip: 'gym' },
  ],
  back: [
    { name: '引體向上',       group: '背闊肌',  equip: 'bw',  note: '新手可以用輔助帶，手比肩略寬' },
    { name: '反手引體向上',   group: '背闊肌',  equip: 'bw',  note: '反手握可以更多招募二頭肌' },
    { name: '滑輪下拉',       group: '背闊肌',  equip: 'gym', note: '把槓拉到下巴位置，感受背部收縮' },
    { name: '坐姿划船',       group: '中背部',  equip: 'gym' },
    { name: '啞鈴單臂划船',   group: '背闊肌',  equip: 'db',  note: '保持背部平直，不要聳肩' },
    { name: '俯身啞鈴划船',   group: '中背部',  equip: 'db',  note: '背部打直，手肘朝後帶' },
    { name: '槓鈴硬舉',       group: '全背部',  equip: 'gym', note: '新手必學！背打直，腹部收緊' },
    { name: '直腿硬舉',       group: '下背/腿後腱', equip: 'db' },
    { name: '反手滑輪下拉',   group: '背闊肌',  equip: 'gym' },
  ],
  shoulder: [
    { name: '啞鈴肩推',       group: '三角肌',  equip: 'db',  note: '不要完全鎖死手肘，保持張力' },
    { name: '槓鈴站姿肩推',   group: '三角肌前束', equip: 'gym' },
    { name: '側平舉',         group: '三角肌側束', equip: 'db', note: '手肘微彎，不要用甩的' },
    { name: '前平舉',         group: '三角肌前束', equip: 'db' },
    { name: '面拉',           group: '後三角/斜方', equip: 'gym', note: '用繩索，肘部帶到耳朵高度' },
    { name: '俯身側平舉',     group: '後三角肌', equip: 'db' },
    { name: '啞鈴聳肩',       group: '斜方肌',  equip: 'db' },
    { name: '派克伏地挺身',   group: '三角肌前束', equip: 'bw', note: '臀部抬高呈倒 V，模擬肩推動作' },
  ],
  biceps: [
    { name: '站姿槓鈴彎舉',   group: '二頭肌',  equip: 'gym', note: '身體不要借力，手肘固定在身體側邊' },
    { name: '啞鈴交替彎舉',   group: '二頭肌',  equip: 'db' },
    { name: '錘式彎舉',       group: '二頭肌/肱肌', equip: 'db' },
    { name: '集中彎舉',       group: '二頭肌',  equip: 'db' },
    { name: '繩索彎舉',       group: '二頭肌',  equip: 'gym' },
  ],
  triceps: [
    { name: '繩索三頭下壓',   group: '三頭肌',  equip: 'gym', note: '手肘固定，只動前臂' },
    { name: '仰臥三頭伸展',   group: '三頭肌',  equip: 'db' },
    { name: '過頭三頭伸展',   group: '三頭肌長頭', equip: 'db' },
    { name: '雙槓撐體',       group: '三頭肌',  equip: 'bw' },
    { name: '窄距伏地挺身',   group: '三頭肌',  equip: 'bw',  note: '雙手靠攏，手肘貼身體，強調三頭' },
    { name: '窄距臥推',       group: '三頭肌',  equip: 'gym', note: '手握距約肩寬，手肘貼緊身體' },
  ],
  legs: [
    { name: '槓鈴深蹲',       group: '股四頭肌', equip: 'gym', note: '新手必練！膝蓋不要超過腳尖太多，背部打直' },
    { name: '腿推機',         group: '股四頭肌', equip: 'gym', note: '腳放高一點可以多練到腿後腱' },
    { name: '羅馬尼亞硬舉',   group: '腿後腱',  equip: 'db',  note: '感受腿後側拉伸，背部全程打直' },
    { name: '腿彎舉',         group: '腿後腱',  equip: 'gym' },
    { name: '腿伸展',         group: '股四頭肌', equip: 'gym' },
    { name: '啞鈴弓箭步',     group: '股四頭肌/臀部', equip: 'db' },
    { name: '保加利亞分腿蹲', group: '股四頭肌/臀部', equip: 'db' },
    { name: '深蹲',           group: '股四頭肌', equip: 'bw',  note: '徒手深蹲，注意膝蓋對齊腳尖方向' },
    { name: '弓箭步',         group: '股四頭肌/臀部', equip: 'bw' },
    { name: '臀橋',           group: '臀大肌',  equip: 'bw',  note: '新手練臀首選，感受臀部收緊' },
    { name: '單腳臀橋',       group: '臀大肌',  equip: 'bw',  note: '單腳版本增加難度與穩定性挑戰' },
    { name: '站姿小腿提踵',   group: '小腿',    equip: 'bw',  note: '保持全幅度動作，頂點停頓一秒' },
  ],
  abs: [
    { name: '捲腹',           group: '腹直肌',  equip: 'bw',  note: '不是仰臥起坐，只需把肩膀離地即可' },
    { name: '平板支撐',       group: '核心',    equip: 'bw',  note: '保持 30-60 秒，腹部收緊' },
    { name: '懸垂抬腿',       group: '下腹部',  equip: 'bw' },
    { name: '俄羅斯轉體',     group: '腹斜肌',  equip: 'bw' },
    { name: '山式爬行',       group: '核心',    equip: 'bw' },
  ],
};

const CARDIO_EX: Record<EquipmentType, ExDef> = {
  gym:        { name: '有氧（跑步機）',    group: '心肺', equip: 'gym', note: '中等速度 20-30 分鐘，心跳維持最大心跳的 60-70%' },
  dumbbells:  { name: '有氧（跳繩/慢跑）', group: '心肺', equip: 'bw',  note: '跳繩 15-20 分鐘或戶外慢跑 20-30 分鐘' },
  bodyweight: { name: '有氧（慢跑/跳繩）', group: '心肺', equip: 'bw',  note: '慢跑 20-30 分鐘或跳繩 15 分鐘，維持微喘的強度' },
};

function filterByEquip(pool: ExDef[], equipment: EquipmentType): ExDef[] {
  if (equipment === 'gym') return pool;
  if (equipment === 'dumbbells') return pool.filter(e => e.equip !== 'gym');
  return pool.filter(e => e.equip === 'bw');
}

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

function makeDay(
  focus: string,
  groups: string[],
  s: SetScheme,
  level: Level,
  isBegin: boolean,
  equipment: EquipmentType,
  includeCardio: boolean,
): WorkoutDay {
  const perGroup = isBegin ? 2 : 3;
  const exercises: Exercise[] = [];
  for (const g of groups) {
    const pool = filterByEquip(DB[g] ?? [], equipment);
    pick(pool, perGroup).forEach(d => exercises.push(toEx(d, s)));
  }
  if (includeCardio) {
    const cardio = CARDIO_EX[equipment];
    exercises.push({ name: cardio.name, muscleGroup: cardio.group, sets: 1, reps: '20-30分鐘', restSeconds: 0, notes: cardio.note });
  }
  return { day: '', focus, exercises };
}

const WEEKDAYS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

export function generatePlan(
  split: string,
  trainingGoal: Goal,
  level: Level,
  equipment: EquipmentType = 'gym',
  includeCardio = false,
): Omit<WorkoutPlan, 'id' | 'createdAt'> {
  const s = schemes[trainingGoal][level];
  const isBeg = level === 'beginner';
  const goalLabel = { hypertrophy: '肌肥大', strength: '增力', endurance: '肌耐力' }[trainingGoal];
  const levelLabel = { beginner: '新手', intermediate: '中階', advanced: '進階' }[level];
  const equipLabel = { gym: '健身房', dumbbells: '啞鈴', bodyweight: '徒手' }[equipment];

  const mk = (focus: string, groups: string[]) =>
    makeDay(focus, groups, s, level, isBeg, equipment, includeCardio);

  const rest: Omit<WorkoutDay, 'day'> = { focus: '休息', exercises: [] };

  let days: Omit<WorkoutDay, 'day'>[];

  if (split === 'fullBody') {
    const fbA = isBeg ? ['chest', 'back', 'legs'] : ['chest', 'back', 'legs', 'shoulder'];
    const fbB = isBeg ? ['legs', 'back', 'chest'] : ['chest', 'back', 'legs', 'abs'];
    days = isBeg
      ? [mk('全身訓練A', fbA), rest, mk('全身訓練B', fbB), rest, mk('全身訓練A', fbA), rest, rest]
      : [mk('全身訓練A', fbA), rest, mk('全身訓練B', fbB), rest, mk('全身訓練C', ['legs', 'shoulder', 'back', 'abs']), rest, rest];
  } else if (split === 'upperLower') {
    days = [
      mk('上半身A（推）', ['chest', 'shoulder', 'triceps']),
      mk('下半身A', ['legs', 'abs']),
      rest,
      mk('上半身B（拉）', ['back', 'biceps']),
      mk('下半身B', ['legs', 'abs']),
      rest,
      rest,
    ];
  } else if (split === 'PPL') {
    days = [
      mk('推（胸 + 肩 + 三頭）', ['chest', 'shoulder', 'triceps']),
      mk('拉（背 + 二頭）', ['back', 'biceps']),
      mk('腿 + 核心', ['legs', 'abs']),
      rest,
      mk('推（胸 + 肩 + 三頭）', ['chest', 'shoulder', 'triceps']),
      mk('拉（背 + 二頭）', ['back', 'biceps']),
      mk('腿 + 核心', ['legs', 'abs']),
    ];
  } else if (split === 'gluteLeg') {
    days = isBeg
      ? [
          mk('臀腿（臀部 + 腿後側）', ['glutes', 'legs']),
          rest,
          mk('上半身', ['chest', 'back', 'shoulder']),
          rest,
          mk('臀腿（股四頭 + 臀部）', ['legs', 'glutes', 'abs']),
          rest,
          rest,
        ]
      : [
          mk('臀腿A（臀部 + 腿後側）', ['glutes', 'legs']),
          mk('上半身A（推）', ['chest', 'shoulder', 'triceps']),
          rest,
          mk('臀腿B（股四頭 + 臀部）', ['legs', 'glutes', 'abs']),
          mk('上半身B（拉）', ['back', 'biceps']),
          rest,
          rest,
        ];
  } else if (split === 'chestBack') {
    days = [
      mk('胸 + 三頭', ['chest', 'triceps']),
      mk('背 + 二頭', ['back', 'biceps']),
      mk('腿 + 核心', ['legs', 'abs']),
      rest,
      mk('肩 + 手臂', ['shoulder', 'biceps', 'triceps']),
      mk('腿（補強）', ['legs', 'abs']),
      rest,
    ];
  } else {
    days = [
      mk('胸', ['chest', 'triceps']),
      mk('背', ['back', 'biceps']),
      mk('腿', ['legs', 'abs']),
      mk('肩', ['shoulder']),
      mk('手臂 + 核心', ['biceps', 'triceps', 'abs']),
      rest,
      rest,
    ];
  }

  const schedule: WorkoutDay[] = days.map((d, i) => ({ ...d, day: WEEKDAYS[i] }));

  const splitLabel: Record<string, string> = {
    PPL: 'PPL', upperLower: '上下分化', fullBody: '全身訓練',
    chestBack: '胸背腿', bro: '部位分化', gluteLeg: '臀腿強化',
  };

  return {
    name: `${splitLabel[split]} · ${goalLabel} · ${levelLabel} · ${equipLabel}`,
    split,
    trainingGoal,
    level,
    equipment,
    includeCardio,
    schedule,
  };
}
