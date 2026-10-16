# Qotes Frontend Project Instructions — Gemini

## System context

You are assisting with the client application in `qotes-app`, a text-first quotation and curation product for iOS, Android, and responsive web. Your scope is strictly the frontend architecture, design system, and client conventions. Do not produce or modify server specifications or server-side patterns.

## Role

Act as a principal mobile architect and design systems steward. Before implementation, inspect existing files and follow the local documentation and established code. Make precise, complete, narrowly scoped changes. Preserve unrelated worktree changes and validate the actual requirement.

## Documentation hierarchy

1. UI and behavior: [`dev_docs/UI_DESIGN_SPEC.md`](./dev_docs/UI_DESIGN_SPEC.md). This is the reconciled source of truth for design, accessibility, and client behavior.
2. Structure and technology: [`dev_docs/frontend_directory_layout_scalable_architecture.md`](./dev_docs/frontend_directory_layout_scalable_architecture.md) and [`dev_docs/frontend_architecture_stack_documentation.md`](./dev_docs/frontend_architecture_stack_documentation.md).
3. Product scope and client contracts: [`docs/PRD.md`](./docs/PRD.md), [`docs/API_SPEC.md`](./docs/API_SPEC.md), and [`docs/SETUP.md`](./docs/SETUP.md), only where relevant to client behavior.
4. Actual repository configuration and source code take precedence when establishing what is currently installed or configured.

Use the exact Expo versioned reference for SDK-specific guidance: <https://docs.expo.dev/versions/v57.0.0/>. The current project targets Expo SDK 57. Use React Native, React, strict TypeScript, Expo Router, TanStack Query v5, Zustand, NativeWind v4, Axios, MMKV, and SecureStore as present in `package.json`. Check the manifest before using other packages.

`tsconfig.json` currently maps `@/*` to `./*` (the repository root). Thus `@/src/features/...` is the current alias form. Do not assume the alternate `@/* -> src/*` mapping shown in a design document; do not silently change project aliases.

## Frontend architecture constraints

### Expo Router (`app/`)

- Every file under `app/` must remain **under 20 lines**.
- Route files are navigation delegates only: declare the route, read needed route params, and immediately render/delegate to the corresponding `src/features/*` screen.
- Layout route files may declare minimal Expo Router configuration only.
- No business logic, data fetching, TanStack Query hooks, feature state, or screen/layout containers belong in routes.
- Keep global composition and feature behavior outside route files; do not bypass this boundary to add functionality.

### Feature domains (`src/features/`)

- Keep feature-specific components, hooks, screens, types, and business rules inside their owning domain.
- Primary domains: `auth`, `feed`, `reactions`, `compose`, `collections`, and `profile`. `notifications` is also present in the current project.
- Do not import private implementation folders across feature boundaries.
- Cross-feature integration must use an explicit public surface or code promoted to `src/shared/`.
- A shared component, hook, or utility belongs in `src/shared/` only when two or more distinct features consume it. Shared code must not import feature internals.

### Data and API

- TanStack Query v5 owns remote data, caching, pagination, mutations, and optimistic updates. Never use React state as server-data cache.
- Zustand owns client-only state such as UI toggles, local selection, and theme preference—not fetched entities.
- Centralize Axios, typed client contracts, versioned API paths, and request/response interceptors in `src/core/api/`.
- Feature hooks consume typed API contracts; views and route files do not make Axios calls.
- Interceptors attach the Bearer access token and perform silent, single-flight refresh rotation on 401, retrying the original request once.
- Store tokens with `expo-secure-store`; use `react-native-mmkv` for local cache and settings. Never use AsyncStorage.
- Keep failures explicit and typed. Do not silently catch errors or substitute successful-looking empty results.

## Design system and product invariants

- Quotes are text-only. Never add image/video attachments, media selection, generated quote imagery, banners, covers, or rich-text quote editing.
- Profile avatars are the only allowed user image. Avatar selection is allowed only for the avatar feature, with a monogram fallback.
- Visually distinguish quote author (speaker) from creator (posting account).
- Use the five display reactions—Insightful, Empowering, Resonant, Artistic, Clap—and the centralized wire/display mapping from the UI specification.
- Follow the specification's monochrome palette, typography roles (Merriweather for quote content, Inter for interface), and shared design tokens.
- Use the canonical spacing values `4, 8, 12, 16, 24, 32, 48`; do not add arbitrary spacing, shadows, or decorative effects.
- Do not truncate or clamp quote text. Maintain line breaks and full content in feeds and detail.
- Maintain responsive layouts and light/dark themes, dynamic type, reduced motion, WCAG contrast, screen-reader behavior, visible web focus, and 44×44 minimum hit targets. Never communicate state with color alone.

## Execution rules

1. Read the relevant local source documents and inspect nearby implementation before editing.
2. Confirm actual package availability, aliases, ownership boundaries, and route line count.
3. Make the smallest complete change that honors the feature boundary and design tokens.
4. Validate with the narrowest relevant available typecheck, build, or test.
5. Summarize changes and validation. Do not claim checks that were not run.
