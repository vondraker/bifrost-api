#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

info() {
  echo "[bootstrap] $1"
}

if [[ ! -f ".env" ]]; then
  cp .env.example .env
  info "Created .env from .env.example"
else
  info ".env already exists"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "[bootstrap] Docker is required but was not found in PATH."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[bootstrap] Docker Compose plugin is required (docker compose)."
  exit 1
fi

if [[ ! -f "docker-compose.yml" ]]; then
  echo "[bootstrap] docker-compose.yml not found in project root."
  exit 1
fi

if command -v ss >/dev/null 2>&1; then
  for port in 5433 6379; do
    if ss -ltn "( sport = :$port )" 2>/dev/null | tail -n +2 | grep -q .; then
      info "Port $port appears to be in use. If compose fails, stop the conflicting process first."
    fi
  done
fi

info "Starting infrastructure (PostgreSQL + Redis)"
docker compose up -d

info "Generating Prisma client"
npm run prisma:generate

info "Bootstrap completed. Run 'npm run dev' to start API or use 'npm run dev:bootstrap'."
