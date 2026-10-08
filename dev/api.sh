#!/usr/bin/env bash
# Authenticated call to the dev HA REST API (token read from dev/.ha-token).
#
#   dev/api.sh GET  states/sensor.living_room_temperature
#   dev/api.sh POST services/input_boolean/toggle '{"entity_id":"input_boolean.aquarium_pump"}'
#   dev/api.sh POST states/sensor.fake '{"state":"unavailable"}'   # force a state (not persisted, no services)
#   dev/api.sh POST template '{"template":"{{ states(\"cover.living_room_cover\") }}"}'
set -euo pipefail
DEV="$(cd "$(dirname "$0")" && pwd)"
METHOD="${1:?method (GET|POST|DELETE)}"
PATH_="${2:?path under /api/}"
BODY="${3:-}"
args=(-sS -X "$METHOD" -H "Authorization: Bearer $(cat "$DEV/.ha-token")" -H "Content-Type: application/json")
[[ -n "$BODY" ]] && args+=(-d "$BODY")
curl "${args[@]}" "http://127.0.0.1:8123/api/$PATH_"
echo
