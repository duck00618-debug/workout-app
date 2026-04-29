import { UserProfile } from './types';

export function calcAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function calcBMR(user: UserProfile): number {
  const age = calcAge(user.birthdate);
  // Mifflin-St Jeor
  if (user.gender === 'male') {
    return 10 * user.weight + 6.25 * user.height - 5 * age + 5;
  }
  return 10 * user.weight + 6.25 * user.height - 5 * age - 161;
}

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calcTDEE(user: UserProfile): number {
  return Math.round(calcBMR(user) * activityMultipliers[user.activityLevel]);
}

export function calcGoalCalories(
  tdee: number,
  goal: UserProfile['goal']
): number {
  if (goal === 'bulk') return tdee + 300;
  if (goal === 'cut') return tdee - 500;
  return tdee;
}

export interface MacroTargets {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

export function calcMacros(user: UserProfile): MacroTargets {
  const calories = calcGoalCalories(calcTDEE(user), user.goal);
  let protein: number;
  if (user.goal === 'bulk') protein = Math.round(user.weight * 2.0);
  else if (user.goal === 'cut') protein = Math.round(user.weight * 2.2);
  else protein = Math.round(user.weight * 1.8);

  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat };
}

export function calcBMI(height: number, weight: number): number {
  const h = height / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return '體重過輕';
  if (bmi < 24) return '正常';
  if (bmi < 27) return '過重';
  if (bmi < 30) return '輕度肥胖';
  return '中重度肥胖';
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
