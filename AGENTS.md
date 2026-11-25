# Qotes Frontend Project Instructions

This is the canonical project instruction file for all coding assistants and contributors. Tool-specific instruction files must point here or load this file; do not maintain a second copy of project rules.

## Mission and source of truth

- Work only on the Qotes Expo client, its design system, and client-side behavior. Do not create server specifications or infer server behavior beyond the documented client API contract.
- Before UI or design-token changes, read `dev_docs/UI_DESIGN_SPEC.md`; it is authoritative for presentation and accessibility.
- Before architecture or data-flow changes, read `dev_docs/frontend_architecture_stack_documentation.md` and `dev_docs/frontend_directory_layout_scalable_architecture.md`.
- Consult `docs/PRD.md`, `docs/API_SPEC.md`, and `docs/SETUP.md` only where relevant to product behavior, client integration, or setup.
- The project targets Expo SDK 58 (`expo` `^58.0.19` in `package.json`). For Expo-specific work, use the exact SDK 58 documentation: https://docs.expo.dev/versions/v58.0.0/.
- Confirm installed packages in `package.json` before using a library. The project uses Expo, React Native, React, strict TypeScript, Expo Router, TanStack Query v5, Zustand, NativeWind v4, Axios, MMKV, and SecureStore.
- The `@/*` alias maps to the repository root (`./*`) in `tsconfig.json`; for example, use `@/src/features/...`. Do not assume it maps to `src/` or change aliases incidentally.

## Architecture

### Expo Router

- Keep every file under `app/` under 20 lines.
- Route files declare navigation, read necessary route parameters, and immediately delegate to a screen under `src/features/*`.
- Layout routes contain only minimal declarative navigation configuration.
- Keep business logic, data fetching, query hooks, local feature state, and screen/layout composition outside route files.

### Feature boundaries

- Keep domain-specific components, hooks, screens, types, and behavior inside the owning feature: `auth`, `feed`, `reactions`, `compose`, `collections`, `profile`, `notifications`, or `settings`.
- Do not import another feature's private implementation. Use a narrow public feature API for cross-feature domain behavior.
- Promote generic code to `src/shared/` only when at least two distinct feature domains use it. Shared code must not depend on feature internals.
- Keep Axios, typed API contracts, versioning, and interceptors centralized in `src/core/api/`. Feature hooks call the API contracts; routes and UI components do not call Axios directly.

## State, API, and persistence

- TanStack Query v5 owns remote data, caching, pagination, mutations, and optimistic updates. Do not store server data in React state or duplicate it in Zustand.
- Zustand is for client-only UI state such as transient selections, open sheets, and theme preferences.
- Keep request/response types explicit and surface actionable failures. Do not swallow errors or substitute success-shaped empty data.
- The API client injects Bearer access tokens and handles 401 refresh as a silent, single-flight rotation, retrying the original request once. Terminal refresh failures must use the established auth/session UX.
- Store credentials and tokens through `expo-secure-store`; use `react-native-mmkv` through existing storage abstractions for cache and settings. Do not use AsyncStorage.
- Preserve platform-specific persistence abstractions and clear user-specific cached data on sign-out as specified by the UI design spec.

## Product and design invariants

- Quote content is plain text only. Do not add media attachments, quote-image generation, banners, collection covers, rich-text editing, or general media-picker/upload UI.
- A small profile avatar is the only permitted user image. Avatar selection belongs only in the avatar flow and must have a monogram fallback. Do not display quote image fields from API payloads.
- Preserve quote text, Unicode, and line breaks. Never clamp or truncate quote text in feeds, profiles, or detail views.
- Keep the quote's author (the attributed speaker) visually distinct from its creator (the posting account).
- Use the five display reactions in this order and vocabulary: Insightful, Empowering, Resonant, Artistic, Clap. Use the single wire/display mapping from the UI spec; do not invent or duplicate mappings.
- Follow the UI spec's monochrome foundation, reaction colors, Merriweather quote typography, Inter interface typography, and existing theme/token helpers.
- Use only the canonical spacing scale: 4, 8, 12, 16, 24, 32, 48. Avoid arbitrary spacing, card shadows, and ornamental effects.
- Preserve responsive behavior down to 320px, light/dark themes, dynamic type, reduced motion, WCAG contrast, screen-reader semantics, visible web focus, and minimum 44×44 interactive targets. Do not communicate state through color alone.

## Working and validation rules

- Inspect the relevant documentation, nearby code, actual package/configuration state, and worktree before editing. Preserve unrelated changes.
- Make the smallest complete change; follow existing patterns and avoid unrelated refactors, speculative abstractions, and unnecessary dependencies.
- Keep TypeScript strict. Prefer explicit types and guards over unsafe casts.
- Validate the requested behavior with the narrowest relevant existing typecheck, build, or test. Fix regressions caused by the change, not unrelated pre-existing issues.
- Report exactly what changed and which checks ran; do not claim unrun validation.
