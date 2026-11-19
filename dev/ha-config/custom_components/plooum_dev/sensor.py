"""The fake PC agents' temperature sensors (see pc.py)."""

from __future__ import annotations

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .binary_sensor import pc_device
from .pc import FakePC


def temp_name(key: str) -> str:
    """Like tempName in the agent (pcagent/temps.go)."""
    if key == "cpu":
        return "Température CPU"
    if key.startswith("gpu"):
        return "Température " + key.upper()
    return "Température disque " + key


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    async_add_entities(PCTemperature(pc, key) for pc in hass.data["plooum_dev"]["pcs"] for key in pc.temps)


class PCTemperature(SensorEntity):
    """Unavailable while the PC is offline, like the agent's sensors (MQTT availability)."""

    _attr_should_poll = False
    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS

    def __init__(self, pc: FakePC, key: str) -> None:
        self._pc = pc
        self._key = key
        self._attr_name = temp_name(key)
        self._attr_unique_id = f"{pc.unique_prefix}_temp_{key}"
        self._attr_device_info = pc_device(pc)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._pc.subscribe(self.async_write_ha_state))

    @property
    def available(self) -> bool:
        return self._pc.online

    @property
    def native_value(self) -> float:
        return self._pc.temps[self._key]
