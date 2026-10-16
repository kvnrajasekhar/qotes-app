# Qotes Frontend Instructions — GitHub Copilot

Use this file as the project-level source of frontend guidance. Apply it to all changes in `qotes-app`. Keep work limited to the Expo client, its design system, and client-side conventions.

## Mission and source of truth

- Qotes is a text-first quote reading, sharing, and curation app for iOS, Android, and responsive web.
- Read [the UI design specification](./dev_docs/UI_DESIGN_SPEC.md) before changing UI or design tokens. It reconciles the product requirements and is authoritative for presentation.
- Read [frontend architecture](./dev_docs/frontend_architecture_stack_documentation.md) and [the directory layout specification](./dev_docs/frontend_directory_layout_scalable_architecture.md) before changing structure or data flow.
- Use [the PRD](./docs/PRD.md), [API contract](./docs/API_SPEC.md), and [setup guide](./docs/SETUP.md) only for relevant product and client integration details. Ignore server implementation guidance.
- The app uses Expo SDK 57, React Native, React, TypeScript, Expo Router, TanStack Query v5, Zustand, NativeWind v4, Axios, `react-native-mmkv`, and `expo-secure-store`. Confirm actual installed dependencies in `package.json` before using a library.
- Use the Expo SDK 57 documentation, not unversioned or other-version examples: <https://docs.expo.dev/versions/v57.0.0/>.
- TypeScript is strict. The actual `@/*` alias maps to the repository root (`./*`) in `tsconfig.json`; write imports accordingly, for example `@/src/features/feed/screens/GlobalFeedScreen`. Do not assume the docs' suggested `@/* -> src/*` mapping is configured.

## Architecture — enforce on every change

### Route checklist (`app/`)

- [ ] Keep **every file under `app/` under 20 lines**.
- [ ] Route files only declare navigation, read route parameters when required, and immediately delegate to a screen in `src/features/*`.
- [ ] Layout routes contain only minimal declarative Expo Router navigation configuration.
- [ ] Keep business logic, fetches, TanStack Query hooks, local feature state, and screen/layout containers out of route files.
- [ ] Do not add service or UI logic to route layouts to work around the line limit.

```tsx
import { GlobalFeedScreen } from '@/src/features/feed/screens/GlobalFeedScreen';

export default function GlobalFeedRoute() {
  return <GlobalFeedScreen />;
}
```

### Feature ownership

- Keep domain behavior and private `components/`, `hooks/`, `screens/`, and `types/` with the owning feature.
- Domains: `auth`, `feed`, `reactions`, `compose`, `collections`, and `profile`; `notifications` also exists in the current tree.
- Feature-private implementation must not be imported directly by another feature. Share only through an explicit public surface or genuinely shared code.
- Promote code to `src/shared/` only when it is used by at least **two distinct feature domains**. Shared code must not depend on feature internals.
- Keep domain-specific API adapters, UI, and state with their feature unless they belong to the centralized API or shared design system.

```text
app/                              # thin route delegates, <20 LOC each
src/
  core/api/                       # central Axios client and versioned contracts
  features/<domain>/
    components/
    hooks/
    screens/
    types/
  shared/                         # cross-feature code only (2+ domains)
    components/
    hooks/
    lib/
    stores/
    tokens/
```

### State and network boundaries

- Use TanStack Query v5 for remote/server state, cache, pagination, mutations, and optimistic updates; do not cache server data in React component state or duplicate query cache in Zustand.
- Use Zustand for client-only UI state (for example open sheets, transient selections, or theme preference).
- Keep Axios instance, typed client contracts, request/response interceptors, and API versioning centralized in `src/core/api/`. Feature hooks call these contracts; components and routes do not call Axios directly.
- Request interception injects the Bearer access token. A 401 response uses silent, single-flight refresh-token rotation and retries the original request once; surface terminal failures through the app's established auth/error UX.
- Use `expo-secure-store` for credentials/tokens and `react-native-mmkv` for cache and settings. **Do not use AsyncStorage.** Keep platform-specific persistence behind existing storage abstractions.
- Preserve typed success/error handling. Do not swallow failures, invent success-shaped fallback data, or add broad catches.

## Product and design system — strict guardrails

- Quote content is plain text only: no quote image/video attachments, media picker, generated image, banner, cover image, rich-text editor, or media upload UI.
- The only permitted user image is a small profile avatar. Image picking/upload is allowed only for the avatar flow; use an avatar/monogram fallback. Do not expand image use to quote or collection content.
- A quote's **author** is the attributed speaker; its **creator** is the posting account. Keep these labels and visual treatments distinct.
- Preserve the five display reactions: Insightful, Empowering, Resonant, Artistic, and Clap. For wire/display conversion, use the single mapping in the UI spec; never guess or duplicate mappings.
- Follow the UI spec's monochrome foundation (black, white, neutral grays), reaction colors, Merriweather quote typography, and Inter UI typography. Prefer established tokens over literal values or ad-hoc styling.
- Use only the specified spacing scale: `4, 8, 12, 16, 24, 32, 48`. No arbitrary spacing, card shadows, or ornamental visual effects.
- Never clamp or truncate quote text in feeds or detail screens. Preserve line breaks and provide full quote text.
- Maintain light/dark theme behavior, dynamic type, reduced motion, screen-reader semantics, visible focus on web, WCAG contrast, and minimum 44×44 interactive targets. Color alone must not communicate state.
- Use NativeWind v4 and existing theme/token helpers consistently. Do not introduce a competing styling system.

## Implementation blueprint

For a feature change, keep the flow:

1. Route in `app/` delegates to a feature screen.
2. Screen composes feature-owned components and hooks.
3. Feature hooks use TanStack Query and the typed `src/core/api/` client contracts.
4. Shared UI is promoted only after a second independent feature needs it.
5. UI uses shared tokens and satisfies the text-only and accessibility rules.

**Before editing**

- [ ] Read the relevant local architecture/design docs and inspect nearby code for established patterns.
- [ ] Check package availability and the actual `@/*` mapping.
- [ ] Identify the owning feature and keep the change within that boundary.
- [ ] Preserve unrelated worktree changes.

**After editing**

- [ ] Check route files remain below 20 LOC.
- [ ] Check there are no cross-feature private imports, AsyncStorage references, or quote-media controls.
- [ ] Run the smallest applicable TypeScript/build/test validation available in the project.
- [ ] Report what changed and any validation that could not be run.
