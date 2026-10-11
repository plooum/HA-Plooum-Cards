"""Fast UI test runner for the dev Home Assistant (headless system Chrome, Playwright).

  dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-setup-view.json [--only <substring>] [--out dev/shots] [--verbose]

Runs a whole suite in ONE browser. Each test starts on a fresh page load of its path and
viewport, then runs its steps; a failing test doesn't stop the suite. Prints one PASS / FAIL
line per test, the failing step, its message and the console errors of the test, and the total
time. Exit code 1 if a test failed or the page logged console errors.

Suite format (JSON; `//` comment lines are allowed):
  { "path": "/plooum-edit/floorplan?edit=1", "viewport": [1700, 1050],
    "tests": [ { "name": "...", "viewport": [w, h], "path": "...",
                 "steps": [
                   { "js": "<async JS body>", "print": true },       // value printed with --verbose or "print"
                   { "assert": "<JS expression or async body returning a value>", "msg": "...", "show": "<JS expr printed on failure>" },
                   { "shot": "name.png", "el": "<JS expression returning an element>" },
                   { "wait": 500 }                                    // genuine animation only; also allowed as a key of any step
                 ] } ] }

JS bodies see the helpers of dev/ui_helpers.js (window.T: deep, sleep, waitFor, pointerDrag, tap,
openEditor, editor, previewCard, dashboardCards, cancelDialog, fp.*) as plain names, plus `T`, and
`S` (= T.s, a scratch object that lives as long as the page). `await` works.
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

from ha_env import ha_token, ha_url

DEV = Path(__file__).parent
# Noise from HA itself / the headless environment, not from our cards (same list as shot.py).
IGNORED_ERRORS = ("favicon", "manifest", "service worker", "serviceworker")

# In the page: compiles and runs a step body with the helpers as local names.
RUNNER = """
window.__run = async (code, asExpr) => {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const pre = 'const {' + Object.keys(T).filter((k) => /^[A-Za-z_]+$/.test(k) && k !== 's').join(',') + '} = T; const S = T.s;\\n';
  let fn;
  if (asExpr) {
    try { fn = new AsyncFunction(pre + 'return (' + code + '\\n);'); } catch (e) { fn = null; }
  }
  if (!fn) fn = new AsyncFunction(pre + code);
  return await fn();
};
"""

READY = """
() => {
  const ha = document.querySelector('home-assistant');
  if (!(ha && ha.hass && ha.hass.connected)) return false;
  const cards = T.deep(document, '*').filter((e) => /^ha-plooum-.*-card$/.test(e.localName));
  // Every card wrapper has built its card (stacks build theirs asynchronously), and each is rendered.
  const wrappers = T.deep(document, 'hui-card');
  return cards.length > 0 && wrappers.every((w) => w._element) && cards.every((c) => c.shadowRoot && c.shadowRoot.children.length > 0);
}
"""


def strip_comments(text: str) -> str:
    return "\n".join(line for line in text.splitlines() if not re.match(r"\s*//", line))


def short(v, n=600) -> str:
    s = json.dumps(v, ensure_ascii=False, default=str)
    return s if len(s) <= n else s[:n] + "..."


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("suite")
    ap.add_argument("--only", help="run the tests whose name contains this")
    ap.add_argument("--out", default=str(DEV / "shots"))
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--url", help="HA base URL (default: this checkout's instance, see dev/ha_env.py)")
    args = ap.parse_args()

    suite = json.loads(strip_comments(Path(args.suite).read_text()))
    tests = [t for t in suite["tests"] if not args.only or args.only.lower() in t["name"].lower()]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    URL = ha_url(args.url)
    token = ha_token()
    hass_tokens = {
        "hassUrl": URL, "clientId": URL + "/", "access_token": token, "token_type": "Bearer",
        "expires_in": 315360000, "expires": int(time.time() * 1000) + 315360000 * 1000, "refresh_token": "",
    }
    helpers = (DEV / "ui_helpers.js").read_text()
    t_start = time.time()
    failed = 0
    all_errors = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(viewport={"width": 1700, "height": 1050}, color_scheme="dark", locale="en-US")
        ctx.add_init_script(f"localStorage.setItem('hassTokens', {json.dumps(json.dumps(hass_tokens))});")
        ctx.add_init_script(helpers + RUNNER)
        page = ctx.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("console", lambda m: errors.append(f"console.error: {m.text}") if m.type == "error" else None)

        for test in tests:
            t0 = time.time()
            errors.clear()
            vw, vh = test.get("viewport") or suite.get("viewport") or [1700, 1050]
            page.set_viewport_size({"width": vw, "height": vh})
            failure = None
            try:
                page.goto(URL + (test.get("path") or suite["path"]))
                page.wait_for_function(READY, timeout=20000)
            except Exception as e:  # noqa: BLE001
                failure = ("page load", f"page not ready: {str(e).splitlines()[0]}", None)
            for i, step in enumerate(test["steps"] if not failure else []):
                label = f"step {i + 1}"
                try:
                    if "wait" in step:
                        page.wait_for_timeout(step["wait"])
                    if "js" in step:
                        v = page.evaluate("([c]) => window.__run(c, false)", [step["js"]])
                        if args.verbose or step.get("print"):
                            print(f"    [{test['name']}] {label}: {short(v)}")
                    elif "assert" in step:
                        v = page.evaluate("([c]) => window.__run(c, true)", [step["assert"]])
                        if not v:
                            extra = None
                            if "show" in step:
                                extra = page.evaluate("([c]) => window.__run(c, true)", [step["show"]])
                            failure = (label, step.get("msg") or step["assert"], {"value": v, **({"show": extra} if "show" in step else {})})
                    elif "shot" in step:
                        path = str(out / step["shot"])
                        if "el" in step:
                            r = page.evaluate("([c]) => window.__run('const e = (' + c + '); const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height};', false)", [step["el"]])
                            page.screenshot(path=path, clip=r)
                        else:
                            page.screenshot(path=path)
                        if args.verbose:
                            print(f"    screenshot: {path}")
                except Exception as e:  # noqa: BLE001
                    failure = (label, str(e).splitlines()[0] if str(e) else repr(e), None)
                if failure:
                    break
            errs = [e for e in errors if not any(k in e.lower() for k in IGNORED_ERRORS)]
            all_errors += len(errs)
            dt = time.time() - t0
            if failure or errs:
                failed += 1
            print(f"{'FAIL' if failure or errs else 'PASS'}  {dt:4.1f}s  {test['name']}")
            if failure:
                print(f"      {failure[0]}: {failure[1]}")
                if failure[2] is not None:
                    print(f"      got: {short(failure[2])}")
            for e in errs:
                print(f"      console: {e[:400]}")
        browser.close()

    n = len(tests)
    print(f"\n{n - failed}/{n} passed, {failed} failed, {all_errors} console error(s), total {time.time() - t_start:.1f}s")
    return 1 if failed or all_errors else 0


if __name__ == "__main__":
    sys.exit(main())
