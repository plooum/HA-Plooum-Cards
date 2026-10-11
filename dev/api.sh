#!/usr/bin/env bash
# Authenticated call to the dev HA REST API of this checkout (token read from dev/.ha-token,
# URL from HA_URL, else dev/.ha-port, else 8123 — same rule as dev/ha_env.py).
#
#   dev/api.sh GET  states/sensor.living_room_temperature
#   dev/api.sh POST services/input_boolean/toggle '{"entity_id":"input_boolean.aquarium_pump"}'
#   dev/api.sh POST states/sensor.fake '{"state":"unavailable"}'   # force a state (not persisted, no services)
#   dev/api.sh POST template '{"template":"{{ states(\"cover.living_room_cover\") }}"}'
set -euo pipefail
DEV="$(cd "$(dirname "$0")" && pwd)"
PORT="$(cat "$DEV/.ha-port" 2>/dev/null || true)"
URL="${HA_URL:-http://127.0.0.1:${PORT:-8123}}"
METHOD="${1:?method (GET|POST|DELETE)}"
PATH_="${2:?path under /api/}"
BODY="${3:-}"
args=(-sS -X "$METHOD" -H "Authorization: Bearer $(cat "$DEV/.ha-token")" -H "Content-Type: application/json")
[[ -n "$BODY" ]] && args+=(-d "$BODY")
curl "${args[@]}" "${URL%/}/api/$PATH_"
echo
