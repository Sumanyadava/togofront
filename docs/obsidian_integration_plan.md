# Architecture & Implementation Plan: Obsidian-Inspired Productivity Ecosystem for Togo (Finalized & Aligned)

## 1. Executive Summary & Design Alignment

Following our `/grill-me` alignment interview, we have resolved every architectural branch down to the implementation details:

| Design Dimension | Aligned Decision |
| :--- | :--- |
| **Data Relationship** | **Dual Representation**: Research Notes live in their own dedicated store (`notesAtom` & Firestore `users/{userId}/notes`). When graduated to a Plan of Action, they can be filed into a `LongTodoContainer` via the "Organize Later" drawer. |
| **Note Linking (Wikilinks)** | **Hybrid `[[` & Pill Selector**: Inline `[[` triggers an Obsidian-style autocomplete popover to link any existing note, and linked notes are also visible and manageable as removable chips in a dedicated "Linked Notes" section. |
| **Milestone Engine & Sync** | **Automated Home Page Container**: Adding milestones to a note creates/syncs an automated Short Todo Container titled `🎯 [Note Title]` on the Togo Home Page. Checking tasks off on the Home Page or inside the note keeps both in 100% real-time sync with clickable backlinks. |
| **Canvas Node Linking** | **Rich Interactive Card**: In `MindBlock.tsx`, "New Node" allows linking an existing Research Note. The node renders an interactive card with category color badge, title, excerpt, mini milestone progress bar, a 1-click **Quick Peek Drawer** (zero lost canvas focus), and an "Open Full Note" button. |
| **Obsidian Graph View (`/graph`)** | **2D Force Physics Simulation**: Powered by `react-force-graph-2d`. Single-click opens a sliding Quick Peek drawer (read/edit, toggle milestones, see connections) with an "Open Full" button; double-click directly navigates to `/startwriting/:id`. Includes category hubs, search highlighting, and category/milestone toggles. |
| **Dynamic Categories** | **Preset & Custom Categories**: Default hubs (`Random`, `Finance`, `Health`) plus an inline `+ New Category` pill that opens a modal with a curated color palette (Emerald, Violet, Cyan, Rose, Amber, etc.) and icon selection. New categories immediately act as cluster hubs in the Graph View. |
| **Capture & Editing** | **Dynamic Workspace (`/startwriting` & `/startwriting/:id`)**: Loads immediately for friction-free writing with auto-draft persistence (`localStorage` + debounced Firestore save). Includes a top Note Switcher to search and switch between existing notes. |

---

## 2. System Architecture & Data Schema

```mermaid
graph TD
    subgraph Capture & Ideation [/startwriting]
        SW["Dynamic Workspace"]
        RN["Research Note (Title + Content + Category)"]
        WL["Wikilinks [[Note]] Autocomplete"]
    end

    subgraph Milestone Engine
        M["Short Todo Milestones"]
        PA["Graduates to: Plan of Action"]
        STC["Automated Home Page Container: 🎯 [Note Title]"]
    end

    subgraph Organization & Long Tasks
        OL["Organize Later Drawer"]
        LTC["Long Todo Container"]
        MB["Spatial Canvas (MindBlock)"]
        LN["Rich Linked Note Card (Peek + Full)"]
    end

    subgraph Knowledge Graph [/graph]
        GV["Obsidian Graph View (Force-Directed 2D)"]
        PK["Slide-over Quick Peek Drawer"]
    end

    SW --> RN
    RN --> WL
    RN -- Add Milestone --> M
    M --> PA
    M <--> STC
    PA --> OL
    OL --> LTC
    LTC --> MB
    MB -- Link Note --> LN
    LN -. Quick Peek .-> RN
    RN --> GV
    PA --> GV
    M --> GV
    GV -- Single Click --> PK
    GV -- Double Click --> SW
```

### TypeScript Data Models (`src/state/state.ts`):

```typescript
export type NoteType = "research" | "plan_of_action";

export interface Category {
  id: string;
  name: string;
  color: string;      // Tailwind color class or hex (e.g., "bg-emerald-500")
  icon?: string;       // Lucide icon name (e.g., "DollarSign", "Heart", "Sparkles")
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "random", name: "Random", color: "bg-zinc-500", icon: "Sparkles", isDefault: true },
  { id: "finance", name: "Finance", color: "bg-emerald-500", icon: "DollarSign", isDefault: true },
  { id: "health", name: "Health", color: "bg-rose-500", icon: "Heart", isDefault: true },
];

export interface ResearchNote {
  id: string;
  title: string;
  content: string;             // Rich text HTML or markdown
  categoryId: string;          // "random", "finance", "health", or custom
  type: NoteType;              // "research" or "plan_of_action"
  linkedMilestoneIds: number[];// ShortTodo IDs
  linkedNoteIds: string[];     // Bi-directional referenced ResearchNote IDs
  deadline?: Date | string | null;
  tag?: string;                // "impUrg", "nonImpUrg", etc.
  containerId?: number | null; // LongTodoContainer assignment
  shortContainerId?: number | null; // Associated Home Page ShortTodoContainer ID
  createdAt: Date;
  updatedAt: Date;
}

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
  linkedNoteId?: string | null;  // Link to ResearchNote
  nodeType?: "note" | "text" | "milestone";
}

export interface ShortTodoJ {
  id: number;
  task: string;
  completed: boolean;
  parentNoteId?: string | null; // Associated ResearchNote ID
  isMilestone?: boolean;
}
```

---

## 3. Detailed Component & Route Implementation

### 1. Dynamic Workspace (`src/pages/start-writing-page/StartWritingPage.tsx`)
- **Route**: `/startwriting` (new blank capture) and `/startwriting/:id` (load note).
- **Long Task-Inspired Full-Width Workspace (Distraction-Free)**:
  - **Header Bar**:
    - Back link (`<ArrowLeft /> Home`) & Note switcher dropdown (`Untitled Note`).
    - **Small Milestone Button**:
      - If in Research mode: Clicking it asks *"Do you want to convert this into a plan of action?"*.
      - Upon conversion: Graduates the note to `Plan of Action 🎯` and opens a lightweight popover to manage milestone tasks without taking any permanent screen space.
      - Displays active task count badge e.g. `Milestone (2/5)`.
    - Knowledge Graph shortcut (`Share2`).
    - Note Settings gear button (`Settings`) for category picking, deadline, container filing, and priority tag quadrant.
    - **Manual Save Button**: Saves strictly on demand when clicked (auto-save to Firestore removed to prevent constant saving state).
  - **Hero Title**:
    - Styled exactly like Long Task (`text-4xl md:text-6xl font-bold`).
    - Subtle status pill: `Research Note 🧪` or `Plan of Action 🎯`.
  - **Full-Width Canvas**:
    - Bordered card with subtle radial gradient dot texture, filling 100% of the screen width and height.
    - Obsidian `[[` autocomplete popover triggers cleanly when typing `[[`.

### 2. MindBlock Canvas Node Linking (`src/pages/long-list-page/MindBlock.tsx` & `LongTaskDetail.tsx`)
- On the Spatial Planning Canvas:
  - Add Node dropdown offers: "Standard Sticky Note" or "Link Research Note".
  - Selecting "Link Research Note" opens a search popover of all user notes.
  - Node card renders:
    - Note icon & title with category color glow.
    - Content excerpt snippet.
    - Mini progress bar if it has milestones.
    - **Peek Button**: Opens a sliding side drawer to read/edit the note directly without losing canvas position.
    - **Open Full Button**: Direct navigation to `/startwriting/:id`.

### 3. Obsidian Graph View (`src/pages/graph-page/GraphPage.tsx`)
- **Route**: `/graph`.
- **Force Graph Engine**: `react-force-graph-2d`.
- **Visual Taxonomy**:
  - 🔵 **Categories** (Central cluster hubs: Random, Finance, Health, and custom categories)
  - 🟣 **Research Notes** (Purple glow, node size scales with number of links)
  - 🟢 **Plans of Action** (Emerald glow with milestone progress border ring)
  - 🟡 **Milestones** (Amber nodes linked to parent action notes)
- **Interactions**:
  - **Single Click**: Opens the sliding **Quick Peek Drawer** on the right (read/edit note, check milestones, see connected notes, or click "Open Full Note").
  - **Double Click**: Navigates directly to `/startwriting/:id`.
  - **Search & Filter HUD**:
    - Search input to locate and highlight notes, auto-zooming camera to match.
    - Filter pills: Toggle categories on/off, toggle milestone nodes visibility.
    - "Reset Camera" & "Pause Physics" buttons.

### 4. Custom Category Creation Modal
- Triggered by `+` pill in `/startwriting`.
- Inputs:
  - Category Name.
  - Color palette selector: Emerald, Violet, Cyan, Rose, Amber, Indigo, Fuchsia, Sky.
  - Icon selection: Lucide icons (Heart, DollarSign, Sparkles, Book, Dumbbell, Code, Brain, Target).
- Saves to `categoriesAtom` and Firestore collection `users/{userId}/categories`.

### 5. Navigation & Header Integration
- **NavBar (`src/components/NavBar.tsx`)**:
  - Add **Write** (`/startwriting`) with `PenTool` icon.
  - Add **Graph** (`/graph`) with `Share2` / `Network` icon.
- **HeaderHome (`src/pages/home-page/components/HeaderHome.tsx`)**:
  - Add "Quick Write" shortcut button next to the search bar.

---

## 4. Step-by-Step Implementation Roadmap

1. **Step 1: State & Types Verification** (`src/state/state.ts`):
   - Ensure `notesAtom`, `categoriesAtom`, and enhanced `BlockData` / `ShortTodoJ` are fully supported with Firebase sync helpers.
2. **Step 2: StartWritingPage Component** (`src/pages/start-writing-page/StartWritingPage.tsx`):
   - Rich text editor with `[[` wikilink autocomplete and top linked notes pill bar.
   - Dynamic status badge (`Research 🧪` ➔ `Plan of Action 🎯`).
   - Category bar with "+ New Category" modal.
   - Hybrid milestone panel with live progress bar and automated Home Page `ShortTodoContainer` sync.
   - Auto-draft save to `localStorage` and Firestore debounced save.
3. **Step 3: Organize Later Drawer**:
   - Slide-over drawer to file notes into Long Todo Containers, choose priority tag, and set deadline.
4. **Step 4: MindBlock Canvas Upgrade** (`src/pages/long-list-page/MindBlock.tsx` & `LongTaskDetail.tsx`):
   - Add "Link Research Note" to canvas node creation.
   - Render rich card with category glow, excerpt, Quick Peek drawer, and "Open Full" button.
5. **Step 5: Obsidian Graph View** (`src/pages/graph-page/GraphPage.tsx`):
   - Full 2D force simulation with category hubs, notes, milestones, search filter, single-click Quick Peek drawer, and double-click full navigation.
6. **Step 6: Routes & Navigation Integration**:
   - Register routes `/startwriting`, `/startwriting/:id`, and `/graph` in `src/App.tsx`.
   - Add links to `NavBar.tsx` and "Quick Write" shortcut to `HeaderHome.tsx`.
7. **Step 7: Verification**:
   - Run `npm run build` (`tsc -b && vite build`) and `npm run lint` to guarantee 0 errors.
   - Test writing, note switching, wikilinking, milestone creation, Home Page sync, canvas linking, and graph exploration.
