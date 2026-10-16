#!/usr/bin/env bash
# Checks prerequisites and installs dependencies. Run this once before run.sh.
set -euo pipefail

echo "==> Checking prerequisites"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed."
  echo "Install it from https://nodejs.org/ (need ^20.19.0 or >=22.12.0) and re-run this script."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed or not on PATH."
  exit 1
fi

echo "    $(node --version) / $(npm --version)"

echo "==> Checking that port 5173 looks free"
if command -v lsof >/dev/null 2>&1 && lsof -i ":5173" >/dev/null 2>&1; then
  echo "    WARNING: something is already listening on port 5173."
  echo "    'npm run dev' later may fail to bind it — stop whatever is using it first."
fi

echo "==> Installing dependencies"
npm install

echo ""
echo "Setup complete. Next: run ./run.sh to start the dev server."
echo "Note: the app needs case_intelbras_kafka_java's backend running on"
echo "localhost:8080 (its own ./run.sh) to show real data."
