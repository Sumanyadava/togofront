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
  }

export const shortTodoContainerAtom = atom<ShortTodoContainer[]>([]);

export interface LongTodoContainer {
  id: number;
  LongContainerName:string;
  LongTodo:LongTodoJ[];
  completed:boolean;

  
}
//Long Todo Jobs (big task)

export interface LongTodoJ{
  id: number;
  LongTodoName:string;
  deadline:any;
  tag:string;
  completed: boolean;
  milestone: any;
  planText:string;
  createedAt:Date;
  blocks?: any[];
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
      item.shortTodos = item.shortTodos.map((t: any) => ({
        ...t,
        createdAt: t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ?? new Date()
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
      item.LongTodo = item.LongTodo.map((t: any) => ({
        ...t,
        deadline: t.deadline?.toDate ? t.deadline.toDate() : t.deadline,
        createedAt: t.createedAt?.toDate ? t.createedAt.toDate() : t.createedAt ?? new Date()
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
    if ((data as any).startDate?.toDate) {
      data.startDate = (data as any).startDate.toDate();
    } else if (typeof data.startDate === 'string') {
      data.startDate = new Date(data.startDate);
    }
    return data;
  });
  store.set(challengesAtom, challengesData);

  // Habits
  const habitsSnap = await getDocs(collection(db, `users/${userId}/habits`));
  const habitsData: Habit[] = habitsSnap.docs.map(doc => {
    const data = doc.data() as Habit;
    if ((data as any).createdAt?.toDate) {
      data.createdAt = (data as any).createdAt.toDate();
    } else if (typeof data.createdAt === 'string') {
      data.createdAt = new Date(data.createdAt);
    }
    return data;
  });
  store.set(habitsAtom, habitsData);

  // Plans
  const plansSnap = await getDocs(collection(db, `users/${userId}/plans`));
  const plansData: PlanItem[] = plansSnap.docs.map(doc => {
    const data = doc.data() as PlanItem;
    if ((data as any).createdAt?.toDate) {
      data.createdAt = (data as any).createdAt.toDate();
    } else if (typeof data.createdAt === 'string') {
      data.createdAt = new Date(data.createdAt);
    }
    return data;
  });
  store.set(plansAtom, plansData);
};
