#!/bin/sh
# Backend container entrypoint:
#   1. Wait for the database to accept connections.
#   2. Apply migrations (idempotent).
#   3. Collect static files into the volume nginx serves.
#   4. Hand off to the main process (gunicorn / dev server).
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

echo ">> Waiting for database at ${DB_HOST}:${DB_PORT}..."
python - <<PYEOF
import os, socket, time, sys
host = os.environ.get("DB_HOST", "db")
port = int(os.environ.get("DB_PORT", "5432"))
deadline = time.time() + 60
while time.time() < deadline:
    try:
        with socket.create_connection((host, port), timeout=2):
            print(f">> Database is up at {host}:{port}")
            sys.exit(0)
    except OSError:
        time.sleep(1)
print(f">> Timed out waiting for database at {host}:{port}", file=sys.stderr)
sys.exit(1)
PYEOF

echo ">> Generating any missing migrations..."
python manage.py makemigrations --noinput

echo ">> Applying migrations..."
python manage.py migrate --noinput

echo ">> Collecting static files..."
python manage.py collectstatic --noinput

# Copy collected static into the shared volume mounted at /backend_static so
# nginx (which mounts the same volume at /static/) can serve admin/drf-yasg assets.
#
# IMPORTANT: nginx serves everything under `location /` with `alias /static/`,
# which means a request like `/static/drf-yasg/foo.css` is resolved against the
# filesystem path `/static/static/drf-yasg/foo.css`. We therefore copy backend
# static files into a nested `static/` subdirectory of the shared volume so
# they end up at `/static/static/...` for the gateway. The frontend CRA build,
# which already nests its assets under `static/`, lands in the same place.
# This is the standard kittygram dual-static convention.
#
# We use cp (not --clear) so we don't wipe the React frontend that also lives
# in the same shared volume.
if [ -d /backend_static ]; then
    echo ">> Syncing static files into shared volume..."
    mkdir -p /backend_static/static
    cp -r collected_static/. /backend_static/static/ || true
fi

echo ">> Starting: $@"
exec "$@"
