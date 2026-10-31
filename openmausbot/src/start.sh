#!/bin/sh
set -eu

cd "$(dirname "$0")"
ROOT="$(pwd)"
export HOME="${HOME:-/app}"
export OMB_DATA_DIR="$HOME/.openmausbot"
export NODE_ENV=production
export PATH="$ROOT/node_modules/.bin:$PATH"
export DISABLE_AUTOUPDATER=1
# Keeps the source-available enterprise folder shipped in the npm package out of the process: open-source edition only.
export OMB_ENTERPRISE_DIR="$ROOT/.no-enterprise"

# The server listens only on 127.0.0.1; bind.cjs moves it to 0.0.0.0 so the platform can reach port 80.
export OMB_PORT="${PORT:-80}"
export NODE_OPTIONS="--require $ROOT/bind.cjs ${NODE_OPTIONS:-}"

# A restart kills the server without releasing its lease, and the old PID is alive again in the new container: the server would refuse to start.
rm -f "$OMB_DATA_DIR/openmausbot-server.lease" "$OMB_DATA_DIR/.openmausbot-server-child/openmausbot-server.lease"

set -- --port "$OMB_PORT"
[ -n "${PUBLIC_ORIGIN:-}" ] && set -- "$@" --public-url "$PUBLIC_ORIGIN"

# Prints a single-use pairing code (5 min) in the log on every start.
exec openmausbot serve "$@"
