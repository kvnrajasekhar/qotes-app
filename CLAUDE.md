# Qotes Frontend Architecture and Client Rules — Claude

## 1. Your role and scope

You are working in the `qotes-app` frontend: an Expo/React Native quotation-reading and curation app for iOS, Android, and responsive web. Act as a principal mobile architect and design systems lead. All guidance here concerns client architecture, client-side product behavior, and frontend design.

Do not create server-side specifications, server implementation patterns, or unrelated infrastructure guidance. Do not infer server behavior beyond the documented client API contract when implementing a client integration.

Make complete, precise, surgical changes. Preserve unrelated user changes. Inspect relevant documentation and nearby code before editing; validate the requested behavior, not just whether the code compiles.

## 2. Documentation and version authority

Read the smallest relevant part of the following sources before changing a surface:

1. **UI, interaction, accessibility, and design tokens:** [`dev_docs/UI_DESIGN_SPEC.md`](./dev_docs/UI_DESIGN_SPEC.md). This reconciles the source documents and is authoritative for client presentation.
2. **Feature boundaries and intended directory schema:** [`dev_docs/frontend_directory_layout_scalable_architecture.md`](./dev_docs/frontend_directory_layout_scalable_architecture.md).
3. **Client technology and data-flow context:** [`dev_docs/frontend_architecture_stack_documentation.md`](./dev_docs/frontend_architecture_stack_documentation.md).
4. **Product behaviors and constraints:** [`docs/PRD.md`](./docs/PRD.md).
5. **Client request/response shapes:** [`docs/API_SPEC.md`](./docs/API_SPEC.md). Use only to implement the client integration; do not translate it into server design instructions.
6. **Frontend setup and scripts:** [`docs/SETUP.md`](./docs/SETUP.md).

For Expo-specific work, use the exact versioned Expo SDK reference at <https://docs.expo.dev/versions/v57.0.0/>. Do not rely on unversioned examples or instructions for a different SDK.

The configured client stack is Expo SDK 57, React Native, React, strict TypeScript, Expo Router, TanStack Query v5, Zustand, NativeWind v4, Axios, `react-native-mmkv`, and `expo-secure-store`. The project also has Expo image utilities, which are permitted for avatar handling only. Check `package.json` before using any additional package; do not assume that a package mentioned in an architecture document has been installed.

### Alias reality

The actual [`tsconfig.json`](./tsconfig.json) currently maps:

```json
"paths": {
  "@/*": ["./*"]
}
```

Therefore `@/src/features/feed/...` currently resolves to `src/features/feed/...`. Do not assume `@/*` maps to `src/*` just because an architecture example proposes that mapping. Do not change path mappings as incidental cleanup; if an alias change is necessary, update all affected configuration/import conventions coherently.

## 3. Mental model

Keep dependency flow explicit:

```text
app/ (navigation declaration and delegation only)
  └── src/features/<domain>/screens (screen composition and domain UI)
        ├── feature components, hooks, types, and UI-only state
        ├── src/core/api/ (typed, centralized client contracts)
        └── src/shared/ (genuinely cross-feature primitives)
```

- `app/` describes how a route is reached and hands off immediately to feature-owned screen code.
- A feature owns its domain-specific presentation and behavior as a cohesive unit.
- `src/core/api/` owns the client network transport and versioned contracts.
- `src/shared/` contains cross-cutting frontend code only after multiple features genuinely need it.
- TanStack Query owns remote state. Zustand owns local interface state.
- Design tokens and accessibility requirements apply across every feature and platform.

## 4. Expo Router boundary — strict

Every file under `app/` must contain **fewer than 20 lines**. This is a hard route-boundary requirement, not a target average.

### Route file responsibilities

A route file may:

1. Declare its route entry and export the expected route component.
2. Read route parameters required to select the destination screen or provide screen inputs.
3. Immediately render/delegate to a screen inside `src/features/*`.

Layout route files may contain minimal declarative Expo Router navigation configuration only. Keep them below the same line limit.

```tsx
import { GlobalFeedScreen } from '@/src/features/feed/screens/GlobalFeedScreen';

export default function GlobalFeedRoute() {
  return <GlobalFeedScreen />;
}
```

Never place any of the following in `app/` route files:

- Business rules, feature behavior, validation, or error handling.
- Fetch calls, Axios calls, TanStack Query hooks, cache manipulation, or mutations.
- Form state, feed state, or other feature state.
- Screen components, layout containers, complex providers, or presentation composition.

If a change appears to need more code in a route, move the behavior into a feature screen or the established client infrastructure instead of weakening this boundary. Keep existing routes under the line limit when editing; avoid unrelated route migrations.

## 5. Feature-driven modular architecture

### Domains and ownership

The primary domains are:

- `src/features/auth/` — authentication UI and client session behavior.
- `src/features/feed/` — feed screens, quote cards, feed queries, and feed-specific types.
- `src/features/reactions/` — reaction selection and interaction UI.
- `src/features/compose/` — text-only quote composition.
- `src/features/collections/` — saved quotes and collection UI.
- `src/features/profile/` — own/public profiles and profile UI.
- `src/features/notifications/` — present in the current tree; keep any notification work isolated there.

Within each feature, keep the private `components/`, `hooks/`, `screens/`, and `types/` that the feature needs. Do not create empty layers just to fill out a template. Domain-specific modules remain private unless deliberately exposed through a stable public surface.

### Cross-feature imports

- A feature must not reach into another feature's private directory.
- For a genuinely generic primitive used in at least two independent domains, promote it to `src/shared/`.
- For domain behavior needed by another feature, use a narrow public feature API rather than importing internal components, hooks, or types.
- `src/shared/` must not import from `src/features/*`. Keep shared dependencies independent of feature implementation.
- Do not promote code to shared based on hypothetical future reuse or because it is inconvenient to keep locally.

## 6. State, persistence, and client API

### Server state versus UI state

- Use TanStack Query v5 for remote reads/writes, cache identity, cursor pagination, invalidation, background refresh, and optimistic updates.
- Never use `useState`/React state as a remote entity cache, and never duplicate query data into Zustand.
- Use Zustand for UI-only state: open/closed sheets, local selections, ephemeral view preferences, and theme settings.
- Keep form-local transient input state local to its feature screen or form component.
- Follow documented query keys, pagination shape, cache behavior, and optimistic rollback in `UI_DESIGN_SPEC.md`; avoid whole-cache snapshot rollback when the spec prescribes inverse deltas.

### Central network layer

- Centralize the Axios instance, typed request/response contracts, interceptors, and API version partitioning under `src/core/api/` (`v1/`, and future versions only when needed).
- Feature hooks call typed client API contracts. UI components and route files do not call Axios or construct authorization headers.
- Request interception injects the Bearer access token.
- Response handling performs silent, single-flight refresh-token rotation on 401 and retries the original request once. A final refresh failure must follow the established session-expired/sign-out UX; it must not be silently treated as success.
- Model both success and error responses with proper types. Handle status-specific behavior at the feature boundary; preserve actionable errors for the user.
- Do not add broad catches, silent fallback success values, or fake empty data to hide network failures.

### Storage policy

- Store credentials and tokens through `expo-secure-store`.
- Use `react-native-mmkv` through the existing storage abstraction for local cache and settings.
- **Do not use `AsyncStorage`.**
- Preserve the platform abstraction for web/native storage where it exists; do not access persistence APIs directly throughout features.
- Clear user-specific cached data when signing out, according to the UI specification.

## 7. Product invariants

### Text-first means text-only quote content

- Quote text is the product's content. Do not add image or video posts, file/media attachments, quote image pickers, generated quote imagery, image-based sharing, banners, collection covers, GIF/sticker controls, link previews, or rich-text quote editors.
- Plain Unicode text and user-entered line breaks are retained. Do not clamp or truncate quote text in feed, profile, or detail views.
- The only permitted image content is a small user profile avatar. Avatar selection/upload may exist only in the avatar flow. Always provide a monogram fallback for absent or failed avatar images.
- Never generalize avatar image permission into a general media-picker/upload capability.
- Do not display image fields that may appear in a client payload; discard them in the client adapter as specified in the UI document.

### Attribution and reactions

- Keep `author` (who said the quote) visually separate from `creator` (who posted it). The quote attribution belongs with the quote body; creator identity belongs in the post header.
- Display the five reactions in the documented UI order and vocabulary: **Insightful**, **Empowering**, **Resonant**, **Artistic**, **Clap**.
- The client UI spec documents conflicting wire and display names. Use its single `REACTIONS`/mapping source for any conversion. Do not invent mappings, rename wire values, or duplicate mapping logic.
- Derive the reaction headline total from the reaction breakdown; do not surface the legacy `likes` count as a product interaction.
- Respect the documented viewer-state and optimistic mutation behavior instead of inferring user state from counts.

## 8. Design system

The [`UI_DESIGN_SPEC.md`](./dev_docs/UI_DESIGN_SPEC.md) is normative. Before adding UI or changing styles, consult its relevant section and existing theme/token helpers.

### Visual language

- Editorial, restrained, monochromatic: black, white, and neutral grays form the foundation. Reaction colors are reserved for emotion states and must not replace the neutral UI.
- Use **Merriweather** for quote content and **Inter** for interface chrome as the specified typography roles require.
- Use existing NativeWind v4 conventions and shared tokens. Avoid one-off color, type, radius, and spacing values where a token exists.
- Use only the canonical spacing values: **4, 8, 12, 16, 24, 32, 48**.
- Feed cards are flat and editorial. Do not add shadows or decorative effects.
- Responsive layouts must work at 320px minimum width, adapt through the documented breakpoints, and preserve the specified mobile and desktop reading measure.
- Never truncate feed or detail quote text. A short excerpt is permitted only where the UI specification explicitly describes a preview.

### Accessibility and interaction

- Interactive hit targets are at least 44×44.
- Support light/dark presentation, dynamic type, reduced motion, keyboard navigation and visible focus on web, and correct screen-reader roles/labels/state announcements.
- Keep text and non-text contrast at the UI-spec thresholds. State must not be conveyed by color alone.
- Respect safe areas, responsive navigation, and platform conventions without forking the design system.
- Use the prescribed motion and remove/disable animation under reduced-motion preferences.

## 9. Naming and implementation conventions

- TypeScript remains strict; prefer explicit domain types and narrow unions over broad types or unsafe casts.
- Use functional React components and feature-local hooks. Use descriptive PascalCase component/screen names and `use...` hook names, following adjacent code.
- Prefer existing helpers, theme hooks, storage adapters, query conventions, and components over duplicate implementations.
- Keep components cohesive and presentation-focused; keep domain logic in feature hooks/modules and network transport/contracts in `src/core/api/`.
- Do not introduce new styling systems or state libraries.
- Avoid unrelated refactors, speculative abstractions, package additions, or broad directory moves.

## 10. Execution checklist

### Before a change

1. Identify the owning feature, screen, route, and relevant design spec sections.
2. Read the relevant local documentation and inspect neighboring implementation.
3. Verify actual package versions, Expo SDK assumptions, path aliases, tokens, and storage helpers.
4. Check the worktree and preserve changes unrelated to the task.
5. Decide the smallest architectural layer that should own the behavior.

### During a change

1. Keep every `app/` file below 20 lines and delegate to feature screens.
2. Keep feature-private modules inside their feature; share only after two distinct consumers exist.
3. Keep API transport centralized and server data in TanStack Query.
4. Use client-only Zustand state and approved storage APIs only.
5. Follow text-only, avatar-only image, token, accessibility, and responsive requirements.
6. Report errors honestly; do not suppress them or fake successful data.

### After a change

1. Recheck the route line limit, import boundaries, and design/product constraints.
2. Run the narrowest relevant typecheck, build, or tests available; use the repository's actual scripts.
3. Fix regressions caused by the change; do not expand scope to unrelated pre-existing issues.
4. Summarize files/behavior changed and exact validation performed. State clearly when validation was unavailable.
