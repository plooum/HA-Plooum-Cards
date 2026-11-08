"""Fake PCs that mimic the Plooum PC agent (SiteWeb, pcagent/main.go), for the PC card.

The real agent announces, through MQTT discovery, a device `plooum_pc_<name>` with three entities:
a connectivity binary sensor "En ligne" (attributes = the agent's JSON state: online, pending, hostname,
os, arch, version, since) and two buttons "Éteindre" / "Redémarrer" (unique ids `plooum_pc_<name>_shutdown`
and `_reboot`), unavailable while the PC is offline or a shutdown is pending. The fakes keep the same
device, names, unique ids and attributes, so the card's auto-discovery runs exactly as in production.

Waking up: `bureau` wakes when `wake_on_lan.send_magic_packet` is called with its MAC (the card's `mac`
option; the service itself is set up by `wake_on_lan:` in configuration.yaml), `nas` when its own
`button.nas_wake_on_lan` is pressed (like the button of the Wake on LAN integration, the card's
`wol_entity` option).
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Callable

from homeassistant.const import EVENT_CALL_SERVICE
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.event import async_call_later

SHUTDOWN_DELAY = 3  # pending -> offline
BOOT_DELAY = 4  # magic packet / reboot -> online

# name, MAC, online at start
PCS = [
    ("bureau", "02:00:00:00:00:01", True),
    ("nas", "02:00:00:00:00:02", False),
]


class FakePC:
    """State of one fake agent; entities subscribe to its changes."""

    def __init__(self, hass: HomeAssistant, name: str, mac: str, online: bool) -> None:
        self.hass = hass
        self.name = name
        self.mac = mac
        self.online = online
        self.pending: str | None = None
        self.since = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        self._listeners: list[Callable[[], None]] = []
        self._cancel: Callable[[], None] | None = None

    def subscribe(self, cb: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(cb)
        return lambda: self._listeners.remove(cb)

    @property
    def unique_prefix(self) -> str:
        return f"plooum_pc_{self.name}"

    @property
    def attributes(self) -> dict:
        if not self.online:
            return {"online": False}
        attrs = {"online": True, "hostname": self.name.upper(), "os": "windows", "arch": "amd64",
                 "version": "1.0.0", "since": self.since}
        if self.pending:
            attrs["pending"] = self.pending
        return attrs

    def _changed(self) -> None:
        for cb in list(self._listeners):
            cb()

    def _later(self, delay: float, action: Callable[[], None]) -> None:
        if self._cancel:
            self._cancel()

        @callback  # runs in the event loop (a plain lambda would run in an executor thread)
        def fire(_now) -> None:
            self._cancel = None
            action()

        self._cancel = async_call_later(self.hass, delay, fire)

    @callback
    def order(self, action: str) -> None:
        if not self.online or self.pending:
            return
        self.pending = action
        self._changed()
        self._later(SHUTDOWN_DELAY, self._went_down)

    def _went_down(self) -> None:
        reboot = self.pending == "reboot"
        self.online, self.pending = False, None
        self._changed()
        if reboot:
            self._later(BOOT_DELAY, self._booted)

    @callback
    def wake(self) -> None:
        if not self.online:
            self._later(BOOT_DELAY, self._booted)

    def _booted(self) -> None:
        self.online, self.pending = True, None
        self.since = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
        self._changed()


def setup_pcs(hass: HomeAssistant) -> list[FakePC]:
    pcs = [FakePC(hass, *pc) for pc in PCS]

    @callback
    def on_service(event: Event) -> None:
        data = event.data
        if data.get("domain") != "wake_on_lan" or data.get("service") != "send_magic_packet":
            return
        mac = str((data.get("service_data") or {}).get("mac", "")).lower().replace("-", ":")
        for pc in pcs:
            if pc.mac == mac:
                pc.wake()

    hass.bus.async_listen(EVENT_CALL_SERVICE, on_service)
    return pcs
