# Expo HAS CHANGED — read the docs first

SDK 57 changed a lot. Model training data is stale. Before writing ANY Expo,
Expo Router, or `@expo/ui` code, read the exact versioned docs:
https://docs.expo.dev/versions/v57.0.0/ — do not rely on memory or older SDK patterns.

---

## NEVER run the app

The app is already running in a separate terminal. Do NOT start it yourself —
never run `expo start`, `npm run start`, `npm run ios`, `npm run android`,
`npm run web`, or any other command that launches or builds the app. Assume it
is always running.

---

## Stack (this is a routing map — obey it, don't reinvent)

- **Expo Router** for both screens and backend. API routes are `+api.ts` files
  in `src/app`; `web.output: "server"`. Frontend and backend share one tree.
- **Database: Postgres on Neon** (serverless). Use the Neon serverless client —
  never a plain `pg`/TCP connection.
- **ORM: Drizzle.** Schema lives in `src/db/schema.ts`, client in
  `src/db/client.ts`. All DB access goes through Drizzle — never raw SQL.
  Migrations only via `npm run db:generate` / `db:migrate` / `db:push`.
- **Auth: Clerk** (`@clerk/clerk-expo`). Every API route is scoped to the
  authenticated `userId` — never trust a client-supplied user id.
- **Background jobs: Inngest.** Long-running work (trip generation) runs in
  Inngest functions, never inline in a request handler.
- **Image optimization: ImageKit.** All image upload/transform/delivery goes
  through ImageKit — don't serve raw source images.
- **AI: OpenAI** with Zod structured outputs. ALWAYS validate AI output with
  `.parse()` before persisting.
- **Styling: NativeWind v4** (Tailwind classes). Config in `tailwind.config.js`.
- **Error tracking & monitoring: Sentry** — initialized in `src/app/_layout.tsx`.

## UI rule: NATIVE ALWAYS — always use native tabs

- This project **always uses native tabs**. Never build or use a JavaScript tab
  bar or any JS-reimplemented navigation. Use the native tabs from `@expo/ui`.
- Prefer `@expo/ui` native components everywhere over hand-rolled JS equivalents.
- Icons via `expo-symbols` (SF Symbols), not JS icon libraries.
- Use `expo-glass-effect` for glass/blur surfaces.
- Only build a custom component when no native one exists.

## Conventions

- Validate at every boundary with **Zod** (request bodies, AI output, jsonb shapes).
- All DB queries filter by the authenticated `userId`.
- API routes return correct status codes (401 unauth, 400 bad input, etc.).

## Config

- `app.config.ts` is dynamic and **extends** `app.json`. Secrets (Google Maps
  keys, `EXPO_PUBLIC_API_ORIGIN`) come from env — never hardcode them in `app.json`.
- `.env.example` is the source of truth for required env vars; keep it in sync.
- `typedRoutes` and `reactCompiler` are ON. Don't add manual `useMemo`/
  `useCallback` the compiler handles; use typed route hrefs.

## Don't

- Don't restate `package.json` versions or the `plan.md` build checklist here.
