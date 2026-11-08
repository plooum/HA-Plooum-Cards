"""The fake PC agents' "Éteindre" / "Redémarrer" buttons, and nas's Wake on LAN button (see pc.py)."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .binary_sensor import pc_device
from .pc import FakePC


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    pcs = hass.data["plooum_dev"]["pcs"]
    entities: list[ButtonEntity] = []
    for pc in pcs:
        entities.append(PCOrder(pc, "shutdown", "Éteindre", "mdi:power"))
        entities.append(PCOrder(pc, "reboot", "Redémarrer", "mdi:restart"))
    entities.append(WakeOnLan(next(pc for pc in pcs if pc.name == "nas")))
    async_add_entities(entities)


class PCOrder(ButtonEntity):
    """Like the agent's buttons: unavailable while offline or while a shutdown is pending."""

    _attr_should_poll = False
    _attr_has_entity_name = True

    def __init__(self, pc: FakePC, action: str, name: str, icon: str) -> None:
        self._pc = pc
        self._action = action
        self._attr_name = name
        self._attr_icon = icon
        self._attr_unique_id = f"{pc.unique_prefix}_{action}"
        self._attr_device_info = pc_device(pc)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._pc.subscribe(self.async_write_ha_state))

    @property
    def available(self) -> bool:
        return self._pc.online and not self._pc.pending

    async def async_press(self) -> None:
        self._pc.order(self._action)


class WakeOnLan(ButtonEntity):
    """Stands for the button the Wake on LAN integration creates (no device of the PC)."""

    _attr_should_poll = False
    _attr_icon = "mdi:lan-connect"

    def __init__(self, pc: FakePC) -> None:
        self._pc = pc
        self._attr_name = f"{pc.name} Wake on LAN"
        self._attr_unique_id = f"plooum_dev_wol_{pc.name}"

    async def async_press(self) -> None:
        self._pc.wake()
