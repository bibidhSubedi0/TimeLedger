# Time Tracker - Project Structure

## 📁 Directory Tree

```
time-tracker/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
│
├── src/
│   ├── components/          # UI Components
│   │   ├── ActiveTimer.js   # Shows active task timer
│   │   ├── Header.js        # App header with status
│   │   ├── StatsGrid.js     # Statistics display
│   │   ├── TaskInput.js     # Task input form
│   │   └── TaskList.js      # List of completed tasks
│   │
│   ├── config/              # Configuration
│   │   └── supabase.js      # Supabase client setup
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useOnlineStatus.js  # Online/offline detection
│   │   ├── useTaskSync.js      # Supabase sync logic
│   │   └── useTimer.js         # Timer functionality
│   │
│   ├── styles/              # Styling (if using CSS-in-JS)
│   │   └── appStyles.js     # Style definitions
│   │
│   ├── utils/               # Utility Functions
│   │   ├── deviceUtils.js   # Device ID management
│   │   └── timeUtils.js     # Time formatting
│   │
│   ├── App.css              # App-specific styles
│   ├── App.js               # Main App component
│   ├── App.test.js          # App tests
│   ├── index.css            # Global styles
│   ├── index.js             # Entry point
│   ├── logo.svg             # Logo asset
│   ├── reportWebVitals.js   # Performance monitoring
│   └── setupTests.js        # Test configuration
│
├── .gitignore
├── package.json
├── README.md
├── REFACTORING_NOTES.md     # Refactoring documentation
├── PROJECT_STRUCTURE.md     # This file
└── UI_DESIGN_GUIDE.md       # UI/UX design guide

```

## 🔄 Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                        App.js                           │
│  (Main orchestrator - manages global state)             │
└─────────────────────────────────��───────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐     ┌──────────┐
   │ Config  │      │  Hooks   │     │  Utils   │
   └─────────┘      └──────────┘     └──────────┘
        │                 │                 │
        │                 │                 │
        ▼                 ▼                 ▼
   supabase.js    useOnlineStatus    timeUtils.js
                  useTimer           deviceUtils.js
                  useTaskSync
                        │
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   ┌──────────────────────────────────────��───┐
   │            Components                    │
   ├──────────────────────────────────────────┤
   │  Header                                  │
   │  ActiveTimer                             │
   │  TaskInput                               │
   │  StatsGrid                               │
   │  TaskList                                │
   └──────────────────────────────────────────┘
```

## 📊 Data Flow

```
┌──────────────┐
│   User       │
│   Action     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  TaskInput       │ ──────┐
│  Component       │       │
└──────────────────┘       │
                           │ onStart/onStop
                           │
                           ▼
                    ┌──────────────┐
                    │   App.js     │
                    │   (State)    │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ localStorage │   │  useTimer    │   │ useTaskSync  │
│              │   │  Hook        │   │  Hook        │
└──────────────┘   └──────────────┘   └──────┬───────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  Supabase    │
                                       │  Database    │
                                       └──────────────┘
```

## 🎯 Module Responsibilities

### **App.js** (Main Component)
- Manages global state (tasks, activeTask)
- Coordinates between hooks and components
- Handles task lifecycle (start/stop)
- Manages localStorage persistence

### **Components** (UI Layer)
| Component | Purpose |
|-----------|---------|
| `Header` | Display app title, online status, sync indicator |
| `ActiveTimer` | Show currently running task and elapsed time |
| `TaskInput` | Input field and start/stop buttons |
| `StatsGrid` | Display total time and task count |
| `TaskList` | Render list of completed tasks |

### **Hooks** (Logic Layer)
| Hook | Purpose |
|------|---------|
| `useOnlineStatus` | Monitor network connectivity |
| `useTimer` | Handle timer logic and elapsed time |
| `useTaskSync` | Sync data with Supabase |

### **Utils** (Helper Functions)
| Utility | Purpose |
|---------|---------|
| `timeUtils` | Format seconds to HH:MM:SS |
| `deviceUtils` | Generate and retrieve device ID |

### **Config** (Configuration)
| File | Purpose |
|------|---------|
| `supabase.js` | Initialize Supabase client |

## 🔧 Key Features by Module

### Task Management
- **Start Task**: `App.js` → `TaskInput` → `useTimer`
- **Stop Task**: `App.js` → `TaskInput` → `useTaskSync`
- **Display Tasks**: `App.js` → `TaskList`

### Data Persistence
- **Local**: `App.js` → `localStorage`
- **Cloud**: `useTaskSync` → `Supabase`

### Status Monitoring
- **Online/Offline**: `useOnlineStatus` → `Header`
- **Sync Status**: `useTaskSync` → `Header`

### Time Tracking
- **Active Timer**: `useTimer` → `ActiveTimer`
- **Task Duration**: `timeUtils` → `TaskList`, `StatsGrid`

## 📝 File Size Comparison

| File | Lines | Purpose |
|------|-------|---------|
| **Before Refactoring** |
| `App.js` | ~350 | Everything in one file |
| **After Refactoring** |
| `App.js` | ~120 | Main orchestrator |
| `Header.js` | ~25 | Header component |
| `ActiveTimer.js` | ~15 | Timer display |
| `TaskInput.js` | ~45 | Input component |
| `StatsGrid.js` | ~20 | Stats display |
| `TaskList.js` | ~35 | Task list |
| `useOnlineStatus.js` | ~20 | Online hook |
| `useTimer.js` | ~30 | Timer hook |
| `useTaskSync.js` | ~90 | Sync hook |
| `timeUtils.js` | ~7 | Time formatter |
| `deviceUtils.js` | ~10 | Device ID |
| `supabase.js` | ~8 | Config |

**Total**: ~425 lines (organized) vs ~350 lines (monolithic)
*Note: Slightly more lines due to imports/exports, but much better organized*

## 🚀 Benefits

1. **Modularity**: Each file has a single, clear purpose
2. **Reusability**: Components and hooks can be reused
3. **Testability**: Easy to test individual modules
4. **Maintainability**: Changes are isolated to specific files
5. **Scalability**: Easy to add new features
6. **Collaboration**: Multiple developers can work on different modules

## 📚 Related Documentation

- `REFACTORING_NOTES.md` - Detailed refactoring documentation
- `UI_DESIGN_GUIDE.md` - UI/UX design system
- `README.md` - Project setup and usage

---

*Last Updated: 2024*
