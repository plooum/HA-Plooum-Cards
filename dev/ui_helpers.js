// Helpers injected into every page by dev/ui_test.py (add_init_script), all on window.T.
// A suite step's JS body sees them as plain names (deep, sleep, waitFor, ...) and the floorplan
// ones as T.fp.*. T.s is a scratch object that lives as long as the page (use it to pass values
// between steps of one test). Edit here to add a helper: one place, every suite gets it.
(() => {
  const T = (window.T = { s: {}, fp: {} });

  // --- generic ---------------------------------------------------------------

  // Every element matching ONE simple selector, through shadow roots (a descendant combinator
  // doesn't cross them: walk with deep() twice).
  T.deep = (root, sel, out = []) => {
    root.querySelectorAll('*').forEach((e) => {
      if (e.matches(sel)) out.push(e);
      if (e.shadowRoot) T.deep(e.shadowRoot, sel, out);
    });
    return out;
  };

  T.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Polls fn() every 50 ms until it returns something truthy (returned). `what` names what is awaited.
  T.waitFor = async (fn, timeout = 8000, what = 'condition') => {
    const t0 = performance.now();
    for (;;) {
      let v;
      try {
        v = await fn();
      } catch (e) {
        v = null;
      }
      if (v) return v;
      if (performance.now() - t0 > timeout) throw new Error(`timeout (${timeout} ms) waiting for ${what}`);
      await T.sleep(50);
    }
  };

  // Drags `el` from `from` to `to` ({x, y} in client px; default: the center of `el`, from there).
  // Stubs setPointerCapture (it throws on a made-up pointerId). pointerdown goes to opts.target (default el),
  // pointermove / pointerup to el: the element holding the handlers.
  T.pointerDrag = async (el, from, to, { target, steps = 4, pointerId = 7 } = {}) => {
    el.setPointerCapture = () => {};
    el.releasePointerCapture = () => {};
    if (!from) {
      const r = el.getBoundingClientRect();
      from = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }
    const o = { bubbles: true, composed: true, pointerId, button: 0, isPrimary: true, pointerType: 'mouse' };
    (target || el).dispatchEvent(new PointerEvent('pointerdown', { ...o, buttons: 1, clientX: from.x, clientY: from.y }));
    for (let i = 1; i <= steps; i++) {
      const k = i / steps;
      el.dispatchEvent(new PointerEvent('pointermove', { ...o, buttons: 1, clientX: from.x + (to.x - from.x) * k, clientY: from.y + (to.y - from.y) * k }));
    }
    el.dispatchEvent(new PointerEvent('pointerup', { ...o, buttons: 0, clientX: to.x, clientY: to.y }));
    await T.sleep(0);
  };

  T.tap = (el) => {
    el.click();
    return T.sleep(0);
  };

  const center = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  };

  // --- the card editor dialog ------------------------------------------------

  const dialog = () => T.deep(document, 'hui-dialog-edit-card')[0] || null;
  const isCard = (e) => e.tagName.startsWith('HA-PLOOUM') && e.tagName.endsWith('-CARD');
  const isEditor = (e) => e.tagName.startsWith('HA-PLOOUM') && e.tagName.endsWith('-CARD-EDITOR');

  // The open dialog's card editor (null when none).
  T.editor = () => {
    const dlg = dialog();
    return dlg ? T.deep(dlg.shadowRoot, '*').find(isEditor) || null : null;
  };

  // Clicks the first card's Edit / Modifier button, waits for the dialog and, for a stack, selects
  // card `stackIndex` (0-based). Returns the card's editor. Also kept on window.__ed.
  T.openEditor = async (stackIndex = null) => {
    const btn = await T.waitFor(
      () => T.deep(document, 'ha-button').find((b) => ['Edit', 'Modifier'].includes(b.textContent.trim())),
      8000,
      'the Edit button'
    );
    btn.click();
    if (stackIndex !== null) {
      const stack = await T.waitFor(() => T.deep(document, 'hui-stack-card-editor')[0], 8000, 'the stack editor');
      stack._selectedCard = stackIndex;
      stack.requestUpdate();
      await stack.updateComplete;
    }
    const ed = await T.waitFor(
      () => {
        const e = T.editor();
        return e && e.hass && e._config && e.shadowRoot && e.shadowRoot.children.length ? e : null;
      },
      8000,
      'the card editor'
    );
    await ed.updateComplete;
    window.__ed = ed;
    return ed;
  };

  // The card element with this title inside the dialog's preview. `card.preview` can't tell it from
  // the dashboard cards behind the dialog (also true in edit mode): this looks only inside the dialog.
  T.previewCard = (title) => {
    const dlg = dialog();
    if (!dlg) return null;
    return T.deep(dlg.shadowRoot, '*').find((e) => isCard(e) && e.config && e.config.title === title) || null;
  };

  // The dashboard's cards (not the ones in the dialog).
  T.dashboardCards = (tag = 'ha-plooum-floorplan-card') => {
    const dlg = dialog();
    return T.deep(document, tag).filter((c) => !(dlg && isInside(c, dlg)));
  };
  const isInside = (node, dlg) => {
    for (let n = node; n; n = n.parentNode || n.host) if (n === dlg) return true;
    return false;
  };

  // Clicks the dialog's Cancel button and waits until the editor is gone.
  T.cancelDialog = async () => {
    const dlg = dialog();
    const btn = T.deep(dlg.shadowRoot, 'ha-button').find((b) => ['Cancel', 'Annuler'].includes(b.textContent.trim()));
    if (!btn) throw new Error('no Cancel button in the dialog');
    btn.click();
    await T.waitFor(() => !T.editor(), 8000, 'the dialog to close');
  };

  // --- any card (smoke tests) ---------------------------------------------------

  T.card = {};

  T.hass = () => document.querySelector('home-assistant').hass;

  // The page's cards of this tag.
  T.card.all = (tag) => T.deep(document, tag);

  // Waits for at least `count` cards of this tag, each rendered (content in its shadow root), and
  // throws if a hui-error-card is on the page. Returns the cards.
  T.card.rendered = async (tag, count = 1) => {
    const cards = await T.waitFor(
      () => {
        const c = T.card.all(tag);
        return c.length >= count && c.every((e) => e.shadowRoot && e.shadowRoot.children.length > 0) ? c : null;
      },
      8000,
      `${count} rendered ${tag}`
    );
    const err = T.deep(document, 'hui-error-card');
    if (err.length) throw new Error(`${err.length} hui-error-card on the page`);
    return cards;
  };

  T.card.call = (domain, service, data) => T.hass().callService(domain, service, data);

  // Waits until predicate(state object) is truthy for the entity; returns the state object.
  T.card.waitState = (entity, predicate, timeout = 8000) =>
    T.waitFor(
      () => {
        const st = T.hass().states[entity];
        return st && predicate(st) ? st : null;
      },
      timeout,
      `${entity} to match`
    );

  // Builds the card's editor like the edit dialog does (without opening it), checks that it
  // rendered something, removes it. Returns the number of elements in its shadow root.
  T.card.editorRenders = async (card) => {
    const ed = await customElements.get(card.localName).getConfigElement();
    ed.hass = T.hass();
    ed.setConfig(card.config);
    card.parentNode.append(ed); // inside the app, so HA's context (localize...) reaches the editor's pickers
    try {
      await ed.updateComplete;
      const n = ed.shadowRoot ? ed.shadowRoot.querySelectorAll('*').length : 0;
      if (n < 3) throw new Error(`editor of ${card.localName} rendered ${n} elements`);
      return n;
    } finally {
      ed.remove();
    }
  };

  // --- floorplan card ---------------------------------------------------------

  const Card = () => customElements.get('ha-plooum-floorplan-card');

  // Waits until a card's 3D view has stopped easing towards its orbit.
  T.fp.waitIdle = (card, timeout = 4000) =>
    T.waitFor(
      () => !card._easeFrame && (!card._orbitAnim || card._orbitAt(card._orbitAnim, performance.now()) === card._orbitAnim.to),
      timeout,
      'the 3D view to stop animating'
    );

  // Selects an entity of the editor's current floor and (option advanced) opens its Advanced panel;
  // waits for the camera view if the entity is a camera. Returns the editor.
  T.fp.selectEntity = async (entityId, { advanced = false } = {}) => {
    const ed = window.__ed || T.editor();
    const i = ed._config.floors[0].entities.findIndex((e) => e.entity === entityId);
    if (i < 0) throw new Error(`no entity ${entityId} on the first floor`);
    ed._selection = { kind: 'entity', index: i };
    ed._cameraAdvanced = !!advanced;
    await ed.updateComplete;
    if (advanced && entityId.startsWith('camera.')) {
      await T.waitFor(() => T.deep(ed.shadowRoot, '.cv')[0], 8000, `the camera view of ${entityId}`);
    }
    return ed;
  };

  const corner = (index) => {
    const ed = window.__ed;
    const cv = T.deep(ed.shadowRoot, '.cv')[0];
    const c = T.deep(ed.shadowRoot, '.cv-corner')[index];
    if (!cv || !c) throw new Error(`no camera view corner ${index}`);
    return { cv, c, p: center(c) };
  };

  // Drags camera-view corner `index` by (dx, dy) px and drops it.
  T.fp.dropCorner = async (index, dx = 10, dy = 6) => {
    const { cv, c, p } = corner(index);
    await T.pointerDrag(cv, p, { x: p.x + dx, y: p.y + dy }, { target: c });
    await window.__ed.updateComplete;
  };

  // Moves the corner by >= 4 px (the editor ignores smaller moves: a tap) and back to where it was.
  T.fp.dropCornerInPlace = async (index) => {
    const { cv, c, p } = corner(index);
    const o = { bubbles: true, composed: true, pointerId: 7, button: 0, isPrimary: true, buttons: 1 };
    cv.setPointerCapture = () => {};
    cv.releasePointerCapture = () => {};
    c.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: p.x, clientY: p.y }));
    cv.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: p.x + 8, clientY: p.y + 5 }));
    cv.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: p.x, clientY: p.y }));
    cv.dispatchEvent(new PointerEvent('pointerup', { ...o, buttons: 0, clientX: p.x, clientY: p.y }));
    await window.__ed.updateComplete;
  };

  // Drags the camera's picture (not a corner) by (dx, dy) px: turns the camera while nothing is pinned.
  T.fp.dragPicture = async (dx = 30, dy = 10) => {
    const cv = T.deep(window.__ed.shadowRoot, '.cv')[0];
    if (!cv) throw new Error('no camera view');
    const c = center(cv);
    await T.pointerDrag(cv, c, { x: c.x + dx, y: c.y + dy });
    await window.__ed.updateComplete;
  };

  // Turns a floorplan card's 3D view by dragging it (a user gesture: it ends the setup view).
  T.fp.orbitDrag = async (card, dx = 80, dy = 20) => {
    const el = await T.waitFor(() => T.deep(card.shadowRoot, '.view3d')[0], 8000, 'the 3D view');
    await T.pointerDrag(el, null, { x: center(el).x + dx, y: center(el).y + dy });
    await card.updateComplete;
  };

  // The setup badge's text in a card (e.g. "Setup · Garden Camera — south facade", "Free view"), or null.
  T.fp.setupBadge = (card) => {
    const b = card && card.shadowRoot && card.shadowRoot.querySelector('.setup-badge');
    return b ? b.textContent.replace(/\s+/g, ' ').trim() : null;
  };

  // The module's map of editor dialogs still holding setup state (empty once all are closed).
  T.fp.setupState = () => Card().setupDialogs;

  // The dashboard's floorplan cards' view state (by title), to compare at the end of a test with
  // T.fp.unchanged(snap). The dashboard renders some cards lazily: only the ones present in the
  // snapshot are compared.
  T.fp.snapshot = () => {
    const out = {};
    for (const c of T.dashboardCards()) {
      const k = (c.config && c.config.title) || '?';
      out[k] = JSON.stringify({ view: c._view, orbit: c._orbit, level: c._level3d });
    }
    return out;
  };

  T.fp.unchanged = (snap) => {
    const now = T.fp.snapshot();
    return Object.keys(snap).length > 0 && Object.keys(snap).every((k) => now[k] === snap[k]);
  };
})();
