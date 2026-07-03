---
name: run-pro-cleaning-services
description: Visual QA for the procleaningsalinaks.com static site — screenshot any live page, test mobile/touch viewports, and check for console errors. Use when asked to screenshot a page, verify a UI change actually works, check mobile rendering, or confirm no console errors after editing HTML/CSS/JS on this site.
---

This is a plain HTML/CSS/JS static site (no build step, no framework) deployed to GitHub
Pages. There's no local dev server — pages are verified directly against the live URL after
each deploy. Drive it with the Playwright helpers in
`.claude/skills/run-pro-cleaning-services/driver.mjs`.

**Domain note:** this repo's own `CNAME` file is currently blank (just a newline) — but GitHub
Pages is actually serving this site at the custom domain `procleaningsalinaks.com` (confirmed
live, `200 OK`). The repo's default GitHub Pages URL (`bbotai.github.io/procleaning/`) redirects
there. Use `https://procleaningsalinaks.com/` as the live URL, not the blank-CNAME state you'd
expect from the working tree — that mismatch is a separate, pre-existing discrepancy (not
something this skill caused), worth Kaleb's attention independent of this task.

This skill was copied from the sibling `kpw-build` repo's `run-kpw-build` skill (same template
lineage, same driver). See that repo for the fuller write-up and the interaction-testing example
pattern (`lightbox-check.mjs`) if this site later gains a click/tap-driven component worth
testing the same way — as of this writing, `main.js` here only has `initNav`, `initScrollTop`,
`initYear` (confirmed by reading the file); `index.html`'s FAQ section is static `<div
class="faq-item">` markup with no accordion JS, so there's nothing interactive to click-test yet.

All paths below are relative to `.claude/skills/run-pro-cleaning-services/` unless noted otherwise.

## Prerequisites

Node.js and npm (already present in this environment). No OS packages needed beyond what
Playwright's Chromium ships with — it runs headless.

## Setup

```bash
npm install                      # installs playwright (pinned in package.json)
npx playwright install chromium  # downloads the Chromium build Playwright drives
```

`node_modules/` and screenshot output (`*.png`/`*.jpg`) are gitignored — re-run `npm install`
after a fresh clone.

## Run (agent path)

```bash
node driver.mjs shot <url> [out.png] [--mobile] [--full-page]
node driver.mjs check <url> [--mobile]     # console-error check only, no screenshot
```

Verified this session against production:

```bash
node driver.mjs shot "https://procleaningsalinaks.com/" /tmp/procleaning-desktop.png
node driver.mjs shot "https://procleaningsalinaks.com/" /tmp/procleaning-mobile.png --mobile
```

Both rendered correctly and printed `Console errors: none`.

**Helpers available from `driver.mjs`** (import into a new example script if this site gains an
interactive component worth testing):

| export | what it does |
|---|---|
| `launch()` | Launches headless Chromium (`--no-sandbox`) |
| `desktopContext(browser, overrides?)` | 1400×900 viewport context |
| `mobileContext(browser, overrides?)` | 390×844, `isMobile`/`hasTouch` true, iPhone UA |
| `watchConsoleErrors(page, label?)` | Attaches `console`/`pageerror` listeners, returns the array they push into |
| `waitForVisible(page, selector, timeout?)` | Waits for an element to become visible |
| `waitForHidden(page, selector, timeout?)` | Waits for an element to become hidden — see Gotchas |

## Run (human path)

Not applicable — no local server or build; a human checks the same live URL in a regular browser.

## Test

No test suite in this repo (static HTML site). "Testing" a change here means running the
driver against the live URL after deploying.

---

## Gotchas

- **`waitForSelector` defaults to `state: 'visible'`.** A closed modal that's `display: none`
  will never satisfy `page.waitForSelector('#thing:not(.is-open)')` under the default state —
  use `waitForHidden(page, '#thing')` instead. (Inherited note from `run-kpw-build`; not yet
  exercised on this repo since there's no modal/lightbox here.)
- **This site's FAQ is not interactive** — static markup, no accordion JS in `main.js`. Don't
  write a click-test expecting `.faq-item` expand/collapse behavior here.
- **Local `CNAME` file is blank but the live domain is not** — see the domain note above. If a
  future check of this file makes you think the site has no custom domain, verify against the
  actual GitHub Pages settings / live URL before concluding that.

## Troubleshooting

- No repo-specific errors hit yet — this section will fill in as this skill gets exercised
  against real changes.
