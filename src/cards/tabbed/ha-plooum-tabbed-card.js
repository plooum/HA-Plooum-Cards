import { LitElement, html, css } from "lit";

/* ==========================================================================
   MAIN CARD : ha-plooum-tabs-card
   ========================================================================== */
class HaPlooumTabsCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _activeTab: { type: Number },
      _tabElements: { type: Array },
    };
  }

  constructor() {
    super();
    this._activeTab = 0;
    this._tabElements = [];
  }

  static getConfigElement() {
    return document.createElement("ha-plooum-tabs-card-editor");
  }

  static getStubConfig() {
    return {
      active_tab_bg: "rgba(255, 255, 255, 0)",
      tabs_background: "rgba(0, 0, 0, 0)",
      tabs: [
        { name: "HOME", cards: [] },
        { name: "GARDEN", cards: [] }
      ]
    };
  }

  setConfig(config) {
    if (!config || !config.tabs) {
      throw new Error("Invalid configuration: 'tabs' is required.");
    }
    this.config = { ...config };
    
    if (this._activeTab >= this.config.tabs.length) {
      this._activeTab = 0;
    }
    
    this._buildCards();
  }

  async _buildCards() {
    if (!window.loadCardHelpers) return;
    const helpers = await window.loadCardHelpers();
    
    this._tabElements = this.config.tabs.map(tab => {
      if (!tab.cards) return [];
      return tab.cards.map(cardConfig => {
        try {
          const el = helpers.createCardElement(cardConfig);
          if (this.hass) el.hass = this.hass;
          return el;
        } catch (err) {
          const errorEl = document.createElement("hui-error-card");
          errorEl.setConfig({ type: "error", error: err.message, origConfig: cardConfig });
          return errorEl;
        }
      });
    });
    
    this.requestUpdate();
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("hass") && this.hass && this._tabElements) {
      this._tabElements.flat().forEach(el => {
        if (el) el.hass = this.hass;
      });
    }
  }

  _switchTab(index) {
    this._activeTab = index;
  }

  render() {
    if (!this.config || !this.hass) return html``;

    const tabs = this.config.tabs || [];
    const activeTabBg = this.config.active_tab_bg || "rgba(255, 255, 255, 0)";
    const tabsBg = this.config.tabs_background || "rgba(0, 0, 0, 0)";

    return html`
      <ha-card class="plooum-tabs-card">
        <div class="tabs-header" style="background: ${tabsBg};">
          ${tabs.map((tab, index) => {
            const isActive = index === this._activeTab;
            return html`
              <div 
                class="tab-button ${isActive ? "active" : ""}"
                style="${isActive ? `background-color: ${activeTabBg};` : ""}"
                @click="${() => this._switchTab(index)}"
              >
                ${tab.name}
              </div>
            `;
          })}
        </div>

        <div class="tabs-content">
          ${this._tabElements.map((cardElements, index) => {
            const isActive = index === this._activeTab;
            return html`
              <div class="tab-pane" style="display: ${isActive ? 'flex' : 'none'};">
                ${cardElements.length > 0 
                  ? cardElements
                  : html`<div class="no-cards">No cards configured for this tab.</div>`
                }
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .plooum-tabs-card {
        background: transparent; border: none; box-shadow: none;
        display: flex; flex-direction: column; width: 100%; overflow: hidden;
      }
      .tabs-header {
        display: flex; width: 100%;
        border-radius: 8px 8px 0 0; overflow-x: auto; scrollbar-width: none;
      }
      .tabs-header::-webkit-scrollbar { display: none; }
      .tab-button {
        flex: 1; text-align: center; padding: 14px 10px;
        color: var(--primary-text-color, #ffffff); font-size: 0.85em;
        font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
        cursor: pointer; transition: background-color 0.2s ease;
        white-space: nowrap; border-bottom: 2px solid transparent;
      }
      .tab-button.active { border-bottom: 2px solid var(--primary-text-color, #ffffff); }
      .tab-button:hover:not(.active) { background: rgba(255, 255, 255, 0.05); }
      .tabs-content { display: flex; flex-direction: column; width: 100%; background: transparent; }
      .tab-pane { flex-direction: column; gap: 8px; width: 100%; padding-top: 8px; }
      .no-cards { text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic; }
    `;
  }
}

/* ==========================================================================
   CARD EDITOR
   ========================================================================== */
class HaPlooumTabsCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
      _selectedTab: { type: Number },
      _selectedCard: { type: Number },
      _addingCard: { type: Boolean },
      _pastingCard: { type: Boolean },
      _pastedCardCode: { type: String },
      _cardSearchQuery: { type: String },
    };
  }

  constructor() {
    super();
    this._addingCard = false;
    this._pastingCard = false;
    this._pastedCardCode = "";
    this._cardSearchQuery = "";
  }

  setConfig(config) {
    this._config = { ...config };
    if (!this._config.tabs) this._config.tabs = [];
  }

  _configChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _addTab() {
    const tabs = [...this._config.tabs, { name: "NEW TAB", cards: [] }];
    this._config = { ...this._config, tabs };
    this._configChanged();
  }

  _removeTab(index) {
    const tabs = [...this._config.tabs];
    tabs.splice(index, 1);
    this._config = { ...this._config, tabs };
    if (this._selectedTab === index) {
      this._selectedTab = undefined;
      this._selectedCard = undefined;
      this._addingCard = false;
      this._pastingCard = false;
    }
    this._configChanged();
  }

  _updateTabName(index, name) {
    const tabs = [...this._config.tabs];
    tabs[index] = { ...tabs[index], name };
    this._config = { ...this._config, tabs };
    this._configChanged();
  }

  async _selectCardType(selectedType) {
    const coreTypes = [
      "tile", "button", "entities", "markdown", "grid", "horizontal-stack", 
      "vertical-stack", "glance", "picture-entity", "picture-elements", "sensor", 
      "history-graph", "gauge", "heading", "conditional", "map", "media-control", 
      "iframe", "alarm-panel", "weather-forecast", "shopping-list"
    ];

    let cardType = selectedType.trim();
    const isCore = coreTypes.includes(cardType);

    if (!isCore && !cardType.startsWith("custom:")) {
      cardType = `custom:${cardType}`;
    }

    let stubConfig = {};
    if (window.loadCardHelpers) {
      try {
        const helpers = await window.loadCardHelpers();
        stubConfig = await helpers.getStubConfig(cardType, this.hass, this.hass.states);
      } catch (err) {
        console.warn("Unable to fetch default configuration:", err);
      }
    }

    const newCard = {
      type: cardType,
      ...stubConfig
    };

    const tabs = [...this._config.tabs];
    const cards = [...(tabs[this._selectedTab].cards || [])];
    cards.push(newCard);
    tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
    
    this._config = { ...this._config, tabs };
    this._selectedCard = cards.length - 1;
    this._addingCard = false;
    this._cardSearchQuery = "";
    this._configChanged();
  }

  async _copyCard(cardConfig) {
    const jsonStr = JSON.stringify(cardConfig, null, 2);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      }
    } catch (err) {
      console.warn("Clipboard write failed:", err);
    }
    window._plooumCopiedCard = JSON.parse(jsonStr);
  }

  async _pasteCardDirect() {
    let text = "";
    let cardConfig = null;

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch (err) {
      console.warn("Clipboard read failed:", err);
    }

    if (text && text.trim()) {
      const trimmed = text.trim();
      try {
        cardConfig = JSON.parse(trimmed);
      } catch (e1) {
        try {
          cardConfig = this._parseYamlCard(trimmed);
        } catch (e2) {
          cardConfig = null;
        }
      }
    }

    if ((!cardConfig || !cardConfig.type) && window._plooumCopiedCard) {
      cardConfig = JSON.parse(JSON.stringify(window._plooumCopiedCard));
    }

    if (cardConfig && typeof cardConfig === "object" && cardConfig.type) {
      const tabs = [...this._config.tabs];
      const cards = [...(tabs[this._selectedTab].cards || [])];
      cards.push(cardConfig);
      tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
      
      this._config = { ...this._config, tabs };
      this._configChanged();
    } else {
      this._pastingCard = true;
    }
  }

  _importPastedCard() {
    if (!this._pastedCardCode || !this._pastedCardCode.trim()) return;
    
    let cardConfig;
    const text = this._pastedCardCode.trim();
    
    try {
      cardConfig = JSON.parse(text);
    } catch (e1) {
      try {
        cardConfig = this._parseYamlCard(text);
      } catch (e2) {
        alert("Invalid YAML or JSON format. Please check your pasted code.");
        return;
      }
    }

    if (!cardConfig || typeof cardConfig !== "object" || !cardConfig.type) {
      alert("The card configuration must at least contain a 'type' property.");
      return;
    }

    const tabs = [...this._config.tabs];
    const cards = [...(tabs[this._selectedTab].cards || [])];
    cards.push(cardConfig);
    tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
    
    this._config = { ...this._config, tabs };
    this._selectedCard = cards.length - 1;
    this._pastingCard = false;
    this._pastedCardCode = "";
    this._configChanged();
  }

  _parseYamlCard(text) {
    const lines = text.split("\n");
    const result = {};
    let currentKey = null;
    let currentList = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      if (trimmed.startsWith("- ")) {
        const itemVal = trimmed.substring(2).trim();
        if (itemVal.includes(":")) {
          const colonIdx = itemVal.indexOf(":");
          const k = itemVal.substring(0, colonIdx).trim();
          const v = itemVal.substring(colonIdx + 1).trim();
          const obj = {};
          obj[k] = this._parseScalar(v);
          if (currentList) currentList.push(obj);
        } else {
          if (currentList) currentList.push(this._parseScalar(itemVal));
        }
      } else if (trimmed.includes(":")) {
        const colonIdx = trimmed.indexOf(":");
        const k = trimmed.substring(0, colonIdx).trim();
        const v = trimmed.substring(colonIdx + 1).trim();
        
        if (v === "") {
          currentKey = k;
          currentList = [];
          result[currentKey] = currentList;
        } else {
          currentKey = null;
          currentList = null;
          result[k] = this._parseScalar(v);
        }
      }
    }
    return result;
  }

  _parseScalar(val) {
    if (val === "true") return true;
    if (val === "false") return false;
    if (val === "null" || val === "") return null;
    if (!isNaN(Number(val))) return Number(val);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      return val.substring(1, val.length - 1);
    }
    return val;
  }

  _removeCard(index) {
    const tabs = [...this._config.tabs];
    const cards = [...tabs[this._selectedTab].cards];
    cards.splice(index, 1);
    tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
    this._config = { ...this._config, tabs };
    this._configChanged();
  }

  _moveCard(index, direction) {
    const tabs = [...this._config.tabs];
    const cards = [...tabs[this._selectedTab].cards];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const [movedCard] = cards.splice(index, 1);
    cards.splice(targetIndex, 0, movedCard);

    tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
    this._config = { ...this._config, tabs };
    this._configChanged();
  }

  _handleCardConfigChanged(ev) {
    ev.stopPropagation();
    if (!this._config) return;

    const tabs = [...this._config.tabs];
    const cards = [...tabs[this._selectedTab].cards];
    
    cards[this._selectedCard] = ev.detail.config;
    tabs[this._selectedTab] = { ...tabs[this._selectedTab], cards };
    
    this._config = { ...this._config, tabs };
    this._configChanged();
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const coreCards = [
      { type: "tile", name: "Tile" },
      { type: "button", name: "Button" },
      { type: "entities", name: "Entities" },
      { type: "markdown", name: "Markdown" },
      { type: "grid", name: "Grid" },
      { type: "horizontal-stack", name: "Horizontal Stack" },
      { type: "vertical-stack", name: "Vertical Stack" },
      { type: "glance", name: "Glance" },
      { type: "picture-entity", name: "Picture Entity" },
      { type: "picture-elements", name: "Picture Elements" },
      { type: "sensor", name: "Sensor" },
      { type: "history-graph", name: "History Graph" },
      { type: "gauge", name: "Gauge" },
      { type: "heading", name: "Heading" },
      { type: "conditional", name: "Conditional" },
      { type: "map", name: "Map" },
      { type: "media-control", name: "Media Control" },
      { type: "iframe", name: "Iframe" },
      { type: "alarm-panel", name: "Alarm Panel" },
      { type: "weather-forecast", name: "Weather Forecast" },
      { type: "shopping-list", name: "Shopping List" }
    ];

    const customCardsList = (window.customCards || []).map(c => ({
      type: c.type,
      name: c.name || c.type
    }));

    const allCards = [...coreCards, ...customCardsList];

    // VIEW 5 : PASTE CARD VIEW
    if (this._selectedTab !== undefined && this._pastingCard) {
      const tab = this._config.tabs[this._selectedTab];
      return html`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => { this._pastingCard = false; this._pastedCardCode = ""; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Paste Card into: ${tab.name}</h3>
        </div>
        
        <div class="card-picker-container">
          <div class="input-field">
            <label>Paste Home Assistant Card YAML or JSON code below:</label>
            <textarea 
              rows="10"
              .value=${this._pastedCardCode}
              @input=${(e) => this._pastedCardCode = e.target.value}
              placeholder="type: tile&#10;entity: light.kitchen&#10;name: Kitchen"
              autofocus
            ></textarea>
          </div>
          <button class="btn primary full-width" @click=${this._importPastedCard}>Import Card</button>
        </div>
      `;
    }

    // VIEW 4 : CARD TYPE PICKER GALLERY
    if (this._selectedTab !== undefined && this._addingCard) {
      const tab = this._config.tabs[this._selectedTab];
      const query = (this._cardSearchQuery || "").toLowerCase();
      const filteredCards = allCards.filter(c => 
        c.name.toLowerCase().includes(query) || c.type.toLowerCase().includes(query)
      );

      return html`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => { this._addingCard = false; this._cardSearchQuery = ""; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Choose a card for: ${tab.name}</h3>
        </div>
        
        <div class="card-picker-container">
          <div class="input-field">
            <input 
              type="text" 
              .value=${this._cardSearchQuery} 
              @input=${(e) => this._cardSearchQuery = e.target.value}
              placeholder="🔍 Search a card (e.g. tile, mushroom, webrtc...)"
              autofocus
            />
          </div>

          <div class="card-types-list">
            ${filteredCards.length === 0 ? html`
              <div class="empty-state">
                <p>No cards found.</p>
                ${this._cardSearchQuery ? html`
                  <button class="btn primary" @click=${() => this._selectCardType(this._cardSearchQuery)}>
                    Use type: "${this._cardSearchQuery}"
                  </button>
                ` : ""}
              </div>
            ` : ""}

            ${filteredCards.map(card => html`
              <div class="card-type-item" @click=${() => this._selectCardType(card.type)}>
                <div class="card-type-name">${card.name}</div>
                <div class="card-type-id">${card.type}</div>
              </div>
            `)}
          </div>
        </div>
      `;
    }

    // VIEW 3 : NATIVE CARD EDITOR
    if (this._selectedTab !== undefined && this._selectedCard !== undefined) {
      const tab = this._config.tabs[this._selectedTab];
      const cardConfig = tab.cards[this._selectedCard] || { type: "tile" };
      
      return html`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => this._selectedCard = undefined}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Edit Card (${cardConfig.type})</h3>
        </div>
        
        <div class="card-editor-container">
          <hui-card-element-editor
            .hass=${this.hass}
            .value=${cardConfig}
            @config-changed=${this._handleCardConfigChanged}
          ></hui-card-element-editor>
        </div>
      `;
    }

    // VIEW 2 : TAB CARDS LIST
    if (this._selectedTab !== undefined) {
      const tab = this._config.tabs[this._selectedTab];
      const cards = tab.cards || [];
      
      return html`
        <div class="header-nav">
          <button class="icon-btn" @click=${() => this._selectedTab = undefined}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <h3>Cards in tab: ${tab.name}</h3>
        </div>
        
        <div class="list-container">
          ${cards.length === 0 ? html`<p class="empty-state">No cards in this tab.</p>` : ""}
          ${cards.map((card, index) => html`
            <div class="list-item">
              <div class="item-info">
                <strong>${card.type ? card.type.replace("custom:", "") : "Card"}</strong>
              </div>
              <div class="item-actions">
                <button class="icon-btn" @click=${() => this._moveCard(index, -1)} ?disabled=${index === 0} title="Move Up">
                  <ha-icon icon="mdi:arrow-up"></ha-icon>
                </button>
                <button class="icon-btn" @click=${() => this._moveCard(index, 1)} ?disabled=${index === cards.length - 1} title="Move Down">
                  <ha-icon icon="mdi:arrow-down"></ha-icon>
                </button>
                <button class="icon-btn" @click=${() => this._copyCard(card)} title="Copy Card">
                  <ha-icon icon="mdi:content-copy"></ha-icon>
                </button>
                <button class="icon-btn" @click=${() => this._selectedCard = index} title="Edit">
                  <ha-icon icon="mdi:pencil"></ha-icon>
                </button>
                <button class="icon-btn danger" @click=${() => this._removeCard(index)} title="Delete">
                  <ha-icon icon="mdi:delete"></ha-icon>
                </button>
              </div>
            </div>
          `)}
        </div>
        
        <div class="button-row">
          <button class="btn primary" @click=${() => this._addingCard = true}>+ Add Card</button>
          <button class="btn" @click=${this._pasteCardDirect}>📋 Paste Card</button>
        </div>
      `;
    }

    // VIEW 1 : GLOBAL SETTINGS AND TABS LIST
    const activeTabBg = this._config.active_tab_bg || "rgba(255, 255, 255, 0)";
    const tabsBg = this._config.tabs_background || "rgba(0, 0, 0, 0)";
    const tabs = this._config.tabs || [];

    return html`
      <div class="global-settings">
        <h3>Global Settings</h3>
        <div class="input-field">
          <label>Active tab background color</label>
          <input 
            type="text" 
            .value=${activeTabBg} 
            @change=${(e) => { this._config = { ...this._config, active_tab_bg: e.target.value }; this._configChanged(); }}
          />
        </div>
        <div class="input-field">
          <label>Global tabs bar background</label>
          <input 
            type="text" 
            .value=${tabsBg} 
            @change=${(e) => { this._config = { ...this._config, tabs_background: e.target.value }; this._configChanged(); }}
          />
        </div>
      </div>

      <hr />

      <div class="header-section">
        <h3>Tabs</h3>
        <button class="btn primary" @click=${this._addTab}>+ Add</button>
      </div>

      <div class="list-container">
        ${tabs.length === 0 ? html`<p class="empty-state">No tabs configured.</p>` : ""}
        ${tabs.map((tab, index) => html`
          <div class="list-item">
            <input 
              type="text" 
              .value=${tab.name} 
              @input=${(e) => this._updateTabName(index, e.target.value)} 
              class="tab-name-input"
              placeholder="Tab name"
            />
            <div class="item-actions">
              <button class="btn" @click=${() => this._selectedTab = index}>
                Cards (${tab.cards ? tab.cards.length : 0})
              </button>
              <button class="icon-btn danger" @click=${() => this._removeTab(index)} title="Delete tab">
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
            </div>
          </div>
        `)}
      </div>
    `;
  }

  static get styles() {
    return css`
      .global-settings { margin-bottom: 16px; }
      h3 { margin: 0; font-size: 1.1em; color: var(--primary-text-color); }
      .header-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--divider-color); padding-bottom: 8px; }
      .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      
      .input-field { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; margin-bottom: 12px; }
      label { font-size: 0.85em; color: var(--secondary-text-color); }
      input[type="text"] {
        width: 100%; padding: 10px; border-radius: 6px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000); box-sizing: border-box; font-size: 14px;
      }
      textarea {
        width: 100%; padding: 10px; border-radius: 6px;
        border: 1px solid var(--divider-color, #ccc);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000); box-sizing: border-box; font-size: 13px;
        font-family: monospace; resize: vertical;
      }

      .card-picker-container { display: flex; flex-direction: column; gap: 8px; max-height: 400px; }
      .card-types-list { 
        display: flex; flex-direction: column; gap: 4px; 
        max-height: 320px; overflow-y: auto; padding-right: 4px; 
      }
      .card-type-item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 12px; background: var(--secondary-background-color);
        border-radius: 6px; cursor: pointer; border: 1px solid var(--divider-color);
        transition: background 0.2s;
      }
      .card-type-item:hover {
        background: var(--primary-color); color: var(--text-primary-color);
        border-color: var(--primary-color);
      }
      .card-type-item:hover .card-type-id {
        color: var(--text-primary-color); opacity: 0.8;
      }
      .card-type-name { font-weight: 600; font-size: 13px; }
      .card-type-id { font-size: 11px; font-family: monospace; color: var(--secondary-text-color); }

      .list-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
      .list-item { 
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        background: var(--secondary-background-color); padding: 6px 8px 6px 12px; 
        border-radius: 6px; border: 1px solid var(--divider-color); 
      }
      .item-info { flex: 1; font-size: 14px; color: var(--primary-text-color); }
      .tab-name-input { 
        font-weight: bold; font-size: 14px; border: none !important; 
        background: transparent !important; color: var(--primary-text-color) !important; 
        width: 100%; padding: 4px !important; border-bottom: 1px solid transparent !important; border-radius: 0 !important;
      }
      .tab-name-input:focus { border-bottom: 1px solid var(--primary-color) !important; outline: none; }
      .item-actions { display: flex; align-items: center; gap: 4px; }
      
      .icon-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 50%;
        transition: background 0.2s;
      }
      .icon-btn:hover { background: var(--divider-color); }
      .icon-btn:disabled { opacity: 0.3; cursor: default; }
      .icon-btn:disabled:hover { background: transparent; }
      .icon-btn.danger:hover { color: var(--error-color, #db4437); }
      
      .btn {
        background: var(--card-background-color); border: 1px solid var(--divider-color);
        color: var(--primary-text-color); padding: 8px 14px; border-radius: 4px; 
        cursor: pointer; font-size: 13px; font-weight: 500;
      }
      .btn:hover { background: var(--secondary-background-color); }
      .btn.primary { background: var(--primary-color); color: var(--text-primary-color); border: none; }
      .btn.full-width { width: 100%; margin-top: 8px; padding: 10px; font-weight: bold; }
      .button-row { display: flex; gap: 8px; margin-top: 8px; }
      .button-row .btn { flex: 1; }
      
      .empty-state { text-align: center; color: var(--secondary-text-color); font-style: italic; margin: 16px 0; }
      hr { border: none; border-top: 1px solid var(--divider-color); margin: 16px 0; }
    `;
  }
}

/* ==========================================================================
   HOME ASSISTANT REGISTRATION
   ========================================================================== */
if (!customElements.get('ha-plooum-tabs-card')) {
  customElements.define('ha-plooum-tabs-card', HaPlooumTabsCard);
}
if (!customElements.get('ha-plooum-tabs-card-editor')) {
  customElements.define('ha-plooum-tabs-card-editor', HaPlooumTabsCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'ha-plooum-tabs-card')) {
  window.customCards.push({
    type: 'ha-plooum-tabs-card',
    name: 'Ha Plooum Tabs Card',
    description: 'A tabbed card that preserves state and supports all Lovelace cards (core and HACS).',
    preview: true,
  });
}