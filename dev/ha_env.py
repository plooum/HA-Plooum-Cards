"""Which dev Home Assistant do the tools talk to? One answer for every Python tool of dev/.

Each checkout (the main one or a git worktree) has its own instance, so the URL and the token
come from the checkout the script lives in:
  --url / HA_URL  >  dev/.ha-port (written by dev/ha.sh start)  >  8123 (the main checkout)
The shell scripts (ha.sh, api.sh) hold the same few lines.
"""

import os
from pathlib import Path

DEV = Path(__file__).resolve().parent
DEFAULT_PORT = 8123


def ha_url(override: str | None = None) -> str:
    url = override or os.environ.get("HA_URL")
    if url:
        return url.rstrip("/")
    port_file = DEV / ".ha-port"
    port = port_file.read_text().strip() if port_file.exists() else ""
    return f"http://127.0.0.1:{port or DEFAULT_PORT}"


def ha_token() -> str:
    return (DEV / ".ha-token").read_text().strip()
