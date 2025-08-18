## Purpose

Guidelines for AI assistants contributing code to this repository. Follow these Do's and Don'ts to keep the app consistent, secure, and maintainable.

### Golden Rules
- **Do** keep behavior consistent across all pages and reuse existing shared utilities/components.
- **Do** prefer small, incremental edits that preserve current UX and API contracts.
- **Don’t** introduce new technologies, libraries, routes, or patterns without explicit instruction.

## Architecture and Structure
- **Do** place shared logic in `src/lib/` and shared UI in `src/components/`.
- **Do** reuse existing shared components:
  - `Header` for page hero sections
  - `ThemeToggle` and `useTheme` for theming
  - `LoadingSpinner` for progress indicators
- **Do** centralize tunables with `src/lib/config.ts` (`API_TIMEOUT_MS`, `FILE_UPLOAD_DEFAULTS`, `STATUS_POLL_INTERVAL_MS`).
- **Don’t** create empty folders under `src/app/`. Every route must contain a meaningful file.
- **Don’t** duplicate constants/timeouts inline; import from `src/lib/config.ts`.

## Theming and Styling
- **Do** use `useTheme()` to read/apply theme and `<ThemeToggle />` to render a toggle.
- **Do** rely on Tailwind utilities and the existing `cn` helper for class composition.
- **Do** keep `body` font derived from Next fonts by ensuring the `font-sans` class remains on the `<body>` in `layout.tsx`.
- **Don’t** reintroduce custom `font-family` overrides in `globals.css` that fight Next fonts.
- **Don’t** reimplement separate per-page theme cookies or DOM toggles; always use `useTheme()`.

## API, Webhooks, and Data Flow
- **Do** use `api` from `src/lib/api.ts` for client-side HTTP calls.
- **Do** call external webhooks on the server via `executeWebhook` in `src/lib/webhook_utils.ts` (it already applies `API_TIMEOUT_MS`).
- **Do** maintain the response shape expected by `WebhookButton` and page handlers (success path resolves to a JSON body; errors surface a friendly message).
- **Do** keep status polling on the home page using `STATUS_POLL_INTERVAL_MS` and tolerant parsing of `{ code, status }`.
- **Don’t** bypass `api` or `executeWebhook` with ad-hoc `fetch` unless there is a clear reason and parity is preserved.
- **Don’t** change the webhook configs or validation contracts without instruction.

## Security and Sanitization
- **Do** sanitize any HTML injected into the DOM using `sanitizeHtml()` from `src/lib/sanitize.ts`.
- **Do** keep `FileUpload` limits aligned with `FILE_UPLOAD_DEFAULTS` and validate files before adding.
- **Don’t** render untrusted strings with `dangerouslySetInnerHTML` without sanitization.
- **Don’t** log secrets or sensitive payloads to the console.

## Components and UX Consistency
- **Do** keep page headers visually consistent by using `Header` with the correct accent color and icon.
- **Do** use `LoadingSpinner` instead of custom spinning divs.
- **Do** maintain accessible interactions (buttons/links with labels, focus states, and keyboard support).
- **Don’t** fork alternative header/toggle/spinner variants; extend shared components if necessary.

## Next.js/Route Conventions
- **Do** follow Next 15 dynamic route rules for API handlers:
  - In `route.ts`, access dynamic params via `await context.params`.
- **Do** return `NextResponse.json(...)` with appropriate status codes.
- **Don’t** access `params` synchronously in dynamic API routes.

## Performance and Reliability
- **Do** keep dev-only cache disabling limited to development paths as configured in `next.config.ts`.
- **Do** adjust status polling frequency using `STATUS_POLL_INTERVAL_MS` instead of hardcoding values.
- **Don’t** add aggressive polling or long-running client loops without a backoff strategy.

## Code Style and Quality
- **Do** keep TypeScript strict and avoid `any` where practical.
- **Do** keep names descriptive and readable; prefer clarity over brevity.
- **Do** keep linter output clean; run lint on edited files if available.
- **Don’t** introduce deep nesting, redundant try/catch, or commented-out code.

## Files and Assets
- **Do** remove unused public assets and dead code as you encounter them.
- **Don’t** add placeholder or demo routes/assets that are not in use.

## Out of Scope Unless Asked
- Schema validation rewrites (e.g., Zod), rate limiting, auth header changes, strict response type overhauls, SEO additions, test frameworks, or documentation overhauls are out of scope unless explicitly requested.

## When in Doubt
- Prefer extending existing patterns over introducing new ones.
- Ask (or leave a clearly marked note) before making structural changes.


