import {
  UserProfile,
  WorkoutPlan,
  WorkoutLog,
  DietLog,
  FoodEntry,
} from './types';

const KEYS = {
  USER: 'wu_user',
  PLANS: 'wu_plans',
  ACTIVE_PLAN: 'wu_active_plan',
  LOGS: 'wu_logs',
  DIET: 'wu_diet',
};

function get<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// User
export const getUser = (): UserProfile | null => get(KEYS.USER);
export const saveUser = (user: UserProfile) => set(KEYS.USER, user);

// Plans
export const getPlans = (): WorkoutPlan[] => get<WorkoutPlan[]>(KEYS.PLANS) ?? [];
export const savePlan = (plan: WorkoutPlan) => {
  const plans = getPlans();
  const idx = plans.findIndex(p => p.id === plan.id);
  if (idx >= 0) plans[idx] = plan;
  else plans.push(plan);
  set(KEYS.PLANS, plans);
};

export const getActivePlan = (): WorkoutPlan | null => {
  const id = get<string>(KEYS.ACTIVE_PLAN);
  if (!id) return null;
  return getPlans().find(p => p.id === id) ?? null;
};
export const setActivePlan = (planId: string) => set(KEYS.ACTIVE_PLAN, planId);

// Workout Logs
export const getLogs = (): WorkoutLog[] => get<WorkoutLog[]>(KEYS.LOGS) ?? [];
export const saveLog = (log: WorkoutLog) => {
  const logs = getLogs();
  const idx = logs.findIndex(l => l.id === log.id);
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  set(KEYS.LOGS, logs);
};
export const getLogByDate = (date: string): WorkoutLog | null =>
  getLogs().find(l => l.date === date) ?? null;

// Diet
export const getDietLog = (date: string): DietLog => {
  const all = get<DietLog[]>(KEYS.DIET) ?? [];
  return all.find(d => d.date === date) ?? { date, entries: [] };
};
export const saveDietLog = (log: DietLog) => {
  const all = get<DietLog[]>(KEYS.DIET) ?? [];
  const idx = all.findIndex(d => d.date === log.date);
  if (idx >= 0) all[idx] = log;
  else all.push(log);
  set(KEYS.DIET, all);
};
export const addFoodEntry = (date: string, entry: FoodEntry) => {
  const log = getDietLog(date);
  log.entries.push(entry);
  saveDietLog(log);
};
export const removeFoodEntry = (date: string, entryId: string) => {
  const log = getDietLog(date);
  log.entries = log.entries.filter(e => e.id !== entryId);
  saveDietLog(log);
};
