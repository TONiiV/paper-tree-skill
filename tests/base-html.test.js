const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const HTML_PATH = path.join(__dirname, '..', 'base.html');
const html = fs.readFileSync(HTML_PATH, 'utf-8');

// ---------------------------------------------------------------------------
// Helper: create a live JSDOM window from the template HTML
// ---------------------------------------------------------------------------
function createDOM() {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'http://localhost',
  });
  return dom;
}

// ===========================================================================
// 1. HTML Structure Tests
// ===========================================================================
describe('HTML structure', () => {
  let doc;
  it('parses without errors', () => {
    const dom = new JSDOM(html);
    doc = dom.window.document;
    assert.ok(doc.documentElement);
  });

  it('has required layout elements', () => {
    const dom = new JSDOM(html);
    doc = dom.window.document;
    for (const id of ['header', 'sidebar', 'shell', 'viewport', 'canvas', 'svg', 'panel', 'xaxis', 'yaxis']) {
      assert.ok(doc.getElementById(id), `Missing element #${id}`);
    }
  });

  it('has zoom control buttons in the header', () => {
    const dom = new JSDOM(html);
    doc = dom.window.document;
    const btns = doc.querySelectorAll('#header-meta .zoom-controls .zoom-btn');
    assert.ok(btns.length >= 3, `Expected at least 3 zoom buttons, got ${btns.length}`);
    const labels = [...btns].map(b => b.textContent.trim());
    assert.ok(labels.some(l => l === '+'), 'Missing + button');
    assert.ok(labels.some(l => l === 'Reset'), 'Missing Reset button');
    // minus sign can be − entity or literal
    assert.ok(labels.some(l => l === '−' || l === '-'), 'Missing − button');
  });

  it('hint text mentions scroll to zoom', () => {
    const dom = new JSDOM(html);
    doc = dom.window.document;
    const hint = doc.querySelector('.hm-hint');
    assert.ok(hint, 'Missing .hm-hint element');
    assert.ok(hint.textContent.includes('scroll to zoom'), `Hint text missing "scroll to zoom": "${hint.textContent}"`);
  });

  it('has zoom-btn CSS rules in the stylesheet', () => {
    assert.ok(html.includes('.zoom-btn{') || html.includes('.zoom-btn {'), 'Missing .zoom-btn CSS rule');
    assert.ok(html.includes('.zoom-controls{') || html.includes('.zoom-controls {'), 'Missing .zoom-controls CSS rule');
  });
});

// ===========================================================================
// 2. JavaScript Engine Tests (runs the <script> in JSDOM)
// ===========================================================================
describe('JS engine — state and functions', () => {
  let win;

  it('initializes without JS errors', () => {
    const dom = createDOM();
    win = dom.window;
    // If the script threw, JSDOM would have errored. Check key globals exist.
    assert.strictEqual(typeof win.scale, 'number');
    assert.strictEqual(typeof win.panX, 'number');
    assert.strictEqual(typeof win.panY, 'number');
  });

  it('scale defaults to 1', () => {
    const dom = createDOM();
    assert.strictEqual(dom.window.scale, 1);
  });

  it('exposes applyTransform function', () => {
    const dom = createDOM();
    assert.strictEqual(typeof dom.window.applyTransform, 'function');
  });

  it('exposes applyZoom function', () => {
    const dom = createDOM();
    assert.strictEqual(typeof dom.window.applyZoom, 'function');
  });

  it('exposes zoomBtn function', () => {
    const dom = createDOM();
    assert.strictEqual(typeof dom.window.zoomBtn, 'function');
  });

  it('exposes resetZoom function', () => {
    const dom = createDOM();
    assert.strictEqual(typeof dom.window.resetZoom, 'function');
  });

  it('does NOT expose old applyPan function', () => {
    const dom = createDOM();
    assert.strictEqual(typeof dom.window.applyPan, 'undefined', 'applyPan should have been renamed to applyTransform');
  });
});

// ===========================================================================
// 3. Zoom Logic Tests
// ===========================================================================
describe('Zoom logic', () => {
  it('applyZoom changes scale', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(1.5, 0, 0);
    assert.strictEqual(win.scale, 1.5);
  });

  it('applyZoom clamps scale to max 2.0', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(5.0, 0, 0);
    assert.strictEqual(win.scale, 2.0);
  });

  it('applyZoom clamps scale to min 0.3', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(0.1, 0, 0);
    assert.ok(Math.abs(win.scale - 0.3) < 0.001, `Expected 0.3, got ${win.scale}`);
  });

  it('applyZoom adjusts pan so zoom centers on given point', () => {
    const dom = createDOM();
    const win = dom.window;
    // Start at pan 0,0 scale 1
    const cx = 100, cy = 100;
    const newScale = 2.0;
    // Expected: ratio = 2/1 = 2, newPanX = 100 - 2*(100-0) = -100
    win.applyZoom(newScale, cx, cy);
    // Pan gets clamped, but the direction should be correct (negative)
    assert.ok(win.panX <= 0, `panX should be <= 0 after zooming in, got ${win.panX}`);
    assert.ok(win.panY <= 0, `panY should be <= 0 after zooming in, got ${win.panY}`);
  });

  it('resetZoom restores scale to 1', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(1.8, 50, 50);
    assert.notStrictEqual(win.scale, 1);
    win.resetZoom();
    assert.strictEqual(win.scale, 1);
  });

  it('resetZoom resets pan to clamped (0,0)', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(1.5, 100, 100);
    win.resetZoom();
    // After reset, pan should be 0,0 (or clamped equivalent for small viewports)
    assert.strictEqual(win.panX, 0);
    assert.strictEqual(win.panY, 0);
  });

  it('successive zooms compound correctly', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(1.2, 0, 0);
    assert.ok(Math.abs(win.scale - 1.2) < 0.001);
    win.applyZoom(win.scale * 1.1, 0, 0);
    assert.ok(Math.abs(win.scale - 1.32) < 0.01, `Expected ~1.32, got ${win.scale}`);
  });
});

// ===========================================================================
// 4. Transform Application Tests
// ===========================================================================
describe('Canvas transform', () => {
  it('applyTransform sets translate + scale on canvas element', () => {
    const dom = createDOM();
    const win = dom.window;
    win.scale = 1.5;
    win.applyTransform(10, 20);
    const canvas = win.document.getElementById('canvas');
    const t = canvas.style.transform;
    assert.ok(t.includes('scale(1.5)'), `Transform should include scale(1.5): "${t}"`);
    assert.ok(t.includes('translate('), `Transform should include translate: "${t}"`);
  });

  it('canvas has transformOrigin set to 0 0', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyTransform(0, 0);
    const canvas = win.document.getElementById('canvas');
    assert.ok(
      canvas.style.transformOrigin.includes('0') || canvas.style.transformOrigin === '0px 0px',
      `transformOrigin should be "0 0", got "${canvas.style.transformOrigin}"`
    );
  });
});

// ===========================================================================
// 5. Axis Scaling Tests
// ===========================================================================
describe('Axis labels track zoom', () => {
  it('x-axis column positions include scale factor', () => {
    const dom = createDOM();
    const win = dom.window;

    // Read initial position of first column
    const col0 = win.document.querySelector('.xa-col[data-col="0"]');
    assert.ok(col0, 'Should have a .xa-col with data-col=0');
    const leftAtScale1 = parseFloat(col0.style.left);

    // Zoom to 1.5
    win.applyZoom(1.5, 0, 0);
    const leftAtScale15 = parseFloat(col0.style.left);

    // The position should differ from scale=1 (either from scale or pan adjustment)
    // At scale=1.5 the raw position is (PAD_L + 0*COL_W)*1.5 + panX
    // which is different from PAD_L + panX at scale=1
    assert.notStrictEqual(leftAtScale1, leftAtScale15, 'X-axis position should change with zoom');
  });

  it('x-axis column width scales with zoom', () => {
    const dom = createDOM();
    const win = dom.window;

    const col0 = win.document.querySelector('.xa-col[data-col="0"]');
    const widthAt1 = parseFloat(col0.style.width);

    win.applyZoom(1.5, 0, 0);
    const widthAt15 = parseFloat(col0.style.width);

    assert.ok(
      Math.abs(widthAt15 - widthAt1 * 1.5) < 1,
      `Width at 1.5x should be ~${widthAt1 * 1.5}, got ${widthAt15}`
    );
  });

  it('y-axis row positions include scale factor', () => {
    const dom = createDOM();
    const win = dom.window;

    const row0 = win.document.querySelector('.ya-row[data-row="0"]');
    assert.ok(row0, 'Should have a .ya-row with data-row=0');
    const topAtScale1 = parseFloat(row0.style.top);

    win.applyZoom(1.5, 0, 0);
    const topAtScale15 = parseFloat(row0.style.top);

    assert.notStrictEqual(topAtScale1, topAtScale15, 'Y-axis position should change with zoom');
  });
});

// ===========================================================================
// 6. Event Handler Registration Tests
// ===========================================================================
describe('Event handlers', () => {
  it('wheel event handler is registered on viewport', () => {
    // We check the source code for the wheel listener since JSDOM
    // doesn't expose getEventListeners
    assert.ok(
      html.includes("addEventListener('wheel'") || html.includes('addEventListener("wheel"'),
      'Should have a wheel event listener on viewport'
    );
  });

  it('wheel handler uses passive:false to allow preventDefault', () => {
    assert.ok(
      html.includes("passive:false") || html.includes("passive: false"),
      'Wheel handler should use {passive:false}'
    );
  });

  it('touch handlers support pinch-to-zoom (two-finger detection)', () => {
    assert.ok(html.includes('touches.length===2') || html.includes('touches.length === 2'),
      'Touch handler should detect 2-finger gestures');
    assert.ok(html.includes('pinchDist0') && html.includes('pinchScale0'),
      'Should track pinch distance and initial scale');
    assert.ok(html.includes('Math.hypot'), 'Should compute finger distance with Math.hypot');
  });
});

// ===========================================================================
// 7. Render & Filter Still Work
// ===========================================================================
describe('Render and filter at different zoom levels', () => {
  it('render() works after zoom change', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(0.5, 0, 0);
    // render should not throw
    assert.doesNotThrow(() => win.render());
  });

  it('setFilter works after zoom change', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(1.8, 0, 0);
    assert.doesNotThrow(() => win.setFilter('all'));
    assert.strictEqual(win.scale, 1.8, 'Scale should be preserved after filter change');
  });

  it('openPanel and closePanel work after zoom', () => {
    const dom = createDOM();
    const win = dom.window;
    win.applyZoom(1.3, 0, 0);
    // The template has example paper 'example2015'
    assert.doesNotThrow(() => win.openPanel('example2015'));
    const panel = win.document.getElementById('panel');
    assert.ok(panel.classList.contains('open'), 'Panel should be open');
    assert.doesNotThrow(() => win.closePanel());
    assert.ok(!panel.classList.contains('open'), 'Panel should be closed');
  });
});
