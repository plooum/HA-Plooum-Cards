"""Fake cameras for the floorplan card's 3D view.

Each camera draws a simple scene (sky and lawn outdoors, wall and floor indoors) with its
name and the current time, so that image refreshes are visible. Availability can follow an
input_boolean, for the `unavailable` case.
"""

from __future__ import annotations

import io
import math
import time

from PIL import Image, ImageDraw, ImageFont

from homeassistant.components.camera import Camera
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

# name, scene, colors (top, bottom), availability entity
CAMERAS = [
    ("Garden Camera", "outdoor", ((120, 170, 230), (70, 140, 70)), None),
    ("Driveway Camera", "outdoor", ((150, 180, 220), (110, 110, 115)), None),
    ("Living Room Camera", "indoor", ((205, 190, 170), (140, 100, 70)), None),
    ("Kitchen Camera", "indoor", ((225, 225, 215), (170, 160, 150)), None),
    ("Garage Camera", "indoor", ((180, 180, 185), (90, 90, 95)), "input_boolean.garage_camera_available"),
]
WIDTH, HEIGHT = 640, 360


def draw_frame(name: str, scene: str, colors: tuple, width: int, height: int) -> bytes:
    top, bottom = colors
    img = Image.new("RGB", (WIDTH, HEIGHT), top)
    draw = ImageDraw.Draw(img)
    horizon = int(HEIGHT * (0.55 if scene == "outdoor" else 0.62))
    for y in range(horizon):
        k = y / horizon
        draw.line([(0, y), (WIDTH, y)], fill=tuple(int(c * (0.8 + 0.2 * k)) for c in top))
    draw.rectangle([0, horizon, WIDTH, HEIGHT], fill=bottom)
    now = time.time()
    if scene == "outdoor":
        # A sun that crosses the sky once a minute.
        x = (now % 60) / 60 * WIDTH
        y = horizon - 40 - 80 * math.sin(math.pi * (now % 60) / 60)
        draw.ellipse([x - 22, y - 22, x + 22, y + 22], fill=(255, 220, 90))
        for i in range(6):
            tx = 40 + i * 110
            draw.rectangle([tx + 18, horizon - 30, tx + 26, horizon + 10], fill=(90, 60, 40))
            draw.ellipse([tx - 4, horizon - 80, tx + 48, horizon - 20], fill=(40, 110, 50))
    else:
        # A window on the back wall and a lamp swinging slowly.
        draw.rectangle([WIDTH * 0.6, 50, WIDTH * 0.85, horizon - 40], fill=(150, 200, 240), outline=(255, 255, 255), width=6)
        x = WIDTH * 0.3 + 60 * math.sin(now)
        draw.line([(WIDTH * 0.3, 0), (x, 110)], fill=(60, 60, 60), width=3)
        draw.ellipse([x - 20, 100, x + 20, 140], fill=(255, 210, 120))
    font = ImageFont.load_default(size=30)
    small = ImageFont.load_default(size=22)
    draw.rectangle([0, 0, WIDTH, 44], fill=(0, 0, 0))
    draw.text((12, 6), name, fill=(255, 255, 255), font=font)
    draw.text((WIDTH - 110, 10), time.strftime("%H:%M:%S"), fill=(255, 255, 0), font=small)
    if width and height and (width, height) != (WIDTH, HEIGHT):
        img = img.resize((width, height))
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=80)
    return out.getvalue()


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    async_add_entities(FakeCamera(*cam) for cam in CAMERAS)


class FakeCamera(Camera):
    _attr_should_poll = False

    def __init__(self, name: str, scene: str, colors: tuple, availability: str | None) -> None:
        super().__init__()
        self._attr_name = name
        self._attr_unique_id = "plooum_dev_" + name.lower().replace(" ", "_")
        self._scene = scene
        self._colors = colors
        self._availability = availability
        self._attr_is_streaming = True

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if self._availability:
            @callback
            def changed(event: Event[EventStateChangedData]) -> None:
                self.async_write_ha_state()

            self.async_on_remove(async_track_state_change_event(self.hass, [self._availability], changed))

    @property
    def available(self) -> bool:
        if not self._availability:
            return True
        state = self.hass.states.get(self._availability)
        return state is None or state.state != "off"

    async def async_camera_image(self, width: int | None = None, height: int | None = None) -> bytes | None:
        return await self.hass.async_add_executor_job(draw_frame, self.name, self._scene, self._colors, width, height)
