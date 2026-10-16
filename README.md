# case_intelbras_frontend

A simple frontend for the [case_intelbras_kafka_java](https://github.com/MatheusAranha/case_intelbras_kafka_java)
backend — the Intelbras Backend Sênior case. Three things, all live:

- **Publish CSV** — a button that calls `POST /events/simulate`, publishing the
  backend's bundled sample dataset (100 real events + 4 synthetic DLQ demo rows) to
  Kafka. The backend's own `run.sh` no longer does this automatically — this button (or
  `curl -X POST http://localhost:8080/events/simulate`) is how you seed data.
- **Audit timeline** — polls `GET /audits` every 3 seconds (no loading flicker after
  the first load), showing the most recent events as colored pins (one color per
  `EventCategory`). Click a pin for its full detail: device, category, event type,
  timestamps, general info, dedup key.
- **Random event stream controls** — a form to `POST /events/random-stream/start`
  (events/minute, DLQ rate, duplicate rate, categories), a Stop button, and a live
  status panel (running, requested/published counts, started-at) polling
  `GET /events/random-stream/status`.

## Stack

React 19 + TypeScript + Vite 8, no UI framework, no state management library — the
whole app is two components (`src/components/AuditTimeline.tsx`,
`src/components/RandomStreamControls.tsx`) plus a thin `src/api.ts` fetch wrapper and
`src/types.ts` mirroring the backend's DTOs. Node `^20.19.0` or `>=22.12.0` (Vite 8's
own requirement).

### Reaching the backend

The backend has no CORS configuration, so in dev, `vite.config.ts` proxies `/audits`
and `/events/*` to `http://localhost:8080` server-side — the browser only ever talks to
the Vite dev server's own origin (`http://localhost:5173`), avoiding CORS entirely
without touching the backend. The app's own fetch calls (`src/api.ts`) just use
relative paths (`/audits`, `/events/random-stream/start`, etc.).

## Running it

```bash
./setup.sh   # checks Node/npm, installs dependencies
./run.sh     # starts the dev server on http://localhost:5173
```

`run.sh` warns (but doesn't block) if the backend isn't reachable on `localhost:8080` —
the UI still loads, but the timeline and stream controls will fail their API calls
until the backend is actually running. Start it first with
[case_intelbras_kafka_java](https://github.com/MatheusAranha/case_intelbras_kafka_java)'s
own `./run.sh`.

Port **5173** is Vite's default — not used by anything else in this case's backend
stack (8080 app, 9092 Kafka, 5432 Postgres, 9090 Prometheus, 3000 Grafana).

## Other scripts

```bash
npm run build     # tsc -b && vite build — type-checks, then bundles to dist/
npm run lint       # oxlint
npm run preview    # serves the production build locally
```

## Project layout

```
src/
├── types.ts                        AuditRecord, RandomEventStreamConfig/Status — mirrors the backend's DTOs
├── api.ts                          fetch wrappers for /audits and /events/random-stream/*
├── App.tsx                         layout: timeline on top, stream controls below
└── components/
    ├── AuditTimeline.tsx            polling, pins, category colors, detail panel
    └── RandomStreamControls.tsx     the start/stop form + live status
vite.config.ts                      dev server port + proxy config
```
