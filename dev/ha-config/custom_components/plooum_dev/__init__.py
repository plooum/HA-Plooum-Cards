"""Dev-only integration for HA-Plooum-Cards.

Serves the compiled bundle (and its sourcemap) straight from the repo root with
`Cache-Control: no-store`; configuration.yaml declares it as a Lovelace resource.
After `npm run build`, a plain page reload picks up the new code — no copy into
`www/`, no resource version bump, no browser cache to fight.

Also serves the live UI test runner (dev/runner.html, dev/ui_runner.js) with the helpers
(dev/ui_helpers.js) and the suites (dev/tests/<name>.json), read-only and no-store: only those
paths, nothing else of dev/.

Also sets up fake cameras (camera.py) for the floorplan card's 3D view.
"""

from pathlib import Path
import logging
import re

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import discovery
from homeassistant.helpers.typing import ConfigType

DOMAIN = "plooum_dev"
BASE_URL = "/plooum_dev"
# Served name -> (path relative to the repo root, content type).
FILES = {
    "ha-plooum-cards.js": ("ha-plooum-cards.js", "application/javascript"),
    "ha-plooum-cards.js.map": ("ha-plooum-cards.js.map", "application/json"),
    "runner.html": ("dev/runner.html", "text/html"),
    "ui_runner.js": ("dev/ui_runner.js", "application/javascript"),
    "ui_helpers.js": ("dev/ui_helpers.js", "application/javascript"),
}
SUITE_RE = re.compile(r"^[A-Za-z0-9_-]+$")

_LOGGER = logging.getLogger(__name__)


async def _serve(hass: HomeAssistant, path: Path, content_type: str) -> web.Response:
    try:
        body = await hass.async_add_executor_job(path.read_bytes)
    except FileNotFoundError as err:
        raise web.HTTPNotFound from err
    return web.Response(
        body=body,
        content_type=content_type,
        headers={"Cache-Control": "no-store"},
    )


class BundleView(HomeAssistantView):
    """Serve the repo build output and the test runner files without caching."""

    url = BASE_URL + "/{filename}"
    name = "plooum_dev:bundle"
    requires_auth = False

    def __init__(self, hass: HomeAssistant, repo_root: Path) -> None:
        self._hass = hass
        self._root = repo_root

    async def get(self, request: web.Request, filename: str) -> web.Response:
        if filename not in FILES:
            raise web.HTTPNotFound
        rel, content_type = FILES[filename]
        return await _serve(self._hass, self._root / rel, content_type)


class SuiteView(HomeAssistantView):
    """Serve dev/tests/<name>.json (names restricted to [A-Za-z0-9_-])."""

    url = BASE_URL + "/tests/{suite}.json"
    name = "plooum_dev:suite"
    requires_auth = False

    def __init__(self, hass: HomeAssistant, repo_root: Path) -> None:
        self._hass = hass
        self._root = repo_root

    async def get(self, request: web.Request, suite: str) -> web.Response:
        if not SUITE_RE.match(suite):
            raise web.HTTPNotFound
        return await _serve(self._hass, self._root / "dev" / "tests" / f"{suite}.json", "application/json")


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    conf = config.get(DOMAIN) or {}
    repo_root = Path(hass.config.path(conf.get("repo_root", "../.."))).resolve()
    hass.http.register_view(BundleView(hass, repo_root))
    hass.http.register_view(SuiteView(hass, repo_root))
    _LOGGER.info("Serving %s/ha-plooum-cards.js at %s", repo_root, BASE_URL)
    hass.async_create_task(discovery.async_load_platform(hass, "camera", DOMAIN, {}, config))
    return True
