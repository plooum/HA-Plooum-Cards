#!/usr/bin/env bash
# Local development Home Assistant to test the cards.
#
#   dev/ha.sh install   # Python 3.14 venv (uv) + homeassistant + playwright
#   dev/ha.sh start     # starts HA in the background, waits for it; onboarding + token on first run
#   dev/ha.sh stop | restart | status | logs
#   dev/ha.sh reset     # stops HA and wipes its runtime state (.storage, db, deps) — keeps the versioned config
#
# HA listens on http://127.0.0.1:8123; the test dashboard is /plooum-test/<view>.
set -euo pipefail

DEV="$(cd "$(dirname "$0")" && pwd)"
VENV="$DEV/.venv"
CONF="$DEV/ha-config"
PIDFILE="$DEV/.ha.pid"
LOG="$DEV/ha.log"
URL="http://127.0.0.1:8123"

is_running() {
  [[ -f "$PIDFILE" ]] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null
}

wait_up() {
  for _ in $(seq 1 180); do
    if curl -sf -o /dev/null "$URL/manifest.json"; then return 0; fi
    if ! is_running; then echo "HA exited — see $LOG" >&2; tail -30 "$LOG" >&2; return 1; fi
    sleep 1
  done
  echo "HA not responding after 180 s — see $LOG" >&2
  return 1
}

cmd_install() {
  uv venv --allow-existing --python 3.14 "$VENV"
  uv pip install --python "$VENV/bin/python" --upgrade homeassistant playwright
}

# Stored HTTP config (HA 2026+ no longer reads it from YAML): listen locally only.
seed_http_store() {
  [[ -f "$CONF/.storage/http" ]] && return 0
  mkdir -p "$CONF/.storage"
  cat > "$CONF/.storage/http" <<'JSON'
{
  "version": 2,
  "minor_version": 2,
  "key": "http",
  "data": {
    "stable": {
      "server_host": ["127.0.0.1"],
      "server_port": 8123,
      "cors_allowed_origins": ["https://cast.home-assistant.io"],
      "login_attempts_threshold": -1,
      "ip_ban_enabled": true,
      "ssl_profile": "modern",
      "use_x_frame_options": true,
      "created_at": "2026-01-01T00:00:00+00:00",
      "error": null,
      "error_message": null
    },
    "pending": null,
    "yaml_migration_done": true
  }
}
JSON
}

cmd_start() {
  if is_running; then echo "HA already running (pid $(cat "$PIDFILE"))"; return 0; fi
  [[ -x "$VENV/bin/hass" ]] || cmd_install
  seed_http_store
  nohup "$VENV/bin/hass" -c "$CONF" --log-file "$LOG" >/dev/null 2>&1 &
  echo $! > "$PIDFILE"
  echo "HA starting (pid $!)…"
  wait_up
  "$VENV/bin/python" "$DEV/bootstrap.py"
  echo "Ready: $URL/plooum-test/all"
}

cmd_stop() {
  if ! is_running; then echo "HA is not running"; rm -f "$PIDFILE"; return 0; fi
  local pid; pid="$(cat "$PIDFILE")"
  kill "$pid"
  for _ in $(seq 1 30); do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
  kill -0 "$pid" 2>/dev/null && kill -9 "$pid"
  rm -f "$PIDFILE"
  echo "HA stopped"
}

cmd_status() {
  if is_running; then echo "HA running (pid $(cat "$PIDFILE")) — $URL"; else echo "HA is not running"; fi
}

cmd_reset() {
  cmd_stop
  # Only removes git-ignored files under ha-config (HA runtime state).
  git -C "$DEV/.." clean -fdX -- dev/ha-config
  rm -f "$DEV/.ha-token" "$LOG"*
  echo "Runtime state wiped — next start will onboard again"
}

case "${1:-}" in
  install) cmd_install ;;
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status) cmd_status ;;
  logs) tail -n "${2:-50}" "$LOG" ;;
  reset) cmd_reset ;;
  *) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
