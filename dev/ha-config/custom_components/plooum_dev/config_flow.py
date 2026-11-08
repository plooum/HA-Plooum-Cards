"""Import-only config flow: the fake PCs need a config entry to own their devices (see pc.py)."""

from homeassistant.config_entries import ConfigFlow


class PlooumDevConfigFlow(ConfigFlow, domain="plooum_dev"):
    VERSION = 1

    async def async_step_import(self, import_data: dict):
        await self.async_set_unique_id("plooum_dev")
        self._abort_if_unique_id_configured()
        return self.async_create_entry(title="Plooum Dev", data={})
