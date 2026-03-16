NO DUMMY DATA ANYWHERE IN THE CODEBASE ONLY SERVER DATA SOURCES ARE ALLOWED

Write only production-level code (no tricks or shortcuts), strictly follow .github/copilot-instructions.md, and after completing all work run lint, type checks, build, generate the APK, push the code, and keep fixing and rerunning the pipeline until all GitHub Actions pass successfully, then save the final APK with date and time append in file name in the output-package folder.

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
1. GraphQL
2. TypeScript (strict mode)
3. Modular architecture
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
4. No business logic inside resolvers
5. Implement:
Query
Mutation
Pagination pattern
Use consistent error format
Validate inputs before processing

🔐 Security Standards
1. JWT authentication
2. Role-based authorization
3. Input validation required
4. Sanitize inputs
5. No direct DB access inside resolvers
6. Environment variables required for secrets

📦 Package Management Rules
1. Use pnpm only
2. No npm
3. No yarn
4. Commit lockfile
5. Use exact versions for critical packages

🧪 Code Quality Rules
1. Follow DRY principle
2. Avoid duplicate logic
3. Create reusable hooks
4. Create reusable utilities
5. Use clear naming conventions
6. Use barrel exports when appropriate
7. Avoid deep nested folders

🚀 Production Readiness Checklist
1. Before marking any feature complete:
2. Build passes
3.Type check passes
4. Fully responsive
5. No warnings
6. APIs tested
7. No hardcoded secrets
8. Environment variables validated
9. Error handling implemented
10. Loading states implemented

🏁 Completion Rule
A task is considered complete only if:
1. All standards above are satisfied
2. Code is clean, modular, typed, and production-ready
3. Strict TypeScript compliance is maintained
4. For backend for every feature apis use below file structure
<feature>.typeDefs.ts
<feature>.resolvers.ts
<feature>.models.ts
<feature>.services.ts
<feature>.validators.ts

Testing Standards
No test file should exceed 200 lines. If it does, please segregate it into multiple files within the same module by creating a __tests__ folder. Also, please provide testing standards for the same.

#Additionally
1. Do not user any depreacated things in codebase in any of the projects
2. Do not use any dummy data anywhere in the codebase only server data sources are allowed
3. Production level code quality is expected in all projects and repositories no compromises on code quality is allowed in any of the projects and repositories
4. For any new feature added to the codebase make sure to add all the necessary tests for that feature and maintain 100% code coverage for that feature
5. For any new feature added to the codebase make sure to add all the necessary documentation for that feature and maintain the documentation up to date for that feature
6. Any changes in code update the test cases and documentation accordingly and maintain the code quality and standards for that feature

# Regarding Test cases
1. Ensure that no test file exceeds 200 lines. If needed, split them into multiple files within the same module (for example, inside a __tests__ folder).
2. Do not use any shortcuts, tricks, or mocked false-positive tests. Only write real and meaningful test cases that cover all micro-level scenarios.
3. If any issue arises while writing the tests, you may modify the application code where necessary, but do not tweak or weaken the test cases just to make them pass. The goal is to achieve production-ready code with reliable tests.
4. While fixing issues or improving the code, ensure there are no breaking changes and the existing functionality remains intact.
5. Please think deeply about edge cases and ensure the final implementation is stable, clean, and production-ready.
6. Many test cases are causing long waits or breaking during execution. Please investigate and ensure that no test case blocks the command line execution.
7. Identify which test cases are causing the UI or test runner to hang or block, and fix the underlying issue. Tests should run smoothly without long blocking waits or freezes.
8. If necessary, update the implementation to ensure that the tests execute reliably and efficiently, while maintaining production-ready behavior and no breaking changes.