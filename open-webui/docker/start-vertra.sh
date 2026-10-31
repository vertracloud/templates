#!/bin/sh
# The app volume starts empty and Open WebUI does not create its data folder.
set -eu
mkdir -p "${DATA_DIR:-/app/data}"
cd /opt/open-webui/backend
exec bash start.sh "$@"
