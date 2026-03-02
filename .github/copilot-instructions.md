NO DUMMY DATA ANYWHERE IN THE CODEBASE ONLY SERVER DATA SOURCES ARE ALLOWED

# 🚀 Copilot Project Development Standards

These standards apply to all repositories and projects including:

- `app`
- `admin-panel`
- `website`
- `server`

**Package Manager: `pnpm` (mandatory)**

---

# 📁 Folder Structure Rules (All Projects)

- Create separate folders for each tool/module inside:
  - `app`
  - `admin-panel`
  - `website`
  - `server`

## Standard Tool Structure


tool-name/
components/
hooks/
services/
types/
utils/
index.ts


Each tool must be modular, reusable, and isolated.

---

# ✅ Mandatory Pre-Completion Checklist (All Projects)

Before marking any task complete:

1. Run `pnpm build`
2. Run `pnpm type-check`
3. Fix all build errors
4. Fix all TypeScript strict mode errors
5. Ensure no file is skipped during review
6. Run formatter
7. Remove unused imports
8. Remove console logs (except intentional debug configs)

---

# 🧠 TypeScript Standards (Strict Mode Required)

- `"strict": true` must be enabled
- Never use:
  - `any`
  - `unknown`
  - Incorrect `never`
- Always define:
  - Interfaces
  - DTOs
  - API response types
- Use:
  - `interface` for object contracts
  - `type` for unions and mapped types
  - Proper generics where needed
- Avoid implicit return types

---

# 🎨 Admin Panel Standards (React + MUI + TypeScript)

## 📦 Component Architecture

- No `.tsx` file should exceed **200 lines**
- If it exceeds, break into smaller reusable components:


ComponentName/
ComponentName.tsx
ComponentName.types.ts
ComponentName.utils.ts
components/


---

## 📐 MUI Rules

- Use **MUI Components only**
- Import Grid only like:

```ts
1. import Grid from '@mui/material/Grid';
2. Always use the size attribute for Grid layouts
3. Do NOT use SCSS
4. Avoid custom styling unless absolutely necessary

📱 Responsiveness (Mandatory)
1. Fully responsive
2. Mobile-first
3. Tablet compatible
4. Desktop optimized
5. Use MUI breakpoints correctly
6. Avoid fixed widths

📝 Forms
1. Use: Formik, Yup
2. Validation schemas must be typed
3. Show proper error messages
4. Use reusable form components
5. Avoid uncontrolled inputs

🌍 State Management
1. Use Props by default
2. Use Context API only for:
3. Deeply nested data
4. Global state (auth, user, theme)
5. Avoid misuse of Context
6. Never use any in context definitions

📊 Tables (Mandatory Features)
1. Every table must support:
2. Pagination (backend driven)
3. Filtering
4. Searching
5. Sorting
6. Loading state
7. Empty state
8. Error state
9. Backend APIs must support:
?page=
?limit=
?search=
?sortBy=
?order=
?filters=


🧭 Navigation
1. Add Breadcrumbs on every page
2. Page title must match breadcrumb
3. Use consistent layout wrapper

🖥 Server Standards (GraphQL + TypeScript)
⚙️ Tech Stack

GraphQL

TypeScript (strict mode)

Modular architecture

Module Structure
modules/
  user/
    user.schema.ts
    user.resolver.ts
    user.service.ts
    user.types.ts
📐 GraphQL Rules

Separate:

Schema

Resolver

Service

Types

No business logic inside resolvers

Implement:

Query

Mutation

Pagination pattern

Use consistent error format

Validate inputs before processing

🔐 Security Standards

JWT authentication

Role-based authorization

Input validation required

Sanitize inputs

No direct DB access inside resolvers

Environment variables required for secrets

📦 Package Management Rules

Use pnpm only

No npm

No yarn

Commit lockfile

Use exact versions for critical packages

🧪 Code Quality Rules

Follow DRY principle

Avoid duplicate logic

Create reusable hooks

Create reusable utilities

Use clear naming conventions

Use barrel exports when appropriate

Avoid deep nested folders

🚀 Production Readiness Checklist

Before marking any feature complete:

Build passes

Type check passes

Fully responsive

No warnings

APIs tested

No hardcoded secrets

Environment variables validated

Error handling implemented

Loading states implemented

🏁 Completion Rule

A task is considered complete only if:

All standards above are satisfied

Code is clean, modular, typed, and production-ready

Strict TypeScript compliance is maintained

For backend for every feature apis use below file structure
<feature>.typeDefs.ts
<feature>.resolvers.ts
<feature>.models.ts
<feature>.services.ts
<feature>.validators.ts