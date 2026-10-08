"""Dev-only integration for HA-Plooum-Cards.

Serves the compiled bundle (and its sourcemap) straight from the repo root with
`Cache-Control: no-store`; configuration.yaml declares it as a Lovelace resource.
After `npm run build`, a plain page reload picks up the new code — no copy into
`www/`, no resource version bump, no browser cache to fight.
"""

from pathlib import Path
import logging

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

DOMAIN = "plooum_dev"
BASE_URL = "/plooum_dev"
FILES = {
    "ha-plooum-cards.js": "application/javascript",
    "ha-plooum-cards.js.map": "application/json",
}

_LOGGER = logging.getLogger(__name__)


class BundleView(HomeAssistantView):
    """Serve the repo build output without caching."""

    url = BASE_URL + "/{filename}"
    name = "plooum_dev:bundle"
    requires_auth = False

    def __init__(self, hass: HomeAssistant, repo_root: Path) -> None:
        self._hass = hass
        self._root = repo_root

    async def get(self, request: web.Request, filename: str) -> web.Response:
        if filename not in FILES:
            raise web.HTTPNotFound
        path = self._root / filename
        try:
            body = await self._hass.async_add_executor_job(path.read_bytes)
        except FileNotFoundError as err:
            raise web.HTTPNotFound from err
        return web.Response(
            body=body,
            content_type=FILES[filename],
            headers={"Cache-Control": "no-store"},
        )


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    conf = config.get(DOMAIN) or {}
    repo_root = Path(hass.config.path(conf.get("repo_root", "../.."))).resolve()
    hass.http.register_view(BundleView(hass, repo_root))
    _LOGGER.info("Serving %s/ha-plooum-cards.js at %s", repo_root, BASE_URL)
    return True
