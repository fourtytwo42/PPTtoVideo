# DeckForge Studio

A production-oriented Next.js application that now couples a cinematic product tour with a fully wired operations stack for DeckForge Studio—the platform that converts presentation decks into narrated, cinematic video outputs.

## Stack

- **Next.js 14** with the App Router and TypeScript
- **styled-components** for expressive theming and custom UI (no Tailwind)
- **Prisma ORM** targeting PostgreSQL for persistent state
- **BullMQ + Redis** for background job orchestration
- **FFmpeg/ffprobe, LibreOffice, pdftoppm** for document rendering, duration probing, and video assembly (CLI dependencies)
- **OpenAI Responses API** and **ElevenLabs TTS** integrations

## Getting started

```bash
# install dependencies
npm install

# generate Prisma client
npm run prisma:generate

# run database migrations (expects DATABASE_URL to be set)
npm run prisma:migrate

# start Next.js
npm run dev

# in another terminal start the job workers
npm run worker
```

Configure environment variables as described in `.env.example`:

- `DATABASE_PROVIDER` and `DATABASE_URL` for Prisma (PostgreSQL recommended)
- `REDIS_URL` for BullMQ
- `FILE_STORAGE_ROOT` writable directory for source files and rendered media
- `OPENAI_API_KEY` and `ELEVENLABS_API_KEY` to enable script and narration generation
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` for credential-based sessions via NextAuth
- Optional overrides for LibreOffice, pdftoppm, FFmpeg, and ffprobe binaries (`LIBREOFFICE_PATH`, `PDFTOPNG_PATH`, `FFMPEG_PATH`, `FFPROBE_PATH`)

Once services are running visit `http://localhost:3000` for the marketing tour, or jump directly to:

- `/register` to create the first administrator and seed user access
- `/login` for subsequent sign-ins once credentials exist
- `/dashboard` for live operations: ingest decks, monitor jobs, and review notifications
- `/deck/[deckId]` for the collaborative script workspace and pipeline triggers
- `/api/decks/:deckId/final` (stream) and `/api/decks/:deckId/slides/:slideId/{audio|video}` (download) to retrieve rendered assets
- `/admin` for model defaults, limit configuration, and audit history (admins only)

## Project structure

```
app/
  (marketing)/page.tsx   → Story-driven product tour
  (auth)/                → Credential login/registration backed by NextAuth
  (app)/layout.tsx       → Shared chrome with live health banner + nav
  (app)/dashboard/       → Operations dashboard (server rendered)
  (app)/deck/[deckId]/   → Deck workspace (server data + client editor)
  (app)/admin/           → Admin console (server data + client settings)
  components/
    app/                 → Dashboard widgets, upload panel, notifications, deck workspace UI
    common/              → Navigation chrome and atmospheric backgrounds
    sections/            → Narrative sections for the marketing tour
    ui/                  → Reusable layout primitives (Section, GlowCard)
  hooks/
    useSystemOverview.ts → Client polling hook for nav health + alerts
lib/
  prisma.ts              → Prisma client singleton
  config.ts              → Environment configuration guard
  storage.ts             → File-system helpers for media paths
  jobs/queue.ts          → BullMQ queue and worker factory
  auth.ts                → Helper to resolve the signed-in Prisma user
  auth-options.ts        → NextAuth credentials configuration
  format.ts              → Duration, file size, and relative time helpers
  styled/                → Styled-components registry for SSR support
  upload.ts              → Form-data parsing helpers for uploads
theme/                   → Global theme tokens and typings
worker/
  jobs/*.ts              → Ingestion, script, audio, video, and assembly processors
  index.ts               → Worker bootstrap wiring BullMQ processors
prisma/
  schema.prisma          → Database schema modelling decks, slides, jobs, assets, notifications
```

## Production concerns

- **Document ingestion** depends on LibreOffice (`soffice`) for PPTX rasterization and `pdftoppm` for PDF image rendering. Ensure those binaries are available on worker hosts.
- **FFmpeg + ffprobe** are required for slide video creation, duration capture, and final assembly. Configure the `FFMPEG_PATH` / `FFPROBE_PATH` environment variables if the binaries are not on the default PATH.
- Workers assume Redis availability for BullMQ. Scale worker processes horizontally as job volume increases.
- The admin console persists defaults and limits via `SystemSetting`; seed sensible defaults during deployment.
- Per-user concurrency limits are enforced before a job is queued. Adjust `admin:concurrencyLimitPerUser` to tune throughput and
  prevent users from overwhelming shared workers.
- Soft limits for upload size and slide count follow the admin defaults. Oversized decks are accepted, but operators see warnings
  in the dashboard and workspace so they can anticipate longer pipelines.
- When OpenAI or ElevenLabs are unreachable the platform automatically marks itself "out of order" and disables new generation
  actions until the next successful job clears the flag.
- **Authentication** runs through NextAuth credentials. Protect `NEXTAUTH_SECRET`, rotate passwords, and layer SSO/2FA before production deployments.

## License

MIT
