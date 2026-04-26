# Togo - Task Management & Productivity App

> "Whatever gets measured, gets improved" - Track, manage, and improve your life systematically.

## 🎯 Overview

**Togo** is a modern, feature-rich task management application built with React and TypeScript. It helps you organize your life through a hierarchical system of fields, goals, tasks, and milestones - making productivity tracking intuitive and effective.

## ✨ Key Features

### 📋 Short Tasks (TaskUi)
Quick, actionable tasks with rich metadata:
- ✅ Task completion tracking
- 🏷️ Tags and categories
- 📊 Status tracking (Pending, In Progress, Complete)
- ⚡ Priority levels (High, Normal, Low)
- 📅 Creation timestamps

### 🎯 Long-Term Projects
Manage complex goals with:
- 📆 Deadline tracking with calendar integration
- 🎖️ Milestone management
- 📝 Detailed planning notes
- 🏷️ Tag-based organization
- 📈 Progress visualization

### 📅 Daily Habits
Stay on track every day:
- ⏰ Time-based reminders
- ⏳ Hours remaining in day counter
- 🎉 Completion celebrations
- 🔄 Daily reset mechanism
- 📌 Maximum 3 focused tasks per day

### 🎨 Modern UI/UX
- 🌓 Dark/Light theme support
- ✨ Smooth animations (Framer Motion)
- 📱 Responsive design
- ♿ Accessible components (Radix UI)
- 🎯 Intuitive navigation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd togofront

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

## 🛠️ Tech Stack

### Core
- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Lightning-fast build tool
- **React Router 6.27** - Client-side routing

### State & Data
- **Jotai 2.10** - Atomic state management
- **date-fns** - Date manipulation & timezone support

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion 11.11** - Fluid animations
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── Page/                    # Page components
│   ├── Home/               # Dashboard
│   ├── ShortList/          # Detailed task view
│   └── Signups/            # Authentication
├── components/             # Reusable components
│   ├── TodoRelated/        # Task components
│   │   ├── shortTask/      # Short task system
│   │   └── LongTask/       # Long-term projects
│   └── ui/                 # Shadcn/UI components
├── hooks/                  # Custom React hooks
├── helper/                 # Utility functions
├── state.ts                # Global state (Jotai atoms)
└── App.tsx                 # Main application
```

## 📖 Documentation

For comprehensive documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

Topics covered:
- 🏗️ Architecture & Design Patterns
- 🧩 Component API Reference
- 🔄 State Management Guide
- 🎨 Styling & Theming
- 🛠️ Development Guide
- 📚 Best Practices

## 🎯 Core Concepts

### Fields
Create custom tracking fields for different life areas:
- 💰 Money/Finance
- 💼 Career
- 🏋️ Health & Fitness
- 📚 Learning
- And more...

### Goals
Define specific goals within each field to work towards.

### Tasks & Milestones
Break down goals into actionable tasks and track progress through milestones.

## 🧪 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## 🎨 Naming Conventions

- **Short Todo** → `TaskUi` component
- **Long Todo** → `LongTaskUi` component
- Component files use PascalCase
- Utility files use camelCase

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

- Theme toggle logic may need review
- Backend integration pending
- Some components have placeholder functionality

See [DOCUMENTATION.md](./DOCUMENTATION.md#known-issues) for full list.

## 🗺️ Roadmap

- [ ] Backend integration & authentication
- [ ] Data persistence & cloud sync
- [ ] Drag-and-drop task reordering
- [ ] Analytics & productivity insights
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Recurring tasks
- [ ] Task templates

## 📄 License

[Add license information]

## 📞 Contact

[Add contact information]

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

*Last Updated: February 16, 2026*
