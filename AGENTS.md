# GitHub Streak Counter - Agent Documentation

This file contains important context about the project, architecture, and recent fixes to help Claude and other AI agents understand the codebase.

## Project Overview
**GitHub Streak Counter** is a Next.js (App Router) application that calculates and displays a user's GitHub contribution streak stats, specifically including private repository contributions. It features a "Single User" mode and a "Compare" mode.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Data Fetching:** GitHub GraphQL API

## Recent Fixes & Implementation Details

### 1. Hydration Error in `app/page.tsx`
**Issue:**
There was a hydration mismatch on `app/page.tsx`. Next.js rendered the default HTML state on the server, but the client side was attempting to synchronously read `window.location.search` and `window.localStorage` in `useState` initialization to set values like `mode`, `username`, and `theme`.

**Solution:**
We removed the synchronous read functions from state initialization. Now, state is initialized strictly to default values (e.g., `mode = "single"`, `theme = "default"`). 
A new boolean state `isInitialized` (defaulting to `false`) was introduced. A `useEffect` hook runs on mount to read the actual URL query parameters and local storage values, applies them to the state, and then sets `isInitialized` to `true`.
Other `useEffect` hooks (such as syncing state back to the URL or performing API fetches) are guarded with `if (!isInitialized) return;` so they do not accidentally overwrite the URL with default values or fetch prematurely.

## Project Conventions
- **Component Architecture:** Reusable components are located in `app/components/`. 
- **Icons:** Use `lucide-react` for all iconography.
- **Client Components:** Add `"use client";` at the top of files that rely on React hooks (`useState`, `useEffect`).
- **Server Components:** Prioritize using Server Components where possible, unless interactivity or client APIs (like window) are required.

## API Endpoints
- `/api/streak`: Calculates a single user's streak.
- `/api/streak-compare`: Compares two users' streaks.

*(Keep this document updated as new core functionality, architectural changes, or significant bug fixes are added.)*
