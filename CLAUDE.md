# GitHub Streak Counter - Claude Configuration

## Project Overview
**GitHub Streak Counter** is a Next.js (App Router) application that calculates and displays a user's GitHub contribution streak stats, specifically including private repository contributions. It features a "Single User" mode and a "Compare" mode.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Data Fetching:** GitHub GraphQL API

## TypeScript Conventions
- **Strict Mode:** All TypeScript configurations use strict mode (`strict: true` in tsconfig.json)
- **Type Safety:** Prefer explicit types over implicit any. Use TypeScript's built-in types where possible
- **Component Props:** Always type component props with interfaces or types
- **API Routes:** All API route handlers are typed with proper Request/Response types
- **State Management:** Prefer typed state with React hooks

## Code Quality Standards
- **No `any` type:** Avoid using `any` unless absolutely necessary for interoperability
- **Explicit Return Types:** Use explicit return types for functions, especially in components and API routes
- **Interface over Type:** Prefer `interface` for object shapes; use `type` for unions and primitives
- **Non-null Assertions:** Use sparingly; prefer proper type guards

## Component Architecture
- **File Structure:** Reusable components are located in `app/components/`
- **Icons:** Use `lucide-react` for all iconography
- **Client Components:** Add `"use client";` at the top of files that rely on React hooks (`useState`, `useEffect`)
- **Server Components:** Prioritize using Server Components where possible, unless interactivity or client APIs are required

## Recent Fixes & Implementation Details

### 1. Hydration Error in `app/page.tsx`
**Issue:**
There was a hydration mismatch on `app/page.tsx`. Next.js rendered the default HTML state on the server, but the client side was attempting to synchronously read `window.location.search` and `window.localStorage` in `useState` initialization to set values like `mode`, `username`, and `theme`.

**Solution:**
- State is initialized strictly to default values (e.g., `mode = "single"`, `theme = "default"`)
- A new boolean state `isInitialized` (defaulting to `false`) was introduced
- A `useEffect` hook runs on mount to read the actual URL query parameters and local storage values, applies them to the state, and then sets `isInitialized` to `true`
- Other `useEffect` hooks are guarded with `if (!isInitialized) return;` to prevent overwriting URL with defaults or fetching prematurely

## API Endpoints
- `/api/streak`: Calculates a single user's streak (typed handler with async/await)
- `/api/streak-compare`: Compares two users' streaks

## Project Conventions (Continued)
- **Error Handling:** Use proper error boundaries; see `app/components/ErrorBoundary.tsx`
- **Git Commits:** Prefix with conventional commits (feat:, fix:, refactor:, etc.)
- **Code Review:** Check for type safety and hydration issues before committing

## References
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/)

*(Keep this document updated as new core functionality, architectural changes, or significant bug fixes are added.)*