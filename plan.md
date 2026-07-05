# TripAI — v1 Build Plan

An Expo SDK 57 / React Native 0.86 AI trip planner. This file is the living checklist for v1 —
check items off (`[x]`) as they land. Full rationale lives in the approved plan; this is the todo view.

**Legend:** `[ ]` todo · `[x]` done · `[~]` in progress

---

## Ground rules
- [ ] Verify every Expo/RN API against https://docs.expo.dev/versions/v57.0.0/ before coding (AGENTS.md mandate)
- [ ] Dev-first: run against local Expo dev server + **Inngest dev server** (`npx inngest-cli dev`); **no EAS Hosting deploy yet**
- [ ] Keep backend code host-agnostic so the eventual EAS Hosting deploy is config-only
- [ ] TypeScript strict; `expo lint` + `tsc` clean at each milestone

---

## Phase 0 — Environment & dependencies
- [ ] Add RevenueCat dep `react-native-purchases` (+ config plugin), verify Expo 57 compat
- [ ] Add test runner + supporting dev deps for critical-path tests
- [ ] Fill `.env` from `.env.example` (Clerk, Neon, OpenAI, Google, ImageKit, Inngest, Sentry, RevenueCat)
- [ ] Confirm `EXPO_PUBLIC_API_ORIGIN` handling for local dev

## Phase 1 — Database schema
- [ ] `users`: add `isPro boolean default false`, `proExpiresAt timestamp`
- [ ] (Optional) `users.revenuecatId text` to correlate RevenueCat app_user_id
- [ ] New `webhookEvents` table (`id`, `provider`, `externalId unique`, `receivedAt`) for webhook dedupe
- [ ] `npm run db:generate` → `db:migrate`/`db:push` against Neon dev branch; confirm tables

## Phase 2 — Server foundation (`src/server/`)
- [ ] `auth.ts` — verify Clerk session from request → `{ clerkId, userId }`
- [ ] `user.ts` — `getOrCreateUser(clerkId, email)` lazy-upsert fallback
- [ ] `entitlement.ts` — read `isPro`/`proExpiresAt` (expired → treated as free)
- [ ] `quota.ts` — `assertCanGenerate(userId)`:
  - [ ] free limit: non-Pro + lifetime trips ≥ 3 → `402 QUOTA`
  - [ ] rate limit: trips in last rolling 24h ≥ 20 → `429 RATE_LIMIT` (applies to everyone incl. Pro)

## Phase 3 — AI + generation pipeline
- [ ] `src/ai/itinerary-schema.ts` — Zod schema mirroring DB (days→activities, places, hotels, budget)
- [ ] `src/ai/generate-itinerary.ts` — prompt → OpenAI Structured Outputs → Zod validate → typed object (token cap)
- [ ] `src/lib/geocode.ts` — batch geocode via Google, best-effort (`geocodeConfident` + coords or null)
- [ ] `src/inngest/client.ts` — Inngest client
- [ ] `src/inngest/functions/generate-trip.ts` — steps:
  - [ ] set `trip.status = generating`
  - [ ] generate itinerary (AI)
  - [ ] geocode places
  - [ ] persist tripDays / activities / places / hotelSuggestions / budgetItems (transaction)
  - [ ] set `trip.status = ready`; on failure → `failed` + `error` + Sentry capture

## Phase 4 — API routes (`src/app/api/**+api.ts`)
- [ ] `trips+api.ts` — POST create (auth → quota → rate limit → insert pending → `inngest.send` → `{id}`); GET list
- [ ] `trips/[id]+api.ts` — GET one with relations (poll + detail), ownership-checked
- [ ] `inngest+api.ts` — Inngest `serve()` handler
- [ ] `webhooks/clerk+api.ts` — verify Svix signature → upsert `users` on `user.created`/`updated`; dedupe
- [ ] `webhooks/revenuecat+api.ts` — verify → set `isPro`/`proExpiresAt`; dedupe
- [ ] `imagekit/auth+api.ts` — short-lived ImageKit upload signature
- [ ] `photos+api.ts` — POST attach `{tripId, imagekitUrl}` → insert `tripPhotos`, ownership-checked

## Phase 5 — Client (expo-router)
- [ ] `src/lib/api.ts` — fetch wrapper injecting Clerk token, base = `EXPO_PUBLIC_API_ORIGIN`
- [ ] `src/lib/sentry.ts` + `src/lib/revenuecat.ts`
- [ ] `_layout.tsx` — Sentry wrap, `ClerkProvider` (secure-store token cache), splash, theme, auth redirect
- [ ] `(auth)/sign-in.tsx` — Google + Apple OAuth buttons
- [ ] `(app)/_layout.tsx` — authed stack; ensure user provisioned
- [ ] `(app)/index.tsx` — Dashboard (recent/upcoming trips + Generate CTA + empty state)
- [ ] `(app)/generate.tsx` — form (destination, days, travelers, budget, interests, pace) → POST → loading
- [ ] `(app)/trip/[id].tsx`:
  - [ ] pending/generating → polling loading screen (~2s, ~90s timeout)
  - [ ] ready → itinerary cards + react-native-maps pins + hotels + budget
  - [ ] photo upload (expo-image-picker → ImageKit auth → upload → POST /api/photos)
  - [ ] failed → error state
- [ ] `(app)/paywall.tsx` — RevenueCat offering on `402`; on purchase → entitlement → retry generate

## Phase 6 — Observability
- [ ] Sentry init on client (`_layout`) and server (API routes + Inngest fn)
- [ ] Capture generation failures (tripId + step), webhook signature failures; quota/rate-limit as breadcrumbs

## Phase 7 — Tests (critical path)
- [ ] Zod parse of valid + malformed OpenAI payloads
- [ ] `quota.ts` boundaries: free 2→3→blocked; rate 19→20→429; Pro bypasses free but not rate
- [ ] Inngest `generate-trip` with mocked AI + geocode → persisted rows + status transitions + failure path
- [ ] Webhook signature verify + idempotency dedupe

## Phase 8 — End-to-end verification
- [ ] Run Inngest dev server + `expo start`; sign in with Google on simulator/device
- [ ] Generate a trip → poll works, Inngest fn runs, status → ready, detail renders itinerary + map pins
- [ ] Force failure (bad AI key) → `failed` state + Sentry event
- [ ] Quota: 3 trips → 4th `402` → paywall. Rate limit: 20 in 24h → 21st `429`
- [ ] Upload photo → ImageKit URL persists + renders via `expo-image`
- [ ] RevenueCat sandbox purchase → webhook flips `isPro` → free limit bypassed (rate limit still enforced)
- [ ] `expo lint` + `tsc` clean

---

## Assumptions (flag if wrong)
- [ ] OpenAI Structured Outputs (`response_format: json_schema`), capable model, per-gen token cap
- [ ] Poll timeout ~90s → failed UI; trip still resolves later on dashboard
- [ ] RevenueCat webhook syncs Pro into DB; quota reads Pro server-side (client SDK not trusted)
- [ ] Geocoding best-effort — never fails generation
- [ ] Photo upload via server-issued short-lived ImageKit signature; store URL only
- [ ] Quota counts successfully-created trips (any status) toward lifetime 3
- [ ] Rate-limit window = rolling 24h from `trips.createdAt` (no new table)

## Out of v1
email auth · itinerary edit/regenerate/delete · push notifications · offline · sharing · onboarding personalization · EAS Hosting deploy

## Risks to watch
- [ ] Full-richness generation latency vs ~90s poll window — load-test early; consider status streaming if long
- [ ] Set OpenAI per-generation + monthly cost ceilings
- [ ] EAS Hosting later: confirm API-route timeouts + Inngest `serve` + webhook endpoints against v57 docs
