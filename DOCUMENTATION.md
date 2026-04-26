# Togo - Task Management Application Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [State Management](#state-management)
7. [Components Documentation](#components-documentation)
8. [Pages Documentation](#pages-documentation)
9. [Hooks](#hooks)
10. [Styling & Theming](#styling--theming)
11. [Getting Started](#getting-started)
12. [Development Guide](#development-guide)

---

## Project Overview

**Togo** is a comprehensive task management and productivity application built with React and TypeScript. The application helps users track their goals, tasks, and daily activities through a hierarchical system of fields, goals, tasks, and milestones.

### Core Philosophy
> "Whatever gets measured, gets improved" - The app is designed to help users improve their lives by tracking various aspects systematically.

### Key Capabilities
- **Field Management**: Create custom tracking fields (money, career, health, etc.)
- **Goal Setting**: Define goals within each field
- **Task Management**: Create tasks and milestones to achieve goals
- **Daily Tracking**: Monitor daily tasks with time-based reminders
- **Progress Visualization**: Track completion status and time remaining

---

## Architecture

### Application Flow
```
App.tsx (Router)
    ├── NavBar (Global Navigation)
    ├── HomePage (Dashboard)
    │   ├── HeaderHome
    │   ├── CurrentlyWorking
    │   ├── ChallengeTimer
    │   ├── ShortTodo (Multiple Containers)
    │   ├── LongTodo (Multiple Containers)
    │   └── TodayCard (Daily Tasks)
    ├── ShortList (Detailed Task View)
    └── Signup/Login (Authentication)
```

### Design Patterns
- **Component-Based Architecture**: Modular, reusable components
- **Atomic State Management**: Using Jotai for global state
- **Container/Presentational Pattern**: Separation of logic and UI
- **Custom Hooks**: Reusable logic extraction (e.g., `useLongPress`)

---

## Technology Stack

### Core Technologies
- **React 18.3.1**: UI library
- **TypeScript 5.6.2**: Type safety
- **Vite 5.4.9**: Build tool and dev server
- **React Router DOM 6.27.0**: Client-side routing

### State Management
- **Jotai 2.10.1**: Atomic state management

### UI & Styling
- **Tailwind CSS 3.4.14**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-popover`
  - `@radix-ui/react-slot`
- **Framer Motion 11.11.9**: Animation library
- **Lucide React 0.453.0**: Icon library
- **Vaul 1.1.0**: Drawer component

### Utilities
- **date-fns 2.30.0**: Date manipulation
- **date-fns-tz 2.0.1**: Timezone support
- **Sonner 1.5.0**: Toast notifications
- **class-variance-authority**: Component variants
- **clsx**: Conditional classNames
- **tailwind-merge**: Tailwind class merging

---

## Project Structure

```
togofront/
├── public/                      # Static assets
├── src/
│   ├── Page/                    # Page components
│   │   ├── Home/
│   │   │   ├── HomePage.tsx
│   │   │   └── components/
│   │   │       ├── CurrentlyWorking.tsx
│   │   │       ├── Habbits.tsx
│   │   │       └── HeaderHome.tsx
│   │   ├── ShortList/
│   │   │   ├── ShortList.tsx
│   │   │   └── AddTodoShort.tsx
│   │   └── Signups/
│   │       ├── Signup.tsx
│   │       └── Login.tsx
│   ├── components/              # Reusable components
│   │   ├── TodoRelated/
│   │   │   ├── shortTask/
│   │   │   │   ├── ShortTodo.tsx
│   │   │   │   ├── ShortTask.tsx
│   │   │   │   ├── ShortTaskHead.tsx
│   │   │   │   ├── ShortAction.tsx
│   │   │   │   ├── ShortFiler.tsx
│   │   │   │   └── ShortTodoAction.tsx
│   │   │   ├── LongTask/
│   │   │   │   ├── LongTodo.tsx
│   │   │   │   └── LongTaskUi.tsx
│   │   │   └── TaskUi.tsx
│   │   ├── ui/                  # Shadcn/UI components
│   │   ├── EyeCatching/
│   │   │   └── VButtons.tsx
│   │   ├── calendarcomp/
│   │   │   └── cal2.tsx
│   │   ├── NavBar.tsx
│   │   ├── TodayCard.tsx
│   │   ├── ChallengeTimer.tsx
│   │   ├── TagsLong.tsx
│   │   └── DatePicker.tsx
│   ├── hooks/                   # Custom React hooks
│   │   └── useLongpress.tsx
│   ├── helper/                  # Helper utilities
│   │   └── timeRelated/
│   │       └── HoursLeftInDay.tsx
│   ├── lib/                     # Library utilities
│   ├── assets/                  # Images, fonts, etc.
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   ├── state.ts                 # Global state definitions
│   ├── stateHelper.ts           # State helper atoms
│   └── index.css                # Global styles
├── components.json              # Shadcn/UI config
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite configuration
└── package.json                 # Dependencies
```

---

## Core Features

### 1. Short Todo System
**Purpose**: Quick, actionable tasks with metadata tracking

**Features**:
- Create todo containers (categories)
- Add tasks with properties:
  - Task name
  - Completion status
  - Tag
  - Status (Pending, In Progress, etc.)
  - Priority (High, Normal, Low)
  - Created date
- Navigate to detailed view
- Filter and search tasks

**Naming Convention**: Short Todo → TaskUi

### 2. Long Todo System
**Purpose**: Long-term goals and projects with milestones

**Features**:
- Create project containers
- Add long-term tasks with:
  - Task name
  - Deadline
  - Tags
  - Milestones
  - Plan text (description)
  - Completion tracking
- Calendar integration for deadlines
- Progress visualization

**Naming Convention**: Long Todo → LongTaskUi

### 3. Daily Todo System
**Purpose**: Daily habit tracking and time management

**Features**:
- Maximum 3 daily tasks
- Time-based reminders
- Hours remaining in day counter
- Completion celebration
- Daily reset mechanism
- Task input window (specific hour)

### 4. Theme System
**Features**:
- Dark/Light mode toggle
- Persistent theme preference (localStorage)
- CSS variable-based theming
- Smooth transitions

### 5. Navigation
**Features**:
- Floating navigation button (Radar icon)
- Side sheet navigation
- Quick access to:
  - Home
  - Timer app
  - All tasks view

---

## State Management

### Global State (Jotai Atoms)

#### 1. Short Todo Container Atom
```typescript
interface ShortTodoContainer {
  id: number;
  shortContainername: string;
  shortTodos: ShortTodoJ[];
  completed: boolean;
}

interface ShortTodoJ {
  id: number;
  shortTodoName: string;
  completed: boolean;
  tag: string;
  status: string;
  priority: string;
  createdAt: Date;
}

export const shortTodoContainerAtom = atom<ShortTodoContainer[]>([...])
```

#### 2. Long Todo Container Atom
```typescript
interface LongTodoContainer {
  id: number;
  LongContainerName: string;
  LongTodo: LongTodoJ[];
  completed: boolean;
}

interface LongTodoJ {
  id: number;
  LongTodoName: string;
  deadline: any;
  tag: string;
  completed: boolean;
  milestone: any;
  planText: string;
  createedAt: Date;
}

export const LongTodoContainerAtom = atom<LongTodoContainer[]>([...])
```

#### 3. Daily Todo Atom
```typescript
interface DailyTodo {
  id: number;
  DailyName: string;
  completed: boolean;
}

export const dailyTodoContainerAtom = atom<DailyTodo[]>([...])
```

#### 4. Time Helper Atom
```typescript
export const timeLeftInTodayAtom = atom(15);
```

### Local State Management
- Component-level state using `useState`
- Form state management
- UI state (modals, popovers, animations)

---

## Components Documentation

### Core Components

#### 1. **TaskUi** (`components/TodoRelated/TaskUi.tsx`)
**Purpose**: Reusable task item component with interaction support

**Props**:
- `isChecked: boolean` - Task completion status
- `task_name: string` - Task display name
- `isEditable: boolean` - Show/hide action buttons

**Features**:
- Checkbox for completion toggle
- Long-press detection for actions
- Action buttons (Edit, Hide, Delete)
- Toast notifications
- Smooth animations

**Interactions**:
- Click: Toggle completion
- Long-press: Show action menu

---

#### 2. **ShortTodo** (`components/TodoRelated/shortTask/ShortTodo.tsx`)
**Purpose**: Container component for short tasks

**Props**:
- `shortContainerName: string` - Container title
- `shortTaskArray: ShortTodoJ[]` - Array of tasks
- `id: number` - Container identifier

**Features**:
- Expandable input field
- Add new tasks
- Link to detailed view
- Scrollable task list
- Auto-sync with global state

**UI Behavior**:
- Input expands on focus (70px → 150px)
- Animated underline on focus
- Card-based layout (350px width)

---

#### 3. **LongTodo** (`components/TodoRelated/LongTask/LongTodo.tsx`)
**Purpose**: Container for long-term projects

**Props**:
- `LongContainerName: string` - Project name
- `id: number` - Container identifier

**Features**:
- Tag selection
- Deadline picker (calendar)
- Expandable header (70px → 170px)
- Task validation (requires tag)
- Milestone tracking

**UI Components**:
- Input field with animated underline
- Calendar popover for deadline
- Tag selector
- Add button

---

#### 4. **TodayCard** (`components/TodayCard.tsx`)
**Purpose**: Daily task management and time tracking

**Features**:
- Hours remaining counter
- Daily task list (max 3 tasks)
- Task completion tracking
- Celebration toast on completion
- Time-window for task input
- Daily reset mechanism

**State Logic**:
- Checks if all tasks completed
- Shows celebration once per day (localStorage)
- Special UI at specific hour (4 AM)
- Task input validation

**UI States**:
1. Normal: Show tasks and hours left
2. All Complete: Celebration message
3. Input Window (4 AM): Task input form

---

#### 5. **NavBar** (`components/NavBar.tsx`)
**Purpose**: Global navigation system

**Features**:
- Floating action button (bottom-right)
- Slide-out sheet (left side)
- Navigation links:
  - Home
  - Timer app
  - All tasks

**UI**:
- Radar icon trigger
- Animated sheet transition
- Icon-based navigation buttons

---

#### 6. **ChallengeTimer** (`components/ChallengeTimer.tsx`)
**Purpose**: Display challenge countdown

**Features**:
- Large timer display (21:20:31 format)
- Responsive text sizing
- Hover effects
- Motivational text

---

### Helper Components

#### 7. **HoursLeftInDay** (`helper/timeRelated/HoursLeftInDay.tsx`)
**Purpose**: Calculate and display hours remaining in current day

**Props**:
- `timeZone?: string` - Default: "Asia/Kolkata"

**Features**:
- Timezone-aware calculation
- Auto-updates every minute
- Syncs with global atom
- Cleanup on unmount

**Logic**:
```typescript
1. Get current time in specified timezone
2. Calculate end of day (23:59:59.999)
3. Compute difference in hours
4. Update every 60 seconds
```

---

### UI Components (Shadcn/UI)

Located in `components/ui/`, these are pre-built, accessible components:

- **Button**: Multiple variants (default, outline, ghost, etc.)
- **Card**: Container with header, content, footer
- **Input**: Form input with styling
- **Checkbox**: Accessible checkbox
- **Popover**: Floating content container
- **Sheet**: Slide-out panel
- **Dialog**: Modal dialog
- **Calendar**: Date picker
- **Badge**: Status indicators
- **Avatar**: User profile images
- **Drawer**: Bottom drawer (Vaul)
- **Select**: Dropdown selection
- **Separator**: Visual divider
- **Scroll Area**: Custom scrollbar container

---

## Pages Documentation

### 1. HomePage (`Page/Home/HomePage.tsx`)

**Purpose**: Main dashboard displaying all task containers

**Layout**:
```
┌─────────────────────────────────────┐
│         HeaderHome                  │
├─────────────────────────────────────┤
│  CurrentlyWorking | ChallengeTimer  │ (Collapsible)
├─────────────────────────────────────┤
│  [ShortTodo] [ShortTodo] [LongTodo] │
│  [ShortTodo] [LongTodo]  [LongTodo] │
└─────────────────────────────────────┘
                            [TodayCard] (Fixed bottom-right)
```

**Features**:
- Collapsible header section
- Grid layout for task containers
- State persistence (localStorage)
- Animated transitions (Framer Motion)
- Floating daily task card

**State**:
- `headerHeight`: Toggle header visibility
- Syncs with `shortTodoContainerAtom` and `LongTodoContainerAtom`

---

### 2. ShortList (`Page/ShortList/ShortList.tsx`)

**Purpose**: Detailed view for a specific short todo container

**URL**: `/shortList/:id`

**Layout**:
```
┌─────────────────────────────────────┐
│  [Back]           TITLE      [Add]  │
├─────────────────────────────────────┤
│  // description input               │
├──────────────────┬──────────────────┤
│   Task Table     │   Notes Area     │
│   (2/3 width)    │   (1/3 width)    │
│                  │                  │
│   - Task 1       │   Yellow sticky  │
│   - Task 2       │   note area      │
│   - Task 3       │                  │
└──────────────────┴──────────────────┘
```

**Features**:
- Large title display (9xl font)
- Task table with headers
- Scrollable task list
- Notes section (yellow textarea)
- Add task functionality
- Back navigation

**Components Used**:
- `ShortTaskHead`: Table headers
- `ShortTask`: Individual task rows
- `AddTodoShort`: Add task dialog

---

### 3. Signup (`Page/Signups/Signup.tsx`)

**Purpose**: User registration page

**Layout**: Two-column layout (desktop)
- Left: Background image
- Right: Registration form

**Form Fields**:
- Name
- Email
- Password
- Terms & conditions checkbox

**Features**:
- Google login option
- Form validation
- Responsive design
- Eye-catching button component
- Link to login page
- Forgot password link

---

### 4. Login (`Page/Signups/Login.tsx`)

**Purpose**: User authentication page (similar structure to Signup)

---

## Hooks

### useLongPress (`hooks/useLongpress.tsx`)

**Purpose**: Detect long-press gestures on elements

**Signature**:
```typescript
useLongPress<T extends HTMLElement = HTMLElement>(
  onLongPress: () => void,
  onClick?: () => void,
  delay = 500
): RefObject<T>
```

**Parameters**:
- `onLongPress`: Callback for long-press event
- `onClick`: Optional callback for normal click
- `delay`: Long-press duration (default: 500ms)

**Returns**: Ref object to attach to element

**Features**:
- Touch and mouse support
- Prevents click after long-press
- Auto-cleanup
- Configurable delay

**Usage Example**:
```typescript
const handleLongPress = () => console.log('Long pressed!');
const handleClick = () => console.log('Clicked!');
const ref = useLongPress<HTMLDivElement>(handleLongPress, handleClick);

return <div ref={ref}>Press me</div>;
```

**Event Listeners**:
- `mousedown` / `touchstart`: Start timer
- `mouseup` / `touchend`: Clear timer, trigger click
- `mouseleave` / `touchcancel`: Cancel timer

---

## Styling & Theming

### Tailwind Configuration

**Dark Mode**: Class-based (`darkMode: "class"`)

**Custom Colors** (CSS Variables):
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`

**Custom Animations**:
```javascript
keyframes: {
  "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
  "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
  "bg-shine": { from: { backgroundPosition: "0 0" }, to: { backgroundPosition: "-200% 0" } }
}
```

### Custom CSS Classes

#### Scrollbar Styling (`.scrollbar-custom`)
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { 
  background-color: #2e2e2e; 
  border-radius: 6px; 
}
::-webkit-scrollbar-thumb:hover { background-color: #555; }
```

#### Checkbox Animations
```css
@keyframes dothabottomcheck-19 { /* Bottom tick animation */ }
@keyframes dothatopcheck-19 { /* Top tick animation */ }
.animate-bottom-check { animation: dothabottomcheck-19 0.2s ease forwards; }
.animate-top-check { animation: dothatopcheck-19 0.4s ease forwards; }
```

### Theme Toggle Logic

Located in `App.tsx`:
```typescript
const [isDark, setIsDark] = useState(() => {
  return localStorage.getItem("theme") === "true";
});

useEffect(() => {
  const htmlElement = document.documentElement;
  if (isDark) {
    htmlElement.classList.remove("dark");
    localStorage.setItem("theme", "true");
  } else {
    htmlElement.classList.add("dark");
    localStorage.setItem("theme", "false");
  }
}, [isDark]);
```

**Note**: The logic appears inverted (isDark removes "dark" class). This might be intentional or a bug to review.

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd togofront
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open browser**:
Navigate to `http://localhost:5173` (default Vite port)

### Available Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc -b && vite build",  // Build for production
  "lint": "eslint .",               // Run linter
  "preview": "vite preview"         // Preview production build
}
```

---

## Development Guide

### Adding a New Short Todo Container

1. **Update state** (`state.ts`):
```typescript
const newContainer: ShortTodoContainer = {
  id: Date.now(),
  shortContainername: "New Container",
  shortTodos: [],
  completed: false
};
```

2. **Add to atom**:
```typescript
const [containers, setContainers] = useAtom(shortTodoContainerAtom);
setContainers([...containers, newContainer]);
```

3. **Component auto-renders** via HomePage mapping.

### Adding a New Task to Container

```typescript
const newTask: ShortTodoJ = {
  id: Date.now(),
  shortTodoName: "Task name",
  completed: false,
  tag: "Work",
  status: "Pending",
  priority: "High",
  createdAt: new Date()
};

const updatedContainers = containers.map(container => {
  if (container.id === targetId) {
    return {
      ...container,
      shortTodos: [...container.shortTodos, newTask]
    };
  }
  return container;
});

setContainers(updatedContainers);
```

### Creating a New UI Component

1. **Create component file**: `src/components/MyComponent.tsx`

2. **Use TypeScript**:
```typescript
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4">
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

3. **Import and use**:
```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent title="Hello" onAction={() => console.log('Clicked')} />
```

### Adding a New Route

1. **Update App.tsx**:
```typescript
<Routes>
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

2. **Create page component**: `src/Page/NewPage/NewPage.tsx`

3. **Add navigation link**:
```typescript
<Link to="/new-page">New Page</Link>
```

### Working with Jotai Atoms

**Read atom**:
```typescript
const [value] = useAtom(myAtom);
```

**Write atom**:
```typescript
const [, setValue] = useAtom(myAtom);
setValue(newValue);
```

**Read and write**:
```typescript
const [value, setValue] = useAtom(myAtom);
```

### Using Shadcn/UI Components

1. **Check `components.json`** for configuration

2. **Import component**:
```typescript
import { Button } from "@/components/ui/button";
```

3. **Use with variants**:
```typescript
<Button variant="outline" size="lg">Click me</Button>
```

### Adding Custom Animations

1. **Define in `tailwind.config.js`**:
```javascript
keyframes: {
  "my-animation": {
    from: { opacity: 0 },
    to: { opacity: 1 }
  }
},
animation: {
  "my-animation": "my-animation 1s ease-in-out"
}
```

2. **Use in component**:
```typescript
<div className="animate-my-animation">Content</div>
```

### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Task completed!");

// Error
toast.error("Something went wrong");

// Info
toast.info("Information message");

// Custom
toast("Custom message", {
  description: "Additional details",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo clicked")
  }
});
```

---

## Best Practices

### 1. **State Management**
- Use Jotai atoms for global state
- Use `useState` for component-local state
- Keep state as close to where it's used as possible
- Avoid prop drilling - use atoms for deeply nested data

### 2. **Component Design**
- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into custom hooks
- Use composition over inheritance

### 3. **Styling**
- Use Tailwind utility classes
- Leverage CSS variables for theming
- Use Framer Motion for complex animations
- Keep custom CSS minimal

### 4. **Performance**
- Use `React.memo` for expensive components
- Implement proper cleanup in `useEffect`
- Avoid unnecessary re-renders
- Use `useCallback` and `useMemo` when appropriate

### 5. **Code Organization**
- Group related components in folders
- Use index files for cleaner imports
- Keep business logic separate from UI
- Document complex logic with comments

---

## Future Enhancements

### Planned Features
1. **Backend Integration**
   - User authentication (currently UI-only)
   - Data persistence
   - Cloud sync

2. **Advanced Task Management**
   - Drag-and-drop task reordering
   - Task dependencies
   - Recurring tasks
   - Task templates

3. **Analytics & Insights**
   - Productivity charts
   - Completion statistics
   - Time tracking
   - Goal progress visualization

4. **Collaboration**
   - Shared projects
   - Team workspaces
   - Comments and mentions

5. **Mobile App**
   - React Native version
   - Offline support
   - Push notifications

### Known Issues
1. Theme toggle logic appears inverted (review needed)
2. CurrentlyWorking component has commented-out content
3. Some components have placeholder functionality
4. Missing error boundaries
5. No loading states for async operations

---

## Troubleshooting

### Common Issues

**Issue**: Dev server won't start
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`

**Issue**: TypeScript errors
- **Solution**: Run `npm run build` to see detailed errors

**Issue**: Styles not applying
- **Solution**: Check Tailwind config and ensure CSS is imported in `main.tsx`

**Issue**: State not persisting
- **Solution**: Implement localStorage sync for atoms (currently not implemented)

**Issue**: Routes not working
- **Solution**: Ensure `BrowserRouter` is wrapping the app in `App.tsx`

---

## Contributing

### Code Style
- Use TypeScript for all new files
- Follow existing naming conventions
- Use functional components with hooks
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests (if applicable)
3. Update documentation
4. Submit PR with clear description

---

## License

[Add license information here]

---

## Contact & Support

[Add contact information here]

---

## Appendix

### Keyboard Shortcuts
(To be implemented)

### API Documentation
(To be added when backend is implemented)

### Database Schema
(To be added when backend is implemented)

---

**Last Updated**: February 16, 2026
**Version**: 0.0.0
**Maintainer**: [Your Name]
