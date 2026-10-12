"""Headless screenshot of a page of the dev Home Assistant, with console errors.

Uses the system Google Chrome through Playwright (no browser download) and logs in
by injecting the long-lived token from dev/.ha-token into localStorage.

  dev/.venv/bin/python dev/shot.py /plooum-test/all
  dev/.venv/bin/python dev/shot.py /plooum-test/multistatus -e ha-plooum-multi-status-card -o dev/shots/ms.png
  dev/.venv/bin/python dev/shot.py /plooum-test/all --js "document.querySelector('home-assistant').hass.states['sensor.living_room_temperature'].state"
  dev/.venv/bin/python dev/shot.py /plooum-test/dpad --console HA-PLOOUM-DPAD

-e/--element crops to the first element matching a CSS selector (Playwright CSS pierces
shadow DOM, so a custom element tag works anywhere in the page). --js runs after load
and prints the JSON result. --console SUBSTR (repeatable) prints every console message of any
type containing SUBSTR (case-insensitive) as `console.<type>: <text>`, e.g. a card's version banner. Exit code 1 if the page logged errors (pageerror / console.error).
"""

import argparse
import json
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

import os
sys.path.insert(0, os.path.expanduser(os.environ.get("AGENT_BOARD_HOME", "~/.local/opt/agent-board")))
try:  # the agent board (plooum/agent-board) is optional
    import board_stream
    from board import project_of
except ImportError:
    board_stream = None
    project_of = None
from ha_env import ha_token, ha_url

DEV = Path(__file__).parent
PROJECT = project_of(DEV) if project_of else None  # the agent board groups by project
# Noise from HA itself / the headless environment, not from our cards.
IGNORED_ERRORS = ("favicon", "manifest", "service worker", "serviceworker")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path", help="page path, e.g. /plooum-test/all")
    parser.add_argument("-o", "--output", help="PNG path (default dev/shots/<path>.png)")
    parser.add_argument("-e", "--element", help="CSS selector to crop to")
    parser.add_argument("--console", action="append", default=[], help="print console messages (any type) containing this text (repeatable)")
    parser.add_argument("--js", action="append", default=[], help="JS expression to evaluate and print (repeatable)")
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=900)
    parser.add_argument("--light", action="store_true", help="light color scheme (default dark)")
    parser.add_argument("--url", help="HA base URL (default: this checkout's instance, see dev/ha_env.py)")
    parser.add_argument("--ready", help="JS predicate to wait for instead of HA being connected (e.g. \"() => window.uiResult\" on the runner page)")
    parser.add_argument("--board", default="http://127.0.0.1:8120", help="agent board URL the live frames are streamed to (plooum/agent-board); empty disables")
    parser.add_argument("--wait", type=float, default=2.0, help="extra seconds after the cards render")
    args = parser.parse_args()

    URL = ha_url(args.url)
    token = ha_token()
    hass_tokens = {
        "hassUrl": URL,
        "clientId": URL + "/",
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 315360000,
        "expires": int(time.time() * 1000) + 315360000 * 1000,
        "refresh_token": "",
    }
    output = Path(args.output or DEV / "shots" / (args.path.strip("/").replace("/", "_") or "root")).with_suffix(".png")
    output.parent.mkdir(parents=True, exist_ok=True)

    errors: list[str] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            viewport={"width": args.width, "height": args.height},
            color_scheme="light" if args.light else "dark",
            locale="en-US",
        )
        context.add_init_script(f"localStorage.setItem('hassTokens', {json.dumps(json.dumps(hass_tokens))});")
        page = context.new_page()
        args.board and board_stream and board_stream.start(page, args.board, urlparse(URL).port, PROJECT)
        page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc.name}: {exc.message}\n{exc.stack or ''}"))
        matched: list[str] = []

        def on_console(msg):
            if msg.type == "error":
                errors.append(f"console.{msg.type}: {msg.text}")
            if any(c.lower() in msg.text.lower() for c in args.console):
                matched.append(f"console.{msg.type}: {msg.text}")

        page.on("console", on_console)

        page.goto(URL + args.path)
        page.wait_for_function(args.ready or "() => document.querySelector('home-assistant')?.hass?.connected", timeout=300000 if args.ready else 30000)
        if args.element:
            page.locator(args.element).first.wait_for(state="visible", timeout=15000)
        page.wait_for_timeout(args.wait * 1000)

        for expr in args.js:
            print(f"js> {expr}\n{json.dumps(page.evaluate(expr), ensure_ascii=False, indent=2)}")

        target = page.locator(args.element).first if args.element else page
        target.screenshot(path=str(output))
        browser.close()

    for line in matched:
        print(line)
    print(f"screenshot: {output}")
    errors = [e for e in errors if not any(k in e.lower() for k in IGNORED_ERRORS)]
    for err in errors:
        print(err, file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
