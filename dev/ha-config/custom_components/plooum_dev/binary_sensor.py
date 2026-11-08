"""The fake PC agents' "En ligne" connectivity sensors (see pc.py)."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .pc import FakePC


def pc_device(pc: FakePC) -> DeviceInfo:
    return DeviceInfo(identifiers={("plooum_dev", pc.unique_prefix)}, name=pc.name, manufacturer="Plooum",
                      model="Postes", sw_version="1.0.0")


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    async_add_entities(PCOnline(pc) for pc in hass.data["plooum_dev"]["pcs"])


class PCOnline(BinarySensorEntity):
    _attr_should_poll = False
    _attr_has_entity_name = True
    _attr_name = "En ligne"
    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY

    def __init__(self, pc: FakePC) -> None:
        self._pc = pc
        self._attr_unique_id = pc.unique_prefix + "_online"
        self._attr_device_info = pc_device(pc)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._pc.subscribe(self.async_write_ha_state))

    @property
    def is_on(self) -> bool:
        return self._pc.online

    @property
    def extra_state_attributes(self) -> dict:
        return self._pc.attributes
