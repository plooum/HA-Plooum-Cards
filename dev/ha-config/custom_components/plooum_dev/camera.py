"""Fake cameras for the floorplan card's 3D view.

Each camera draws a simple scene (sky and lawn outdoors, wall and floor indoors) with its
name and the current time, so that image refreshes are visible. Availability can follow an
input_boolean, for the `unavailable` case.

The living room camera films its room for real: the room of the test dashboard's plan, seen from
where the camera is placed on it (ROOM_VIEW). Its picture, projected onto the room in the card's 3D
view, must fall exactly on the floor and walls, and its checkerboard corners are known points for
the editor's point matching.
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
    ("Living Room Camera", "room", ((205, 190, 170), (140, 100, 70)), None),
    ("Kitchen Camera", "indoor", ((225, 225, 215), (170, 160, 150)), None),
    ("Garage Camera", "indoor", ((180, 180, 185), (90, 90, 95)), "input_boolean.garage_camera_available"),
]
WIDTH, HEIGHT = 640, 360

# The Living Room of plooum-test.yaml (x, y, w, h; 2.5 high) and its camera: position, height,
# direction (clockwise from the top of the plan), tilt (down) and horizontal field of view.
# Keep them in sync with the dashboard.
ROOM_VIEW = {
    "room": (0, 0, 7, 5, 2.5),
    "camera": (0.25, 0.25, 2.2),
    "direction": 135,
    "tilt": 15,
    "fov": 100,
}
WALL_COLORS = [(222, 120, 110), (110, 170, 222), (130, 200, 130), (230, 200, 110)]  # top, right, bottom, left


def _room_polygons() -> list[tuple[list[tuple[float, float, float]], tuple[int, int, int]]]:
    """Faces of the room seen from inside: a checkerboard floor and striped walls (1-unit tiles)."""
    x0, y0, w, h, wall = ROOM_VIEW["room"]
    faces = []
    for i in range(int(w)):
        for j in range(int(h)):
            dark = (i + j) % 2 == 0
            color = (95, 80, 70) if dark else (215, 205, 190)
            x, y = x0 + i, y0 + j
            faces.append(([(x, y, 0), (x + 1, y, 0), (x + 1, y + 1, 0), (x, y + 1, 0)], color))
    # Walls: top (y = y0), right (x = x0 + w), bottom (y = y0 + h), left (x = x0).
    walls = [
        ([(x0 + t, y0) for t in range(int(w) + 1)]),
        ([(x0 + w, y0 + t) for t in range(int(h) + 1)]),
        ([(x0 + w - t, y0 + h) for t in range(int(w) + 1)]),
        ([(x0, y0 + h - t) for t in range(int(h) + 1)]),
    ]
    for side, points in enumerate(walls):
        base = WALL_COLORS[side]
        for k in range(len(points) - 1):
            (ax, ay), (bx, by) = points[k], points[k + 1]
            shade = 1.0 if k % 2 == 0 else 0.82
            color = tuple(int(c * shade) for c in base)
            faces.append(([(ax, ay, 0), (bx, by, 0), (bx, by, wall), (ax, ay, wall)], color))
    faces.append(([(x0, y0, wall), (x0 + w, y0, wall), (x0 + w, y0 + h, wall), (x0, y0 + h, wall)], (240, 240, 236)))
    return faces


def draw_room(draw: ImageDraw.ImageDraw) -> None:
    """Pinhole view of the room, with the same camera model as the floorplan card."""
    cx, cy, cz = ROOM_VIEW["camera"]
    d = math.radians(ROOM_VIEW["direction"])
    t = math.radians(ROOM_VIEW["tilt"])
    dx, dy = math.sin(d), -math.cos(d)
    fwd = (dx * math.cos(t), dy * math.cos(t), -math.sin(t))
    right = (-dy, dx, 0.0)
    up = (fwd[1] * right[2] - fwd[2] * right[1], fwd[2] * right[0] - fwd[0] * right[2], fwd[0] * right[1] - fwd[1] * right[0])
    focal = (WIDTH / 2) / math.tan(math.radians(ROOM_VIEW["fov"]) / 2)
    dot = lambda a, b: a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    near = 0.05
    for poly, color in _room_polygons():
        cam = [tuple(p[i] - c for i, c in enumerate((cx, cy, cz))) for p in poly]
        # Clip against the near plane (depth along fwd >= near).
        clipped = []
        for k, a in enumerate(cam):
            b = cam[(k + 1) % len(cam)]
            da, db = dot(a, fwd) - near, dot(b, fwd) - near
            if da >= 0:
                clipped.append(a)
            if (da >= 0) != (db >= 0):
                s = da / (da - db)
                clipped.append(tuple(a[i] + (b[i] - a[i]) * s for i in range(3)))
        if len(clipped) < 3:
            continue
        pts = []
        for p in clipped:
            z = dot(p, fwd)
            pts.append((WIDTH / 2 + dot(p, right) / z * focal, HEIGHT / 2 - dot(p, up) / z * focal))
        draw.polygon(pts, fill=color, outline=(60, 50, 45))


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
    if scene == "room":
        draw_room(draw)
    elif scene == "outdoor":
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
    if scene == "room":
        # A small label, to keep most of the room visible.
        draw.rectangle([0, HEIGHT - 30, 330, HEIGHT], fill=(0, 0, 0))
        draw.text((8, HEIGHT - 27), f"{name} {time.strftime('%H:%M:%S')}", fill=(255, 255, 255), font=small)
    else:
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
