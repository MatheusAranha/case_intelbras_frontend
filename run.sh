#!/usr/bin/env bash
# Starts the Vite dev server on http://localhost:5173. /audits and /events
# calls are proxied to the backend on localhost:8080 (see vite.config.ts) —
# this does not start the backend itself.
set -euo pipefail

if [ ! -d node_modules ]; then
  echo "ERROR: dependencies are not installed."
  echo "Run ./setup.sh first."
  exit 1
fi

echo "==> Checking whether the backend (case_intelbras_kafka_java) is reachable on localhost:8080"
if curl -s -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
  echo "    Backend is up — the timeline and stream controls will show real data."
else
  echo "    WARNING: no response from http://localhost:8080/actuator/health."
  echo "    The UI will load, but /audits and /events/random-stream/* calls will fail"
  echo "    until the backend is running (see case_intelbras_kafka_java/run.sh)."
fi

echo "==> Starting the Vite dev server on http://localhost:5173"
echo "    Ctrl+C to stop."
echo ""
exec npm run dev
