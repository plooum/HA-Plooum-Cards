"""Fake cameras for the floorplan card's 3D view.

Each camera draws a simple scene (sky and lawn outdoors, wall and floor indoors) with its
name and the current time, so that image refreshes are visible. Availability can follow an
input_boolean, for the `unavailable` case.

The living room camera films its room for real, and the garden camera the house: as seen from where
they are placed on the test dashboard's plan (ROOM_VIEW, HOUSE_VIEW). Their pictures, projected in
the card's 3D view, must fall exactly on the floor, walls and ground, and their checkerboard corners
are known points for the editor's point matching. The garden camera has a wide-angle lens with a
known barrel distortion (the card's `distortion`), for the editor's fit of it.
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
    ("Garden Camera", "house", ((120, 170, 230), (70, 140, 70)), None),
    ("Driveway Camera", "outdoor", ((150, 180, 220), (110, 110, 115)), None),
    ("Living Room Camera", "room", ((205, 190, 170), (140, 100, 70)), None),
    ("Kitchen Camera", "indoor", ((225, 225, 215), (170, 160, 150)), None),
    ("Garage Camera", "indoor", ((180, 180, 185), (90, 90, 95)), "input_boolean.garage_camera_available"),
]
WIDTH, HEIGHT = 640, 360

# Scenes filmed for real, as the cameras placed on the test dashboard's floorplan view see them:
# camera position (x, y, height), direction (clockwise from the top of the plan), tilt (down),
# horizontal field of view (of the undistorted picture) and lens distortion (the card's division
# model, see cameraPose() in the floorplan card). Keep them in sync with plooum-test.yaml.
#
# The Living Room (x, y, w, h; 2.5 high), filmed from inside.
ROOM_VIEW = {
    "room": (0, 0, 7, 5, 2.5),
    "camera": (0.25, 0.25, 2.2),
    "direction": 135,
    "tilt": 15,
    "fov": 100,
}
# The house filmed from the garden: the ground floor (11 x 5, 2.5 high) and the upstairs floor
# (8 x 4, from the slab at 2.5 up to 5.25), as boxes (x0, y0, z0, x1, y1, z1), on a grey
# checkerboard. Roofs aren't drawn.
HOUSE_VIEW = {
    "boxes": [(0, 0, 0, 11, 5, 2.5), (0, 0, 2.5, 8, 4, 5.25)],
    "lawn": (-4, -4, 18, 13),
    "camera": (14, 10, 2.2),
    "direction": 310,
    "tilt": 12,
    "fov": 90,
    "distortion": -0.25,
}
# Wall colors by the side they face: north (-y), east (+x), south (+y), west (-x).
WALL_COLORS = [(222, 120, 110), (110, 170, 222), (130, 200, 130), (230, 200, 110)]

Polygon = tuple[list[tuple[float, float, float]], tuple[int, int, int], tuple[float, float, float] | None]


def _striped_wall(a: tuple[float, float], b: tuple[float, float], z0: float, z1: float, side: int, normal) -> list[Polygon]:
    """A wall from a to b in 1-unit stripes of alternating shades."""
    length = math.dist(a, b)
    steps = max(1, round(length))
    out = []
    for k in range(steps):
        t0, t1 = k / steps, (k + 1) / steps
        p = (a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0)
        q = (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)
        color = tuple(int(c * (1.0 if k % 2 == 0 else 0.82)) for c in WALL_COLORS[side])
        out.append(([(p[0], p[1], z0), (q[0], q[1], z0), (q[0], q[1], z1), (p[0], p[1], z1)], color, normal))
    return out


def _checkerboard(x0: int, y0: int, x1: int, y1: int, dark, light) -> list[Polygon]:
    return [
        ([(x, y, 0), (x + 1, y, 0), (x + 1, y + 1, 0), (x, y + 1, 0)], dark if (x + y) % 2 == 0 else light, None)
        for x in range(x0, x1)
        for y in range(y0, y1)
    ]


def _room_polygons() -> list[Polygon]:
    """The room seen from inside: a checkerboard floor, striped walls and the ceiling."""
    x0, y0, w, h, wall = ROOM_VIEW["room"]
    x1, y1 = x0 + w, y0 + h
    faces = _checkerboard(x0, y0, x1, y1, (95, 80, 70), (215, 205, 190))
    faces += _striped_wall((x0, y0), (x1, y0), 0, wall, 0, None)
    faces += _striped_wall((x1, y0), (x1, y1), 0, wall, 1, None)
    faces += _striped_wall((x1, y1), (x0, y1), 0, wall, 2, None)
    faces += _striped_wall((x0, y1), (x0, y0), 0, wall, 3, None)
    faces.append(([(x0, y0, wall), (x1, y0, wall), (x1, y1, wall), (x0, y1, wall)], (240, 240, 236), None))
    return faces


def _house_polygons() -> list[Polygon]:
    """The house seen from outside: its boxes' striped walls and flat tops, on a grey checkerboard."""
    faces = _checkerboard(*HOUSE_VIEW["lawn"], (85, 85, 90), (195, 195, 200))
    for x0, y0, z0, x1, y1, z1 in HOUSE_VIEW["boxes"]:
        faces += _striped_wall((x0, y0), (x1, y0), z0, z1, 0, (0, -1, 0))
        faces += _striped_wall((x1, y0), (x1, y1), z0, z1, 1, (1, 0, 0))
        faces += _striped_wall((x1, y1), (x0, y1), z0, z1, 2, (0, 1, 0))
        faces += _striped_wall((x0, y1), (x0, y0), z0, z1, 3, (-1, 0, 0))
        faces.append(([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (200, 200, 196), (0, 0, 1)))
    return faces


def draw_view(draw: ImageDraw.ImageDraw, view: dict, polygons: list[Polygon]) -> None:
    """View of polygons, with the same camera model as the floorplan card (a pinhole, and its lens
    distortion: edges are then drawn curved). Polygons with a normal are culled when facing away and
    drawn far to near, after those without (the ground)."""
    cx, cy, cz = view["camera"]
    d = math.radians(view["direction"])
    t = math.radians(view["tilt"])
    dx, dy = math.sin(d), -math.cos(d)
    fwd = (dx * math.cos(t), dy * math.cos(t), -math.sin(t))
    right = (-dy, dx, 0.0)
    up = (fwd[1] * right[2] - fwd[2] * right[1], fwd[2] * right[0] - fwd[0] * right[2], fwd[0] * right[1] - fwd[1] * right[0])
    focal = (WIDTH / 2) / math.tan(math.radians(view["fov"]) / 2)
    dot = lambda a, b: a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    near = 0.05
    cam_pos = (cx, cy, cz)
    lens = view.get("distortion", 0)
    # Points along each edge: straight lines come out curved.
    steps = 12 if lens else 1

    def to_picture(p):
        z = dot(p, fwd)
        # Undistorted, then distorted point, in half picture widths from the center.
        ux, uy = dot(p, right) / z * focal / (WIDTH / 2), dot(p, up) / z * focal / (WIDTH / 2)
        g = 2 / (1 + math.sqrt(max(0.0, 1 - 4 * lens * (ux * ux + uy * uy))))
        return (WIDTH / 2 * (1 + ux * g), HEIGHT / 2 - WIDTH / 2 * uy * g)

    def distance(poly):
        n = len(poly[0])
        return math.dist(cam_pos, tuple(sum(p[i] for p in poly[0]) / n for i in range(3)))

    flat = [pg for pg in polygons if pg[2] is None]
    solid = [pg for pg in polygons if pg[2] is not None and dot(tuple(c - v for c, v in zip(cam_pos, pg[0][0])), pg[2]) > 0]
    for poly, color, _ in flat + sorted(solid, key=distance, reverse=True):
        cam = [tuple(p[i] - c for i, c in enumerate(cam_pos)) for p in poly]
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
        for i, a in enumerate(clipped):
            b = clipped[(i + 1) % len(clipped)]
            for s in range(steps):
                pts.append(to_picture(tuple(a[j] + (b[j] - a[j]) * s / steps for j in range(3))))
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
        draw_view(draw, ROOM_VIEW, _room_polygons())
    elif scene == "house":
        draw_view(draw, HOUSE_VIEW, _house_polygons())
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
    if scene in ("room", "house"):
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
