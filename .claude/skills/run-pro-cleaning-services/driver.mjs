// Playwright driver for kpw-build visual QA.
// Reusable helpers (import these into a one-off task script — see examples/)
// plus a small CLI for the common case: screenshot a URL and report console errors.

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export async function launch() {
  return chromium.launch({ args: ['--no-sandbox'] });
}

// Standard desktop viewport. Pass overrides as needed (e.g. { viewport: {width, height} }).
export async function desktopContext(browser, overrides = {}) {
  return browser.newContext({ viewport: { width: 1400, height: 900 }, ...overrides });
}

// iPhone-sized, touch-enabled context — use this for tap()/mobile-affordance testing,
// not just a shrunk desktop viewport (hasTouch/isMobile matter: some interactions
// only fire correctly, or only fail to fire, under real touch emulation).
export async function mobileContext(browser, overrides = {}) {
  return browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: MOBILE_UA,
    ...overrides,
  });
}

// Attach console.error / uncaught-exception listeners. Returns the array they push into —
// check its length at the end of a flow instead of trusting a page "looked fine".
export function watchConsoleErrors(page, label = '') {
  const errors = [];
  const tag = label ? `[${label}] ` : '';
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${tag}${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`${tag}pageerror: ${err.message}`));
  return errors;
}

// GOTCHA: waitForSelector defaults to state:'visible'. A closed lightbox/modal that's
// `display:none` (not just missing a class) will NEVER satisfy a ':not(.open)' selector
// waited on with the default state — the element matches but isn't "visible", so it hangs
// until timeout. Wait for the specific element with { state: 'hidden' } instead.
export async function waitForHidden(page, selector, timeout = 5000) {
  return page.waitForSelector(selector, { state: 'hidden', timeout });
}

export async function waitForVisible(page, selector, timeout = 5000) {
  return page.waitForSelector(selector, { state: 'visible', timeout });
}

// --- CLI: `node driver.mjs shot <url> [out.png] [--mobile] [--full-page]` ---
// --- CLI: `node driver.mjs check <url> [--mobile]` (console-errors only, no screenshot) ---
async function cli() {
  const [cmd, url, ...rest] = process.argv.slice(2);
  if (!cmd || !url) {
    console.log('Usage:');
    console.log('  node driver.mjs shot <url> [out.png] [--mobile] [--full-page]');
    console.log('  node driver.mjs check <url> [--mobile]');
    process.exit(1);
  }

  const mobile = rest.includes('--mobile');
  const fullPage = rest.includes('--full-page');
  const outPath = rest.find((a) => !a.startsWith('--')) || 'screenshot.png';

  const browser = await launch();
  const context = mobile ? await mobileContext(browser) : await desktopContext(browser);
  const page = await context.newPage();
  const errors = watchConsoleErrors(page, mobile ? 'mobile' : 'desktop');

  await page.goto(url, { waitUntil: 'networkidle' });

  if (cmd === 'shot') {
    await page.screenshot({ path: outPath, fullPage });
    console.log('Saved:', outPath);
  } else if (cmd === 'check') {
    console.log('Loaded:', url);
  } else {
    console.log('Unknown command:', cmd);
  }

  console.log('Console errors:', errors.length === 0 ? 'none' : errors.join('\n'));

  await browser.close();
  if (errors.length > 0) process.exit(2);
}

// Only run the CLI when this file is executed directly (not when imported by an example script).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  cli().catch((err) => {
    console.error('driver.mjs failed:', err);
    process.exit(1);
  });
}
