#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Building images..."
docker compose build

echo "==> Starting services..."
docker compose up -d

echo "==> Waiting for backend to be healthy..."
for i in {1..30}; do
    if docker compose exec -T backend python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" >/dev/null 2>&1; then
        echo "==> Backend is up."
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "!! Backend did not become healthy in time."
        docker compose logs backend
        exit 1
    fi
    sleep 1
done

echo ""
echo "==> ReadLog is running."
echo "    Frontend: http://localhost:8080"
echo "    API:      http://localhost:8080/api/docs"
