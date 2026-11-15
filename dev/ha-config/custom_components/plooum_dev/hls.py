"""Live HLS streams for the camera card: ffmpeg makes them while Home Assistant runs, plooum_dev
serves them on /plooum_dev/hls/<name>.m3u8, and the porch cameras (camera.py) use them as their
stream_source, through Home Assistant's stream integration like a real RTSP camera.

    hd     1280x720, "Porch HD" and the time on a test pattern
    sd     480x270, "Porch SD" and the time
    black  640x360, all black (a camera that streams black)

Files go to <config>/hls (runtime state, gitignored). Without ffmpeg, the streams stay missing
and the porch cameras fail like a camera whose stream doesn't answer.
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
import re
import shutil

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import Event, HomeAssistant

_LOGGER = logging.getLogger(__name__)
NAME_RE = re.compile(r"^[a-z]+(?:\.m3u8|\d*\.ts)$")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def hls_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.path("hls"))


def stream_url(hass: HomeAssistant, name: str) -> str:
    return f"http://127.0.0.1:{hass.config.api.port}/plooum_dev/hls/{name}.m3u8"


def _label(text: str, size: int) -> str:
    font = f"fontfile={FONT}:" if Path(FONT).exists() else ""
    return (
        f"drawtext={font}text='{text} %{{localtime\\:%X}}':x=20:y=20:fontsize={size}"
        ":fontcolor=white:box=1:boxcolor=black@0.6"
    )


async def async_start(hass: HomeAssistant) -> None:
    hass.http.register_view(HlsView(hass))
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        _LOGGER.warning("ffmpeg not found: the porch cameras have no stream")
        return
    out = hls_dir(hass)

    def prepare() -> None:
        out.mkdir(exist_ok=True)
        for f in out.iterdir():
            f.unlink()

    await hass.async_add_executor_job(prepare)
    hls = ["-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency", "-g", "30", "-pix_fmt", "yuv420p",
           "-f", "hls", "-hls_time", "2", "-hls_list_size", "5", "-hls_flags", "delete_segments"]
    args = [
        ffmpeg, "-hide_banner", "-loglevel", "error", "-re",
        "-f", "lavfi", "-i", "testsrc2=size=1280x720:rate=15",
        "-f", "lavfi", "-i", "color=black:size=640x360:rate=15",
        "-filter_complex",
        f"[0:v]split[a][b];[a]{_label('Porch HD', 40)}[hd];[b]scale=480:270,{_label('Porch SD', 20)}[sd]",
        "-map", "[hd]", *hls, str(out / "hd.m3u8"),
        "-map", "[sd]", *hls, str(out / "sd.m3u8"),
        "-map", "1:v", *hls, str(out / "black.m3u8"),
    ]
    proc = await asyncio.create_subprocess_exec(*args, stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.PIPE)
    _LOGGER.info("Porch camera streams: ffmpeg pid %s, %s", proc.pid, out)

    async def stop(_event: Event) -> None:
        if proc.returncode is None:
            proc.terminate()
            await proc.wait()

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, stop)

    async def watch() -> None:
        _, err = await proc.communicate()
        if proc.returncode not in (0, -15, 255):
            _LOGGER.error("Porch camera streams stopped (%s): %s", proc.returncode, err.decode()[-500:])

    hass.async_create_background_task(watch(), "plooum_dev hls")


class HlsView(HomeAssistantView):
    """Serve <config>/hls/<name> (playlists and segments only), without caching."""

    url = "/plooum_dev/hls/{name}"
    name = "plooum_dev:hls"
    requires_auth = False

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request, name: str) -> web.Response:
        if not NAME_RE.match(name):
            raise web.HTTPNotFound
        path = hls_dir(self._hass) / name
        try:
            body = await self._hass.async_add_executor_job(path.read_bytes)
        except FileNotFoundError as err:
            raise web.HTTPNotFound from err
        ctype = "application/vnd.apple.mpegurl" if name.endswith(".m3u8") else "video/mp2t"
        return web.Response(body=body, content_type=ctype, headers={"Cache-Control": "no-store"})
