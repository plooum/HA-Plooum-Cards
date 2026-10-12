"""Fast UI test runner for the dev Home Assistant (headless system Chrome, Playwright).

  dev/.venv/bin/python dev/ui_test.py dev/tests/floorplan-setup-view.json [--only <substring>] [--out dev/shots] [--verbose]

Runs a whole suite in ONE browser, through dev/ui_runner.js (the same step runner as the live page
runner.html, which the built-in browser pane can open: see the ha-dev-testing skill). Each test starts on a fresh page load of its path and
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
                 ],
                 "finally": [ <steps that always run after "steps", even after a failure: state restores> ] } ] }

JS bodies see the helpers of dev/ui_helpers.js (window.T: deep, sleep, waitFor, pointerDrag, tap,
openEditor, editor, previewCard, dashboardCards, cancelDialog, fp.*) as plain names, plus `T`, and
`S` (= T.s, a scratch object that lives as long as the page). `await` works.
"""

import argparse
import json
import re
import sys
import time
import urllib.request
import uuid
from pathlib import Path
from urllib.parse import quote, urlparse

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools" / "agent-board"))
import board_stream
from board import project_of
from ha_env import ha_token, ha_url

DEV = Path(__file__).parent
PROJECT = project_of(DEV)  # the agent board groups by project

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
    ap.add_argument("--board", default="http://127.0.0.1:8120", help="agent board URL the run is reported to and streamed to (tools/agent-board); empty disables both")
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
    # One run id for the whole suite: each per-test page reports its tests under it (dev/ui_runner.js),
    # this script posts the run's start and end to the agent board (fire and forget).
    run_id = uuid.uuid4().hex[:8]
    board = args.board.rstrip("/")

    def report(kind, **data):
        if not board:
            return
        body = {"kind": kind, "run": run_id, "port": urlparse(URL).port, "project": PROJECT, "source": "headless", **data}
        try:
            urllib.request.urlopen(urllib.request.Request(board + "/api/events", json.dumps(body).encode(), {"Content-Type": "application/json"}), timeout=1).read()
        except Exception:
            pass

    stem = Path(args.suite).stem
    report("run-start", suite=stem, total=len(tests))
    t_start = time.time()
    failed = 0
    all_errors = 0
    stem = Path(args.suite).stem
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(viewport={"width": 1700, "height": 1050}, color_scheme="dark", locale="en-US")
        ctx.add_init_script(f"localStorage.setItem('hassTokens', {json.dumps(json.dumps(hass_tokens))});")
        page = ctx.new_page()
        board and board_stream.start(page, board, urlparse(URL).port, PROJECT)  # read-only live view on the agent board

        # Groups of consecutive tests (same_page, same viewport) share one runner page: index=3,4,5.
        groups = []
        prev_index = None
        for index, test in enumerate(suite["tests"]):
            if test not in tests:
                continue
            vp = test.get("viewport") or suite.get("viewport") or [1700, 1050]
            if groups and test.get("same_page") and prev_index == index - 1 and groups[-1]["vp"] == vp:
                groups[-1]["items"].append((index, test))
            else:
                groups.append({"vp": vp, "items": [(index, test)]})
            prev_index = index

        for group in groups:
            vw, vh = group["vp"]
            page.set_viewport_size({"width": vw, "height": vh})
            idx = ",".join(str(i) for i, _ in group["items"])
            # The steps run in dev/ui_runner.js (the same code as the live runner page).
            page.goto(f"{URL}/plooum_dev/runner.html?suite={stem}&headless=1&index={idx}&run={run_id}&board={board}&project={quote(PROJECT or "")}{'&verbose=1' if args.verbose else ''}")
            while True:
                page.wait_for_function("() => window.uiResult || window.uiShot", timeout=600000)
                shot = page.evaluate("() => window.uiShot")
                if not shot:
                    break
                path = str(out / shot["name"])
                r = shot["rect"]
                page.screenshot(path=path, clip=r) if r else page.screenshot(path=path)
                if args.verbose:
                    print(f"    screenshot: {path}")
                page.evaluate("() => { window.uiShot = null; window.uiShotResolve(); }")
            for (index, test), res in zip(group["items"], page.evaluate("() => window.uiResult")["tests"]):
                board and board_stream.shot(page, board, urlparse(URL).port, run_id, test["name"], PROJECT)
                for pr in res["prints"]:
                    print(f"    [{test['name']}] {pr}")
                errs = res["errors"]
                all_errors += len(errs)
                if not res["ok"]:
                    failed += 1
                print(f"{'PASS' if res['ok'] else 'FAIL'}  {res['seconds']:4.1f}s  {test['name']}")
                if res["message"]:
                    print(f"      {res['failedStep']}: {res['message']}")
                    if res["got"] is not None:
                        print(f"      got: {short(res['got'])}")
                for e in errs:
                    print(f"      console: {e[:400]}")
        time.sleep(0.1)  # let the last shot posts leave
        browser.close()

    n = len(tests)
    summary = f"{n - failed}/{n} passed, {failed} failed, {all_errors} console error(s), total {time.time() - t_start:.1f}s"
    print(f"\n{summary}")
    report("run-end", summary=summary, passed=n - failed, failed=failed)
    return 1 if failed or all_errors else 0


if __name__ == "__main__":
    sys.exit(main())
