#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

frontend_pid=""
backend_pid=""

cleanup() {
  if [[ -n "${frontend_pid}" ]]; then
    kill "${frontend_pid}" 2>/dev/null || true
  fi
  if [[ -n "${backend_pid}" ]]; then
    kill "${backend_pid}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

(
  cd "${ROOT_DIR}/backend"
  ./mvnw spring-boot:run
) &
backend_pid=$!

(
  cd "${ROOT_DIR}/frontend"
  npm run dev -- --host 0.0.0.0
) &
frontend_pid=$!

wait -n "${backend_pid}" "${frontend_pid}"
