"""Headless screenshot of a page of the dev Home Assistant, with console errors.

Uses the system Google Chrome through Playwright (no browser download) and logs in
by injecting the long-lived token from dev/.ha-token into localStorage.

  dev/.venv/bin/python dev/shot.py /plooum-test/all
  dev/.venv/bin/python dev/shot.py /plooum-test/multistatus -e ha-plooum-multi-status-card -o dev/shots/ms.png
  dev/.venv/bin/python dev/shot.py /plooum-test/all --js "document.querySelector('home-assistant').hass.states['sensor.living_room_temperature'].state"

-e/--element crops to the first element matching a CSS selector (Playwright CSS pierces
shadow DOM, so a custom element tag works anywhere in the page). --js runs after load
and prints the JSON result. Exit code 1 if the page logged errors (pageerror / console.error).
"""

import argparse
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8123"
DEV = Path(__file__).parent
# Noise from HA itself / the headless environment, not from our cards.
IGNORED_ERRORS = ("favicon", "manifest", "service worker", "serviceworker")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("path", help="page path, e.g. /plooum-test/all")
    parser.add_argument("-o", "--output", help="PNG path (default dev/shots/<path>.png)")
    parser.add_argument("-e", "--element", help="CSS selector to crop to")
    parser.add_argument("--js", action="append", default=[], help="JS expression to evaluate and print (repeatable)")
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=900)
    parser.add_argument("--light", action="store_true", help="light color scheme (default dark)")
    parser.add_argument("--wait", type=float, default=2.0, help="extra seconds after the cards render")
    args = parser.parse_args()

    token = (DEV / ".ha-token").read_text().strip()
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
        page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc.name}: {exc.message}\n{exc.stack or ''}"))
        page.on(
            "console",
            lambda msg: errors.append(f"console.{msg.type}: {msg.text}") if msg.type == "error" else None,
        )

        page.goto(URL + args.path)
        page.wait_for_function("() => document.querySelector('home-assistant')?.hass?.connected")
        if args.element:
            page.locator(args.element).first.wait_for(state="visible", timeout=15000)
        page.wait_for_timeout(args.wait * 1000)

        for expr in args.js:
            print(f"js> {expr}\n{json.dumps(page.evaluate(expr), ensure_ascii=False, indent=2)}")

        target = page.locator(args.element).first if args.element else page
        target.screenshot(path=str(output))
        browser.close()

    print(f"screenshot: {output}")
    errors = [e for e in errors if not any(k in e.lower() for k in IGNORED_ERRORS)]
    for err in errors:
        print(err, file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
