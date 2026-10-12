"""Streams a headless Chrome (Playwright page) to the agent board (tools/agent-board), read-only.

start(page, board_url, port): CDP screencast, only the latest frame is posted (a background thread drops older ones).
shot(page, board_url, port, run, name): posts one JPEG screenshot as a finished test's picture.
Everything is fire and forget: a board that is down never slows or fails the caller.
"""
import base64
import threading
import time
import urllib.request
from urllib.parse import urlencode


def _post(url, data, timeout=0.5):
    try:
        urllib.request.urlopen(urllib.request.Request(url, data, {"Content-Type": "image/jpeg"}), timeout=timeout).read()
        return True
    except Exception:
        return False


class _Poster(threading.Thread):
    def __init__(self, url):
        super().__init__(daemon=True)
        self.url, self.latest, self.cv, self.down_until = url, None, threading.Condition(), 0.0

    def push(self, jpeg):
        with self.cv:
            self.latest = jpeg  # an older unsent frame is dropped
            self.cv.notify()

    def run(self):
        while True:
            with self.cv:
                while self.latest is None:
                    self.cv.wait()
                jpeg, self.latest = self.latest, None
            if time.time() < self.down_until:
                continue
            if not _post(self.url, jpeg):
                self.down_until = time.time() + 5  # board down: stop trying for a few seconds


def start(page, board_url, port):
    """Starts the screencast of `page` (it survives page loads in the same tab)."""
    try:
        poster = _Poster(f"{board_url.rstrip('/')}/api/frame?{urlencode({'port': port})}")
        poster.start()
        cdp = page.context.new_cdp_session(page)

        def on_frame(ev):
            try:
                cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]})
            except Exception:
                pass
            poster.push(base64.b64decode(ev["data"]))

        cdp.on("Page.screencastFrame", on_frame)
        cdp.send("Page.startScreencast", {"format": "jpeg", "quality": 60, "maxWidth": 1280, "maxHeight": 900})
    except Exception:
        pass


def shot(page, board_url, port, run, name):
    try:
        jpeg = page.screenshot(type="jpeg", quality=70)
    except Exception:
        return
    q = urlencode({"port": port, "run": run, "name": name})
    threading.Thread(target=_post, args=(f"{board_url.rstrip('/')}/api/shots?{q}", jpeg, 2), daemon=True).start()
