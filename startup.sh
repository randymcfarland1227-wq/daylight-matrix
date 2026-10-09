#!/bin/sh
set -e
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >/tmp/daylight-dev.log 2>&1 &
