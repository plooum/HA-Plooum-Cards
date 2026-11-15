"""Fake camera preview, as the Plooum CamPreview integration (HA-Plooum-CamPreview) makes one.

image.garden_camera_preview: the last good picture of camera.garden_camera, with the attributes the
floorplan card reads (`camera_entity`, `status`, `moved`). Its picture is taken when HA starts and
again on input_button.garden_preview_update; input_boolean.garden_preview_moved stands for a camera
that turned: status `moved`, the preview keeps its last picture.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.camera import async_get_image
from homeassistant.components.image import ImageEntity
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from homeassistant.util import dt as dt_util

CAMERA = "camera.garden_camera"
MOVED = "input_boolean.garden_preview_moved"
UPDATE = "input_button.garden_preview_update"


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    async_add_entities([FakePreview(hass)])


class FakePreview(ImageEntity):
    _attr_name = "Garden Camera preview"
    _attr_should_poll = False
    _attr_content_type = "image/jpeg"

    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(hass)
        self._picture: bytes | None = None

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_track_state_change_event(self.hass, [MOVED, UPDATE], self._changed))
        self.hass.async_create_task(self._capture())

    @callback
    def _changed(self, event: Event[EventStateChangedData]) -> None:
        if event.data["entity_id"] == UPDATE:
            self.hass.async_create_task(self._capture())
        else:
            self.async_write_ha_state()

    async def _capture(self) -> None:
        if self._moved:
            return
        try:
            self._picture = (await async_get_image(self.hass, CAMERA)).content
        except Exception:  # noqa: BLE001 - camera not ready yet
            return
        self._attr_image_last_updated = dt_util.utcnow()
        self.async_write_ha_state()

    @property
    def _moved(self) -> bool:
        st = self.hass.states.get(MOVED)
        return bool(st and st.state == "on")

    async def async_image(self) -> bytes | None:
        return self._picture

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"camera_entity": CAMERA, "status": "moved" if self._moved else "ok", "moved": self._moved}
