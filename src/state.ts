// import { id } from "date-fns/locale";

import { atom } from "jotai";


export interface ShortTodoContainer {
    id: number;
    shortContainername: string;
    shortTodos: ShortTodoJ[];
    completed: boolean;
  }

  export interface ShortTodoJ {
    id:number,
    shortTodoName: string,
    completed:boolean,
    tag: string;
    status: string;
    priority: string;
    createdAt: Date;
  }

export const shortTodoContainerAtom = atom<ShortTodoContainer[]>([
    {
        id: 1,
        shortContainername: 'Example ShortTodo Container',
        shortTodos: [
          {
            id:11,
            shortTodoName: 'Example Task',
            completed: false,
            tag: 'Work',
            status: 'In Progress',
            priority: 'High',
            createdAt: new Date(),
          },
        ],
        completed: false,
      },
])

export interface LongTodoContainer {
  id: number;
  LongContainerName:string;
  LongTodo:LongTodoJ[];
  completed:boolean;

  
}

export interface LongTodoJ{
  id: number;
  LongTodoName:string;
  deadline:any;
  tag:string;
  completed: boolean;
  milestone: any;
  planText:string;
  createedAt:Date;
  
}
export const LongTodoContainerAtom = atom<LongTodoContainer[]>([
  {
    id: 1,
    LongContainerName: "Project Alpha",
    LongTodo: [
      {
        id: 1,
        LongTodoName: "Initial Research",
        deadline: new Date("2024-12-01"),
        tag: "Research",
        completed: false,
        milestone: "Research Phase 1",
        planText: "Complete background research and gather relevant sources.",
        createedAt: new Date("2024-10-01")
      },
      {
        id: 2,
        LongTodoName: "Planning Stage",
        deadline: new Date("2024-12-30"),
        tag: "Planning",
        completed: false,
        milestone: "Planning Phase",
        planText: "Outline project plan and key deliverables.",
        createedAt: new Date("2024-11-01")
      }
    ],
    completed: false
  },
])





//daily todo

export interface DailyTodo {
  id: number;
  DailyName: string;
  completed: boolean;
  
}

// Daily To-do Atom
export const dailyTodoContainerAtom = atom<DailyTodo[]>([
  {
    id: 1,
    DailyName: "Morning Exercise",
    completed: false,
  },
  {
    id: 2,
    DailyName: "Check Emails",
    completed: true,
  },
  {
    id: 3,
    DailyName: "Team Meeting",
    completed: false,
  },
],);