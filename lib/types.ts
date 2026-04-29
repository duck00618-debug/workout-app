export interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  birthdate: string; // YYYY-MM-DD
  height: number; // cm
  weight: number; // kg
  bodyFat?: number; // %
  goal: 'bulk' | 'cut' | 'maintain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  apiKey?: string;
}

export interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string; // e.g. "8-12" or "15-20"
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  day: string; // e.g. "週一"
  focus: string; // e.g. "胸 + 三頭"
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  split: string;
  trainingGoal: 'hypertrophy' | 'strength' | 'endurance';
  level: 'beginner' | 'intermediate' | 'advanced';
  schedule: WorkoutDay[];
  createdAt: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number; // kg
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  planId: string;
  dayFocus: string;
  date: string; // YYYY-MM-DD
  exercises: {
    name: string;
    sets: WorkoutSet[];
  }[];
  completed: boolean;
  durationMinutes?: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  amount: string;
  time: string;
}

export interface DietLog {
  date: string; // YYYY-MM-DD
  entries: FoodEntry[];
}

export type TrainingSplit =
  | 'PPL'
  | 'upperLower'
  | 'fullBody'
  | 'chestBack'
  | 'bro';
