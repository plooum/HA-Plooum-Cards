"""Scripted checks in the dev Home Assistant's card editor dialog (headless Chrome, Playwright).

Opens a dashboard, runs JS steps (they can open the card editor dialog, select things in the
editor, act on the preview card), and takes screenshots of the page or of one element.

  dev/.venv/bin/python .claude/skills/ha-dev-testing/editor_shot.py steps.json [--width 1700 --height 1050] [--path /plooum-edit/floorplan?edit=1] [--out dev/shots]

steps.json is a list of steps, run in order:
  {"js": "<async JS body>"}            run it, print its return value (JSON)
  {"shot": "name.png"}                 screenshot of the page
  {"shot": "name.png", "el": "<JS expression>"}   screenshot cropped to that element
  {"wait": 1500}                       optional on any step: ms to wait before it (shots default to 1200)

Every JS body gets these helpers:
  deep(root, selector)  every element matching selector, through shadow roots (one simple selector:
                        a descendant combinator doesn't cross shadow roots)
  sleep(ms)
  openEditor(stackIndex)  opens the first card's editor ("Edit" button) and, if it is a stack, its
                        card number stackIndex (0-based); sets window.__ed to the card's editor
  previewCard(title)    the card element with this title inside the editor dialog's preview
Exit code 1 if the page logged errors.
"""

import argparse
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8123"
DEV = Path(__file__).resolve().parents[3] / "dev"
IGNORED = ("favicon", "manifest", "service worker", "serviceworker")
HELPERS = """
function deep(root, sel, out = []) {
  root.querySelectorAll('*').forEach((e) => { if (e.matches(sel)) out.push(e); if (e.shadowRoot) deep(e.shadowRoot, sel, out); });
  return out;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function openEditor(stackIndex = null) {
  deep(document, 'ha-button').find((b) => ['Edit', 'Modifier'].includes(b.textContent.trim())).click();
  await sleep(2500);
  if (stackIndex !== null) {
    const stack = deep(document, 'hui-stack-card-editor')[0];
    stack._selectedCard = stackIndex;
    stack.requestUpdate();
    await sleep(1500);
  }
  const dlg = deep(document, 'hui-dialog-edit-card')[0];
  window.__ed = deep(dlg.shadowRoot, '*').find((e) => e.tagName.startsWith('HA-PLOOUM') && e.tagName.endsWith('-CARD-EDITOR')) || null;
  return window.__ed && window.__ed.tagName;
}
function previewCard(title) {
  const dlg = deep(document, 'hui-dialog-edit-card')[0];
  return deep(dlg.shadowRoot, '*').find((e) => e.tagName.startsWith('HA-PLOOUM') && !e.tagName.endsWith('-EDITOR') && e.config && e.config.title === title);
}
"""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("steps")
    ap.add_argument("--path", default="/plooum-edit/floorplan?edit=1")
    ap.add_argument("--out", default=str(DEV / "shots"))
    ap.add_argument("--width", type=int, default=1700)
    ap.add_argument("--height", type=int, default=1050)
    args = ap.parse_args()
    steps = json.loads(Path(args.steps).read_text())
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    token = (DEV / ".ha-token").read_text().strip()
    tokens = {
        "hassUrl": URL, "clientId": URL + "/", "access_token": token, "token_type": "Bearer",
        "expires_in": 315360000, "expires": int(time.time() * 1000) + 315360000 * 1000, "refresh_token": "",
    }
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(viewport={"width": args.width, "height": args.height}, color_scheme="dark", locale="en-US")
        ctx.add_init_script(f"localStorage.setItem('hassTokens', {json.dumps(json.dumps(tokens))});")
        page = ctx.new_page()
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: errors.append(f"console.error: {m.text}") if m.type == "error" else None)
        page.goto(URL + args.path)
        page.wait_for_function("() => document.querySelector('home-assistant')?.hass?.connected")
        page.wait_for_timeout(3000)
        for s in steps:
            page.wait_for_timeout(s.get("wait", 1200 if "shot" in s else 0))
            if "js" in s:
                print(json.dumps(page.evaluate("async () => {" + HELPERS + s["js"] + "}"), ensure_ascii=False)[:4000])
            if "shot" in s:
                path = str(out / s["shot"])
                if "el" in s:
                    r = page.evaluate("async () => {" + HELPERS + "return (" + s["el"] + ").getBoundingClientRect().toJSON(); }")
                    page.screenshot(path=path, clip={k: r[k] for k in ("x", "y", "width", "height")})
                else:
                    page.screenshot(path=path)
                print("screenshot:", path)
        browser.close()
    errors = [e for e in errors if not any(k in e.lower() for k in IGNORED)]
    for e in errors:
        print(e, file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
