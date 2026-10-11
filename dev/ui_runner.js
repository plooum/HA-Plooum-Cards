// Live UI test runner: runs a suite of dev/tests/<name>.json in a same-origin iframe, one fresh page
// load per test, with the step semantics documented in dev/ui_test.py. Opened by the built-in browser
// pane (runner.html?suite=<name>[&only=<substring>][&pause=<ms>]) and, headless, by dev/ui_test.py
// (which adds &headless=1&index=<i>; there a `shot` step publishes window.uiShot and waits for
// Python to take the screenshot and call window.uiShotResolve()). Result: window.uiResult.
(() => {
  const q = new URLSearchParams(location.search);
  const headless = q.get('headless') === '1';
  const pause = Number(q.get('pause') || 0);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // Noise from HA itself / the environment, not from our cards (same list as dev/shot.py, plus the benign ResizeObserver window event that Playwright's pageerror never reported).
  const IGNORED = ['favicon', 'manifest', 'service worker', 'serviceworker', 'resizeobserver loop'];
  const $ = (id) => document.getElementById(id);
  const short = (v, n = 600) => {
    let s;
    try { s = JSON.stringify(v); } catch (e) { s = String(v); }
    s = s === undefined ? 'undefined' : s;
    return s.length <= n ? s : s.slice(0, n) + '...';
  };

  // Compiles and runs a step body in the iframe's realm, with the helpers as local names.
  const runCode = async (win, code, asExpr) => {
    const AsyncFunction = Object.getPrototypeOf(win.eval('(async function () {})')).constructor;
    const pre = 'const {' + Object.keys(win.T).filter((k) => /^[A-Za-z_]+$/.test(k) && k !== 's').join(',') + '} = T; const S = T.s;\n';
    let fn = null;
    if (asExpr) {
      try { fn = new AsyncFunction(pre + 'return (' + code + '\n);'); } catch (e) { fn = null; }
    }
    if (!fn) fn = new AsyncFunction(pre + code);
    return await fn();
  };

  // True once HA is connected and every card has rendered (synchronous, evaluated in the iframe).
  const ready = (win) => {
    const doc = win.document;
    const ha = doc.querySelector('home-assistant');
    if (!(ha && ha.hass && ha.hass.connected)) return false;
    const cards = win.T.deep(doc, '*').filter((e) => /^ha-plooum-.*-card$/.test(e.localName));
    const wrappers = win.T.deep(doc, 'hui-card');
    return cards.length > 0 && wrappers.every((w) => w._element) && cards.every((c) => c.shadowRoot && c.shadowRoot.children.length > 0);
  };

  const fit = (vw, vh) => {
    const frame = $('frame');
    const stage = $('stage');
    let s = 1;
    if (!headless) s = Math.min(1, (stage.clientWidth - 20) / vw, (stage.clientHeight - 20) / vh);
    frame.style.width = vw + 'px';
    frame.style.height = vh + 'px';
    frame.style.transform = `scale(${s})`;
    $('wrap').style.width = vw * s + 'px';
    $('wrap').style.height = vh * s + 'px';
    return s;
  };

  // Loads `path` in the iframe; resolves with its window once the new document has loaded.
  const loadFrame = (path, errors) => {
    const frame = $('frame');
    const patch = () => {
      const w = frame.contentWindow;
      if (!w || w.__uiPatched || w.location.href === 'about:blank') return;
      w.__uiPatched = true;
      const orig = w.console.error.bind(w.console);
      w.console.error = (...a) => { errors.push('console.error: ' + a.map((x) => (x && x.message) || String(x)).join(' ')); orig(...a); };
      w.addEventListener('error', (e) => errors.push('pageerror: ' + (e.message || e.type)));
      w.addEventListener('unhandledrejection', (e) => errors.push('pageerror: ' + String((e.reason && e.reason.message) || e.reason)));
    };
    const timer = setInterval(patch, 5);
    return new Promise((resolve) => {
      frame.onload = () => {
        if (frame.contentWindow.location.href === 'about:blank') return;
        clearInterval(timer);
        patch();
        resolve(frame.contentWindow);
      };
      frame.src = 'about:blank';
      setTimeout(() => { frame.src = path; }, 0);
    });
  };

  const run = async () => {
    const name = q.get('suite');
    if (headless) document.body.classList.add('headless');
    if (!name) { $('summary').textContent = 'Missing ?suite=<name> (dev/tests/<name>.json)'; return; }
    $('title').textContent = 'Suite: ' + name;
    const helpers = await (await fetch('ui_helpers.js', { cache: 'no-store' })).text();
    const text = await (await fetch(`tests/${encodeURIComponent(name)}.json`, { cache: 'no-store' })).text();
    const suite = JSON.parse(text.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n'));
    let tests = suite.tests;
    if (q.get('index') !== null) tests = [tests[Number(q.get('index'))]];
    else if (q.get('only')) tests = tests.filter((t) => t.name.toLowerCase().includes(q.get('only').toLowerCase()));

    const rows = tests.map((t) => {
      const el = document.createElement('div');
      el.className = 't';
      el.innerHTML = '<span class="m">...</span><span class="time"></span><span class="n"></span><div class="step"></div><div class="d"></div>';
      el.querySelector('.n').textContent = t.name;
      $('list').appendChild(el);
      return el;
    });
    const total0 = performance.now();
    const results = [];
    let failed = 0;
    let errorCount = 0;
    const setSummary = () => { $('summary').textContent = `${results.length}/${tests.length} done, ${failed} failed`; };
    setSummary();

    for (let ti = 0; ti < tests.length; ti++) {
      const test = tests[ti];
      const row = rows[ti];
      row.className = 't running';
      row.querySelector('.m').textContent = 'RUN';
      row.scrollIntoView({ block: 'nearest' });
      const t0 = performance.now();
      const errors = [];
      const prints = [];
      let failure = null;
      const [vw, vh] = test.viewport || suite.viewport || [1700, 1050];
      const scale = fit(vw, vh);
      const stepLabel = (t) => { row.querySelector('.step').textContent = t; };
      let win = null;
      try {
        win = await loadFrame(location.origin + (test.path || suite.path), errors);
        win.eval(helpers);
        const t1 = performance.now();
        for (;;) {
          if (!win.T) win.eval(helpers); // the page replaced its document
          let ok = false;
          try { ok = ready(win); } catch (e) { ok = false; }
          if (ok) break;
          if (performance.now() - t1 > 20000) throw new Error('timeout (20000 ms) waiting for page ready');
          await sleep(50);
        }
      } catch (e) {
        failure = ['page load', 'page not ready: ' + e.message, null];
      }
      const steps = failure ? [] : test.steps;
      for (let i = 0; i < steps.length && !failure; i++) {
        const step = steps[i];
        const label = `step ${i + 1}`;
        stepLabel(`${label}/${steps.length}`);
        try {
          if (step.wait) await sleep(step.wait);
          if (step.js) {
            const v = await runCode(win, step.js, false);
            if (step.print || q.get('verbose') === '1') prints.push(`${label}: ${short(v)}`);
          } else if (step.assert) {
            const v = await runCode(win, step.assert, true);
            if (!v) {
              const got = { value: v };
              if (step.show) got.show = await runCode(win, step.show, true);
              failure = [label, step.msg || step.assert, got];
            }
          } else if (step.shot) {
            if (!headless) {
              console.log(`shot skipped: ${step.shot}`);
            } else {
              let rect = null;
              if (step.el) {
                const b = await runCode(win, 'const e = (' + step.el + '); const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height};', false);
                rect = { x: b.x * scale, y: b.y * scale, width: b.width * scale, height: b.height * scale };
              }
              await new Promise((resolve) => { window.uiShotResolve = resolve; window.uiShot = { name: step.shot, rect }; });
              window.uiShot = null;
            }
          }
        } catch (e) {
          failure = [label, (e && e.message ? String(e.message).split('\n')[0] : '') || String(e), null];
        }
        if (!failure && pause) await sleep(pause);
      }
      const errs = errors.filter((e) => !IGNORED.some((k) => e.toLowerCase().includes(k)));
      errorCount += errs.length;
      const bad = !!failure || errs.length > 0;
      if (bad) failed++;
      const seconds = (performance.now() - t0) / 1000;
      results.push({
        name: test.name, ok: !bad, seconds: Math.round(seconds * 10) / 10,
        failedStep: failure ? failure[0] : null, message: failure ? failure[1] : null, got: failure ? failure[2] : null, errors: errs, prints,
      });
      row.className = 't ' + (bad ? 'fail' : 'pass');
      row.querySelector('.m').textContent = bad ? 'FAIL' : 'PASS';
      row.querySelector('.time').textContent = seconds.toFixed(1) + 's';
      stepLabel(failure ? failure[0] : '');
      row.querySelector('.d').textContent = [failure ? failure[1] + (failure[2] ? '\ngot: ' + short(failure[2]) : '') : '', ...errs.map((e) => 'console: ' + e.slice(0, 400))].filter(Boolean).join('\n');
      setSummary();
    }
    const total = (performance.now() - total0) / 1000;
    const n = tests.length;
    const summary = `${n - failed}/${n} passed, ${failed} failed, ${errorCount} console error(s), total ${total.toFixed(1)}s`;
    $('summary').textContent = summary;
    document.title = (failed ? 'FAIL ' : 'PASS ') + summary;
    window.uiResult = { passed: n - failed, failed, errors: errorCount, total: Math.round(total * 10) / 10, summary, tests: results };
  };

  run().catch((e) => {
    $('summary').textContent = 'Runner error: ' + e.message;
    window.uiResult = { passed: 0, failed: 1, errors: 0, summary: 'Runner error: ' + e.message, tests: [] };
  });
})();
