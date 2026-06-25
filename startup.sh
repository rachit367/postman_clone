#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "==> Postman Clone startup"

command -v python3 >/dev/null || { echo "python3 is required"; exit 1; }
command -v node >/dev/null || { echo "node is required"; exit 1; }
command -v npm >/dev/null || { echo "npm is required"; exit 1; }

echo "==> [1/5] Backend"
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install --upgrade pip >/dev/null
.venv/bin/pip install -r requirements.txt
if [ ! -f ".env" ]; then
  echo "    creating backend/.env with a generated APP_SECRET_KEY"
  KEY="$(.venv/bin/python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"
  cat > .env <<EOF
APP_SECRET_KEY=$KEY
DATABASE_URL=sqlite:///./postman_clone.db
SCRIPT_SIDECAR_URL=http://127.0.0.1:9111
CORS_ORIGINS=http://localhost:3000
EOF
fi
.venv/bin/alembic upgrade head
.venv/bin/python -m seed

echo "==> [2/5] Script sidecar"
cd "$ROOT/script-sidecar"
npm install

echo "==> [3/5] Frontend"
cd "$ROOT/frontend"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  echo "    creating frontend/.env (NEXT_PUBLIC_API_BASE=http://localhost:8000/api)"
  echo "NEXT_PUBLIC_API_BASE=http://localhost:8000/api" > .env
fi
npm install
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true

echo "==> [4/5] PM2"
cd "$ROOT"
if ! command -v pm2 >/dev/null; then
  echo "    installing pm2 globally"
  npm install -g pm2
fi

echo "==> [5/5] Launch"
pm2 start ecosystem.config.js
pm2 save

echo "==> Done. Services:"
echo "    frontend  http://localhost:3000"
echo "    backend   http://localhost:8000/api"
echo "    sidecar   http://127.0.0.1:9111"
echo "    manage with: pm2 list | pm2 logs | pm2 restart all"
