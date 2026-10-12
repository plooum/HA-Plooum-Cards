#!/usr/bin/env bash
# Local development Home Assistant to test the cards.
#
#   dev/ha.sh install   # Python 3.14 venv (uv) + homeassistant + playwright (in the MAIN checkout, shared by worktrees)
#   dev/ha.sh setup     # worktree only: link the main checkout's node_modules (start does it)
#   dev/ha.sh start     # starts HA in the background, waits for it; onboarding + token on first run
#   dev/ha.sh stop | restart | status | logs
#   dev/ha.sh list      # every running dev instance of this machine: port, pid, checkout
#   dev/ha.sh reset     # stops HA and wipes its runtime state (.storage, db, deps) — keeps the versioned config
#
# One instance per checkout. The main checkout listens on http://127.0.0.1:8123; a git worktree
# takes the first free port from 8124 (kept in dev/.ha-port); HA_PORT=<n> forces one.
# The test dashboard is /plooum-test/<view>.
set -euo pipefail

DEV="$(cd "$(dirname "$0")" && pwd)"
CONF="$DEV/ha-config"
PIDFILE="$DEV/.ha.pid"
PORTFILE="$DEV/.ha-port"
LOG="$DEV/ha.log"

# Main checkout vs git worktree. The venv is installed once, in the main checkout.
GIT_DIR="$(git -C "$DEV" rev-parse --absolute-git-dir)"
COMMON_DIR="$(git -C "$DEV" rev-parse --path-format=absolute --git-common-dir)"
MAIN="$(dirname "$COMMON_DIR")"
IS_WORKTREE=false; [[ "$GIT_DIR" != "$COMMON_DIR" ]] && IS_WORKTREE=true
VENV="$MAIN/dev/.venv"

# Port: HA_PORT, else dev/.ha-port, else 8123 (same rule as dev/ha_env.py).
PORT="${HA_PORT:-$(cat "$PORTFILE" 2>/dev/null || true)}"; PORT="${PORT:-8123}"
URL="http://127.0.0.1:$PORT"
export HA_URL="$URL"  # for bootstrap.py

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

port_in_use() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

# Checkouts (main + worktrees) whose instance is running, as "path".
running_checkouts() {
  git -C "$MAIN" worktree list --porcelain | sed -n 's/^worktree //p' | while read -r wt; do
    if [[ -f "$wt/dev/.ha.pid" ]] && kill -0 "$(cat "$wt/dev/.ha.pid")" 2>/dev/null; then echo "$wt"; fi
  done
}

port_of() { cat "$1/dev/.ha-port" 2>/dev/null || echo 8123; }

# Worktree: keep dev/.ha-port while it is still free, else the first free port from 8124 up
# (not listening, not the port of another running instance).
pick_port() {
  if [[ -n "${HA_PORT:-}" ]]; then echo "$HA_PORT" > "$PORTFILE"; return; fi
  $IS_WORKTREE || return 0
  local taken; taken=" $(running_checkouts | while read -r wt; do port_of "$wt"; done | tr '\n' ' ') "
  local p
  for p in $(cat "$PORTFILE" 2>/dev/null) $(seq 8124 8223); do
    if ! port_in_use "$p" && [[ "$taken" != *" $p "* ]]; then PORT="$p"; break; fi
  done
  echo "$PORT" > "$PORTFILE"
  URL="http://127.0.0.1:$PORT"; export HA_URL="$URL"
}

# A worktree has neither venv nor node_modules of its own: link the main checkout's, so that
# `dev/.venv/bin/python dev/ui_test.py ...` and `npm run build` work there unchanged.
cmd_setup() {
  $IS_WORKTREE || { echo "Main checkout: nothing to set up (npm install, dev/ha.sh start)"; return 0; }
  if [[ ! -e "$DEV/.venv" && -x "$VENV/bin/python" ]]; then
    ln -s "$VENV" "$DEV/.venv"
    echo "dev/.venv linked to $VENV"
  fi
  if [[ ! -e "$DEV/../node_modules" ]]; then
    [[ -d "$MAIN/node_modules" ]] || { echo "No node_modules in $MAIN: run npm install there first" >&2; return 1; }
    ln -s "$MAIN/node_modules" "$DEV/../node_modules"
    echo "node_modules linked to $MAIN/node_modules"
  fi
}

# Stored HTTP config (HA 2026+ no longer reads it from YAML): listen locally only, on $PORT.
seed_http_store() {
  mkdir -p "$CONF/.storage"
  if [[ -f "$CONF/.storage/http" ]]; then
    sed -i "s/\"server_port\": [0-9]*/\"server_port\": $PORT/" "$CONF/.storage/http"
    return 0
  fi
  cat > "$CONF/.storage/http" <<JSON
{
  "version": 2,
  "minor_version": 2,
  "key": "http",
  "data": {
    "stable": {
      "server_host": ["127.0.0.1"],
      "server_port": $PORT,
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
  if is_running; then echo "HA already running (pid $(cat "$PIDFILE")) — $URL"; return 0; fi
  [[ -x "$VENV/bin/hass" ]] || cmd_install
  cmd_setup
  local t0=$SECONDS
  # Port choice and launch under one lock, so two worktrees starting together don't pick the same port.
  (
    flock 9
    pick_port
    seed_http_store
    nohup "$VENV/bin/hass" -c "$CONF" --log-file "$LOG" >/dev/null 2>&1 9>&- &
    echo $! > "$PIDFILE"
  ) 9>"$COMMON_DIR/plooum-dev-ports.lock"
  PORT="$(cat "$PORTFILE" 2>/dev/null || echo "$PORT")"; URL="http://127.0.0.1:$PORT"; export HA_URL="$URL"
  echo "HA starting (pid $(cat "$PIDFILE"), port $PORT)…"
  wait_up
  "$VENV/bin/python" "$DEV/bootstrap.py"
  # Tell the agent board (tools/agent-board, silent if it isn't running) which agent owns this port: sub-agent worktrees only, the main checkout is the pilot's.
  [[ "$DEV" == */.claude/worktrees/* ]] && { python3 "$DEV/../tools/agent-board/board.py" agent "$(basename "$(dirname "$DEV")")" --port "$PORT" --checkout "$(dirname "$DEV")" || true; }
  echo "Ready in $((SECONDS - t0)) s: $URL/plooum-test/all"
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
  if is_running; then echo "HA running (pid $(cat "$PIDFILE")) — $URL"; else echo "HA is not running ($URL when started)"; fi
}

# Every running dev instance of this machine: the main checkout and each git worktree keep their own pid file.
cmd_list() {
  printf '%-6s %-8s %s\n' PORT PID CHECKOUT
  running_checkouts | while read -r wt; do
    printf '%-6s %-8s %s\n' "$(port_of "$wt")" "$(cat "$wt/dev/.ha.pid")" "$wt"
  done
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
  list) cmd_list ;;
  setup) cmd_setup ;;
  reset) cmd_reset ;;
  *) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
