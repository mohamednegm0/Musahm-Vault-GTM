# Recommended Project Structure for Musahm Vault

Based on the current growth of the project (50+ pages and 40+ components), a **Feature-Based Architecture** is the most scalable approach. It groups related functionality together, making the codebase easier to navigate and maintain.

## 🏗️ High-Level Overview (Monorepo)

```text
Musahm-Vault/
├── Backend/                 # C# .NET API
├── Frontend/                # Frontend Root
│   ├── apps/                # Platform-specific applications
│   │   ├── web/             # Main React Application
│   │   └── mobile/          # Future React Native App
│   └── packages/            # Shared business logic & UI kits
│       ├── ui-kit/          # Shared Design System
│       ├── core/            # Shared types, api clients, utils
│       └── hooks/           # Shared React hooks
```

## 🌐 Web Application Structure (`apps/web/src`)

The current flat structure in `src/pages` and `src/components` should be modularized into **features**.

```text
src/
├── api/                     # Base API clients (Axios config, interceptors)
├── assets/                  # Static assets (images, fonts, global icons)
├── components/              # Global UI primitives (Button, Input, Modal, Table)
├── config/                  # App constants, environment settings
├── contexts/                # Global state (Auth, Language, Toast, Theme)
├── hooks/                   # Generic hooks (useLocalStorage, useOnClickOutside)
├── layouts/                 # Page scaffolding (DashboardLayout, AuthLayout)
│   ├── DashboardLayout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── DashboardLayout.tsx
│   └── AuthLayout/
├── features/                # Core business modules (The "Heart" of the app)
│   ├── auth/                # Login, Registration, Password Reset
│   │   ├── api/             # Auth-specific API calls
│   │   ├── components/      # Auth-only components (LoginForm)
│   │   ├── slices/          # State management (Redux/Zustand if used)
│   │   └── ...
│   ├── documents/           # Upload, Preview, Versions, Details
│   ├── workspaces/          # Explorer, Settings, Members
│   ├── workflows/           # Editor, Instances, Triggers
│   ├── ai-chat/             # AIChat component and logic
│   └── search/              # Search results and filters
├── pages/                   # Thin route wrapper components
│   ├── HomePage.tsx         # Imports from features/workspaces
│   ├── DocumentPage.tsx     # Imports from features/documents
│   └── ...
├── services/                # Third-party integrations
├── styles/                  # Global CSS variables, reset, themes
├── types/                   # Global TypeScript interfaces
└── utils/                   # Shared helpers (date formatting, etc.)
```

## 🚀 Key Benefits

1.  **Isolation**: Changes to "Workflows" won't accidentally break "Auth".
2.  **Discoverability**: Everything related to a feature is in one folder. No more jumping between `src/api`, `src/pages`, and `src/components` to fix one bug.
3.  **Encapsulation**: Components that are only used in one feature (e.g., `WorkflowStepBuilder`) stay inside that feature's folder, keeping the global `src/components` clean.
4.  **Team Scaling**: Different developers can work on different features with minimal merge conflicts.

## 🛠️ Implementation Plan (Phased)

1.  **Phase 1: Layouts Extraction**: Move `Sidebar.tsx`, `Header.tsx`, and `Breadcrumb.tsx` into a `layouts/` directory.
2.  **Phase 2: Features Directory**: Create `features/` and start moving logic from `pages/` into feature modules.
3.  **Phase 3: Package Refactoring**: Move generic utilities and types from `apps/web` into `packages/core`.
