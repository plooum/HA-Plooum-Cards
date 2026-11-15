"""Fake Plooum CamRecorder (HA-Plooum-CamRecorder), for the camera card's photo and video buttons.

While input_boolean.camrecorder_installed is on, the actions plooum_camrecorder.snapshot,
record, start_recording and stop_recording exist, as the integration declares them (any camera;
snapshot / record / stop_recording respond with the "saved" files). Nothing is written:
counter.camrecorder_photos and counter.camrecorder_videos count what would have been.
camera.porch_camera has the integration's "Recording" switch (switch.porch_camera_recording,
attributes camera_entity and started, a plain state here); camera.porch_camera_sd has none, as a
camera that isn't picked in the integration's options. Turned off, the actions disappear.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import Event, EventStateChangedData, HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import dt as dt_util

DOMAIN = "plooum_camrecorder"
INSTALLED = "input_boolean.camrecorder_installed"
SWITCHES = {"camera.porch_camera": "switch.porch_camera_recording"}
SERVICES = {
    "snapshot": SupportsResponse.OPTIONAL,
    "record": SupportsResponse.OPTIONAL,
    "start_recording": SupportsResponse.NONE,
    "stop_recording": SupportsResponse.OPTIONAL,
}


def setup_camrecorder(hass: HomeAssistant) -> None:
    recording: dict[str, str] = {}  # camera -> start (ISO)

    def cameras(call: ServiceCall) -> list[str]:
        ids = call.data.get("entity_id") or []
        ids = [ids] if isinstance(ids, str) else list(ids)
        if not ids or not all(i.startswith("camera.") for i in ids):
            raise ServiceValidationError("No camera targeted")
        for i in ids:
            st = hass.states.get(i)
            if st is None or st.state == "unavailable":
                raise HomeAssistantError(f"{i}: camera unavailable")
        return ids

    def file(camera: str, kind: str, start: str) -> dict[str, Any]:
        ext = "jpg" if kind == "photo" else "mp4"
        return {"camera_entity": camera, "kind": kind, "path": f"/media/plooum_camrecorder/fake.{ext}",
                "media_content_id": None, "start": start, "end": None if kind == "photo" else dt_util.utcnow().isoformat()}

    @callback
    def write_switch(camera: str) -> None:
        if switch := SWITCHES.get(camera):
            on = camera in recording
            hass.states.async_set(switch, "on" if on else "off", {
                "camera_entity": camera, "started": recording.get(camera), "max_duration": 600,
                "friendly_name": "Porch Camera Recording", "icon": "mdi:record-rec",
            })

    async def count(what: str, n: int) -> None:
        for _ in range(n):
            await hass.services.async_call("counter", "increment", {"entity_id": f"counter.camrecorder_{what}"}, blocking=True)

    async def snapshot(call: ServiceCall) -> dict[str, Any]:
        ids = cameras(call)
        await count("photos", len(ids))
        return {"files": [file(c, "photo", dt_util.utcnow().isoformat()) for c in ids]}

    async def record(call: ServiceCall) -> dict[str, Any]:
        ids = cameras(call)
        await count("videos", len(ids))
        return {"files": [file(c, "video", dt_util.utcnow().isoformat()) for c in ids]}

    async def start_recording(call: ServiceCall) -> None:
        ids = cameras(call)
        for c in ids:
            if c in recording:
                raise ServiceValidationError(f"{c} is already recording")
        for c in ids:
            recording[c] = dt_util.utcnow().isoformat()
            write_switch(c)

    async def stop_recording(call: ServiceCall) -> dict[str, Any]:
        ids = call.data.get("entity_id") or []
        ids = [ids] if isinstance(ids, str) else list(ids)
        for c in ids:
            if c not in recording:
                raise ServiceValidationError(f"{c} is not recording")
        files = [file(c, "video", recording.pop(c)) for c in ids]
        for c in ids:
            write_switch(c)
        await count("videos", len(ids))
        return {"files": files}

    handlers = {"snapshot": snapshot, "record": record, "start_recording": start_recording,
                "stop_recording": stop_recording}

    @callback
    def apply(*_: Any) -> None:
        st = hass.states.get(INSTALLED)
        installed = st is None or st.state != "off"
        for name, support in SERVICES.items():
            if installed and not hass.services.has_service(DOMAIN, name):
                hass.services.async_register(DOMAIN, name, handlers[name], supports_response=support)
            elif not installed and hass.services.has_service(DOMAIN, name):
                hass.services.async_remove(DOMAIN, name)
        for camera, switch in SWITCHES.items():
            if installed:
                write_switch(camera)
            else:
                recording.pop(camera, None)
                hass.states.async_remove(switch)

    @callback
    def changed(event: Event[EventStateChangedData]) -> None:
        apply()

    async_track_state_change_event(hass, [INSTALLED], changed)
    apply()
