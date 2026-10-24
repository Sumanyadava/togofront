// import { id } from "date-fns/locale";

import { atom, getDefaultStore } from "jotai";
import { collection, getDocs } from "firebase/firestore";
import {db, auth} from '@/firebase'


export interface ShortTodoContainer {
    id: number;
    shortContainername: string;
    shortTodos: ShortTodoJ[];
    completed: boolean;
    hidden?: boolean;
    createdAt: Date;
    Notes:string;
  }
//short Todo Jobs (mini task)
  export interface ShortTodoJ {
    id:number,
    shortTodoName: string,
    description?: string,
    completed:boolean,
    tag: string;
    status: string;
    priority: string;
    createdAt: Date;
    hidden?: boolean;
    parentNoteId?: string | null;
    isMilestone?: boolean;
  }

export const shortTodoContainerAtom = atom<ShortTodoContainer[]>([]);

export interface LongTodoContainer {
  id: number;
  LongContainerName:string;
  LongTodo:LongTodoJ[];
  completed:boolean;
}
//Long Todo Jobs (big task)

export interface BlockData {
  id: string;
  x: number;
  y: number;
  content: string;
  isMinimized: boolean;
  zIndex: number;
  color: string;
  hasBackground: boolean;
  hasBeenDragged: boolean;
  linkedNoteId?: string | null;
  nodeType?: "note" | "text" | "milestone";
}

export const COLORS = [
  "rgba(255, 255, 255, 0.05)", 
  "rgba(59, 130, 246, 0.15)",   
  "rgba(168, 85, 247, 0.15)",   
  "rgba(236, 72, 153, 0.15)",   
  "rgba(34, 197, 94, 0.15)",    
];

// ── Categories ──
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "random", name: "Random", color: "bg-zinc-500", icon: "Sparkles", isDefault: true },
  { id: "finance", name: "Finance", color: "bg-emerald-500", icon: "DollarSign", isDefault: true },
  { id: "health", name: "Health", color: "bg-rose-500", icon: "Heart", isDefault: true },
];

export const categoriesAtom = atom<Category[]>(DEFAULT_CATEGORIES);

// ── Research Notes & Plans of Action ──
export type NoteType = "research" | "plan_of_action";

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  type: NoteType;
  linkedMilestoneIds: number[];
  linkedNoteIds: string[];
  deadline?: Date | string | null;
  tag?: string;
  containerId?: number | null;
  shortContainerId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export const notesAtom = atom<ResearchNote[]>([]);

export interface LongTodoJ {
  id: number;
  LongTodoName: string;
  deadline: Date | string | null;
  tag: string;
  completed: boolean;
  milestone?: string | string[] | null;
  planText: string;
  createedAt: Date;
  blocks?: BlockData[];
}

export const LongTodoContainerAtom = atom<LongTodoContainer[]>([]);

//daily todo
export interface DailyTodo {
  id: number;
  DailyName: string;
  completed: boolean;
}

// Daily To-do Atom
export const dailyTodoContainerAtom = atom<DailyTodo[]>([]);

// ── Challenges ──
export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  durationDays: number;
  completedDates: string[]; // YYYY-MM-DD
  status: "active" | "completed" | "failed" | "abandoned";
  color?: string;
  icon?: string;
}

export const challengesAtom = atom<Challenge[]>([]);

// ── Habits ──
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly";
  completedDates: string[]; // YYYY-MM-DD
  color: string;
  icon: string;
  createdAt: Date;
}

export const habitsAtom = atom<Habit[]>([]);

// ── Plans ──
export type PlanTimeframe = "day" | "week" | "month" | "6_months" | "1_year" | "5_years";

export interface PlanItem {
  id: string;
  title: string;
  description?: string;
  timeframe: PlanTimeframe;
  completed: boolean;
  createdAt: Date;
}

export const plansAtom = atom<PlanItem[]>([]);

// ── Theme Atom (Unified and consistent) ──
export type ThemeMode = "dark" | "light";
export const themeAtom = atom<ThemeMode>(
  localStorage.getItem("theme") === "light" ? "light" : "dark"
);

const toJsDate = (value: unknown): Date => {
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
};

// ── Firebase fetch: called once after login ──
const store = getDefaultStore();

export const fetchAllFromFirebase = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  // Short containers
  const shortSnap = await getDocs(collection(db, `users/${userId}/shortTodoContainers`));
  const shortData: ShortTodoContainer[] = shortSnap.docs.map(doc => {
    const item = doc.data() as ShortTodoContainer;
    if (item.shortTodos) {
      item.shortTodos = item.shortTodos.map((t) => ({
        ...t,
        createdAt: toJsDate(t.createdAt)
      }));
    }
    return item;
  });
  store.set(shortTodoContainerAtom, shortData);

  // Long containers
  const longSnap = await getDocs(collection(db, `users/${userId}/longTodoContainers`));
  const longData: LongTodoContainer[] = longSnap.docs.map(doc => {
    const item = doc.data() as LongTodoContainer;
    if (item.LongTodo) {
      item.LongTodo = item.LongTodo.map((t) => ({
        ...t,
        deadline: t.deadline ? toJsDate(t.deadline) : null,
        createedAt: toJsDate(t.createedAt)
      }));
    }
    return item;
  });
  store.set(LongTodoContainerAtom, longData);

  // Daily todos
  const dailySnap = await getDocs(collection(db, `users/${userId}/dailyTodos`));
  const dailyData: DailyTodo[] = dailySnap.docs.map(doc => doc.data() as DailyTodo);
  store.set(dailyTodoContainerAtom, dailyData);

  // Challenges
  const challengesSnap = await getDocs(collection(db, `users/${userId}/challenges`));
  const challengesData: Challenge[] = challengesSnap.docs.map(doc => {
    const data = doc.data() as Challenge;
    data.startDate = toJsDate(data.startDate);
    return data;
  });
  store.set(challengesAtom, challengesData);

  // Habits
  const habitsSnap = await getDocs(collection(db, `users/${userId}/habits`));
  const habitsData: Habit[] = habitsSnap.docs.map(doc => {
    const data = doc.data() as Habit;
    data.createdAt = toJsDate(data.createdAt);
    return data;
  });
  store.set(habitsAtom, habitsData);

  // Plans
  const plansSnap = await getDocs(collection(db, `users/${userId}/plans`));
  const plansData: PlanItem[] = plansSnap.docs.map(doc => {
    const data = doc.data() as PlanItem;
    data.createdAt = toJsDate(data.createdAt);
    return data;
  });
  store.set(plansAtom, plansData);

  // Categories
  try {
    const categoriesSnap = await getDocs(collection(db, `users/${userId}/categories`));
    if (!categoriesSnap.empty) {
      const customCats = categoriesSnap.docs.map(doc => doc.data() as Category);
      const merged = [...DEFAULT_CATEGORIES];
      customCats.forEach(cat => {
        if (!merged.some(m => m.id === cat.id)) merged.push(cat);
      });
      store.set(categoriesAtom, merged);
    }
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }

  // Notes
  try {
    const notesSnap = await getDocs(collection(db, `users/${userId}/notes`));
    const notesData: ResearchNote[] = notesSnap.docs.map(doc => {
      const data = doc.data() as ResearchNote;
      return {
        ...data,
        deadline: data.deadline ? toJsDate(data.deadline) : null,
        createdAt: toJsDate(data.createdAt),
        updatedAt: toJsDate(data.updatedAt)
      };
    });
    store.set(notesAtom, notesData);
  } catch (err) {
    console.error("Failed to fetch notes:", err);
  }
};
