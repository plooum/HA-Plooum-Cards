"""Onboard the dev Home Assistant (first run), store a long-lived token, wait for RUNNING,
assign the test entities to floors and areas, and create the UI-editable dashboard /plooum-edit.

Idempotent: skips onboarding if dev/.ha-token already holds a valid token, only creates
missing floors/areas, and only creates /plooum-edit if it does not exist (seeded from
dashboards/plooum-test.yaml).
Run with the dev venv: dev/.venv/bin/python dev/bootstrap.py (dev/ha.sh start does it).
"""

import asyncio
import time
from pathlib import Path

import aiohttp
import yaml

URL = "http://127.0.0.1:8123"
CLIENT_ID = URL + "/"
# Test credentials of the local dev instance only (bound to 127.0.0.1).
USERNAME = "dev"
PASSWORD = "plooum-dev"
TOKEN_FILE = Path(__file__).parent / ".ha-token"
SEED_DASHBOARD = Path(__file__).parent / "ha-config" / "dashboards" / "plooum-test.yaml"
EDIT_DASHBOARD = "plooum-edit"

# Floors, areas and their entities, used by the floorplan card's auto-discovery.
# Area ids are derived from names by HA (e.g. "Living Room" -> living_room);
# Living Room, Kitchen and Bedroom already exist after onboarding.
FLOORS = {"Ground Floor": 0, "Upstairs": 1}
AREAS = {
    "Living Room": (
        "Ground Floor",
        [
            "light.living_room_light",
            "switch.tv_plug",
            "sensor.living_room_temperature",
            "sensor.living_room_humidity",
            "cover.living_room_cover",
        ],
    ),
    "Kitchen": ("Ground Floor", ["light.kitchen_light", "sensor.kitchen_temperature"]),
    "Hallway": ("Ground Floor", ["binary_sensor.front_door", "binary_sensor.hallway_motion"]),
    "Bedroom": ("Upstairs", ["light.bedroom_light", "sensor.bedroom_temperature", "cover.bedroom_cover"]),
    "Bathroom": ("Upstairs", []),  # empty room on purpose
}


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def token_is_valid(session: aiohttp.ClientSession) -> bool:
    if not TOKEN_FILE.exists():
        return False
    async with session.get(f"{URL}/api/", headers=auth_headers(TOKEN_FILE.read_text().strip())) as resp:
        return resp.status == 200


async def get_auth_code(session: aiohttp.ClientSession, steps: dict[str, bool]) -> str:
    if not steps.get("user"):
        async with session.post(
            f"{URL}/api/onboarding/users",
            json={
                "client_id": CLIENT_ID,
                "name": "Dev",
                "username": USERNAME,
                "password": PASSWORD,
                "language": "en",
            },
        ) as resp:
            resp.raise_for_status()
            return (await resp.json())["auth_code"]

    async with session.post(
        f"{URL}/auth/login_flow",
        json={"client_id": CLIENT_ID, "handler": ["homeassistant", None], "redirect_uri": CLIENT_ID},
    ) as resp:
        resp.raise_for_status()
        flow_id = (await resp.json())["flow_id"]
    async with session.post(
        f"{URL}/auth/login_flow/{flow_id}",
        json={"client_id": CLIENT_ID, "username": USERNAME, "password": PASSWORD},
    ) as resp:
        resp.raise_for_status()
        return (await resp.json())["result"]


async def onboard(session: aiohttp.ClientSession) -> None:
    async with session.get(f"{URL}/api/onboarding") as resp:
        steps = {s["step"]: s["done"] for s in await resp.json()}

    code = await get_auth_code(session, steps)
    async with session.post(
        f"{URL}/auth/token",
        data={"grant_type": "authorization_code", "code": code, "client_id": CLIENT_ID},
    ) as resp:
        resp.raise_for_status()
        access_token = (await resp.json())["access_token"]

    remaining = {
        "core_config": {},
        "analytics": {},
        "integration": {"client_id": CLIENT_ID, "redirect_uri": CLIENT_ID},
    }
    for step, payload in remaining.items():
        if not steps.get(step, True):
            async with session.post(
                f"{URL}/api/onboarding/{step}", json=payload, headers=auth_headers(access_token)
            ) as resp:
                resp.raise_for_status()

    async with session.ws_connect(f"{URL}/api/websocket") as ws:
        await ws.receive_json()  # auth_required
        await ws.send_json({"type": "auth", "access_token": access_token})
        if (await ws.receive_json())["type"] != "auth_ok":
            raise RuntimeError("websocket auth failed")
        await ws.send_json(
            {
                "id": 1,
                "type": "auth/long_lived_access_token",
                "client_name": f"plooum-dev-{int(time.time())}",
                "lifespan": 3650,
            }
        )
        result = await ws.receive_json()
        if not result.get("success"):
            raise RuntimeError(f"long-lived token creation failed: {result}")

    TOKEN_FILE.write_text(result["result"] + "\n")
    TOKEN_FILE.chmod(0o600)
    print(f"Onboarding done, token written to {TOKEN_FILE}")


async def wait_running(session: aiohttp.ClientSession) -> None:
    """Template entities stay `unknown` until the core reaches RUNNING."""
    headers = auth_headers(TOKEN_FILE.read_text().strip())
    for _ in range(120):
        async with session.get(f"{URL}/api/config", headers=headers) as resp:
            if (await resp.json())["state"] == "RUNNING":
                return
        await asyncio.sleep(1)
    raise RuntimeError("Home Assistant did not reach RUNNING within 120 s")


class WsClient:
    """Minimal authenticated websocket client (one command at a time)."""

    def __init__(self, ws: aiohttp.ClientWebSocketResponse) -> None:
        self.ws = ws
        self.msg_id = 0

    @classmethod
    async def connect(cls, session: aiohttp.ClientSession) -> "WsClient":
        ws = await session.ws_connect(f"{URL}/api/websocket")
        await ws.receive_json()  # auth_required
        await ws.send_json({"type": "auth", "access_token": TOKEN_FILE.read_text().strip()})
        await ws.receive_json()  # auth_ok
        return cls(ws)

    async def call(self, **msg) -> dict:
        self.msg_id += 1
        await self.ws.send_json({"id": self.msg_id, **msg})
        result = await self.ws.receive_json()
        if not result.get("success"):
            raise RuntimeError(f"{msg['type']} failed: {result}")
        return result["result"]


async def ensure_areas(session: aiohttp.ClientSession) -> None:
    """Create the test floors/areas if missing and (re)assign their entities."""
    client = await WsClient.connect(session)
    try:
        floors = {f["name"]: f["floor_id"] for f in await client.call(type="config/floor_registry/list")}
        for name, level in FLOORS.items():
            if name not in floors:
                floor = await client.call(type="config/floor_registry/create", name=name, level=level)
                floors[name] = floor["floor_id"]

        areas = {a["name"]: a for a in await client.call(type="config/area_registry/list")}
        for name, (floor_name, entity_ids) in AREAS.items():
            area = areas.get(name)
            if area is None:
                area = await client.call(type="config/area_registry/create", name=name, floor_id=floors[floor_name])
            elif area["floor_id"] != floors[floor_name]:
                await client.call(type="config/area_registry/update", area_id=area["area_id"], floor_id=floors[floor_name])
            for entity_id in entity_ids:
                await client.call(type="config/entity_registry/update", entity_id=entity_id, area_id=area["area_id"])
    finally:
        await client.ws.close()


async def ensure_edit_dashboard(session: aiohttp.ClientSession) -> None:
    """Storage-mode dashboard: the only kind whose cards can be edited in the UI (card editors)."""
    async with session.ws_connect(f"{URL}/api/websocket") as ws:
        await ws.receive_json()  # auth_required
        await ws.send_json({"type": "auth", "access_token": TOKEN_FILE.read_text().strip()})
        await ws.receive_json()  # auth_ok

        async def call(msg_id: int, **msg) -> dict:
            await ws.send_json({"id": msg_id, **msg})
            result = await ws.receive_json()
            if not result.get("success"):
                raise RuntimeError(f"{msg['type']} failed: {result}")
            return result["result"]

        dashboards = await call(1, type="lovelace/dashboards/list")
        if any(d["url_path"] == EDIT_DASHBOARD for d in dashboards):
            return
        await call(
            2,
            type="lovelace/dashboards/create",
            url_path=EDIT_DASHBOARD,
            title="Plooum Edit",
            icon="mdi:pencil",
            show_in_sidebar=True,
            require_admin=False,
            mode="storage",
        )
        await call(3, type="lovelace/config/save", url_path=EDIT_DASHBOARD, config=yaml.safe_load(SEED_DASHBOARD.read_text()))
        print(f"Dashboard /{EDIT_DASHBOARD} created")


async def main() -> None:
    async with aiohttp.ClientSession() as session:
        if not await token_is_valid(session):
            await onboard(session)
        await wait_running(session)
        await ensure_areas(session)
        await ensure_edit_dashboard(session)


if __name__ == "__main__":
    asyncio.run(main())
