# Musahm Vault Monorepo

A monorepo prototype for Musahm Vault featuring a shared core library with web (React + Vite) and mobile (React Native + Expo) applications.

## Structure

```
Frontend/
├── apps/
│   ├── web/          # React + Vite web application
│   └── mobile/       # React Native + Expo mobile application
├── packages/
│   ├── core/         # Shared core logic (HELLO_WORLD string)
│   ├── hooks/        # Shared React hooks
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utility functions
├── package.json      # Root workspace configuration
└── tsconfig.json     # Root TypeScript configuration
```

## Setup

### Prerequisites

- Node.js 16+ and npm 8+
- For iOS development: Xcode and CocoaPods
- For Android development: Android Studio

### Installation

Install all dependencies across the monorepo:

```bash
npm install
```

## Development

### Web App

Run the web application:

```bash
npm run dev:web
```

This starts the Vite dev server on `http://localhost:5173`

### Mobile App

Run the mobile application with Expo:

```bash
npm run dev:mobile
```

This starts the Expo dev server. Choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web

## Building

Build all packages and applications:

```bash
npm run build
```

## Architecture

The monorepo follows clean architecture principles:

- **apps/web** and **apps/mobile** are independent applications
- Both apps import shared code from **packages/*** only
- No cross-imports between apps
- Shared functionality is centralized in packages

### Shared Packages

#### @musahm/core
Exports the `HELLO_WORLD` constant and core utilities used by both web and mobile apps.

```typescript
import { HELLO_WORLD } from '@musahm/core'
```

#### @musahm/types
Shared TypeScript interfaces and types.

#### @musahm/hooks
Shared React hooks (for web and compatible mobile components).

#### @musahm/utils
General utility functions.

## Scripts

- `npm run dev:web` - Start web development server
- `npm run dev:mobile` - Start mobile development server
- `npm run build` - Build all packages and apps
- `npm run lint` - Lint all packages (if configured)
- `npm run type-check` - Type check all packages

## Workspace Management

This is a monorepo using npm workspaces. Dependencies between workspaces are specified using the `workspace:*` protocol in package.json files, which ensures consistent versions and local development.

## License

MIT
