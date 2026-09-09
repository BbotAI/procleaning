#!/usr/bin/env node
/**
 * photo-sync — put the client's chosen website photos on their live site.
 *
 * The client picks photos in the portal, one per labelled slot: the homepage
 * hero, the logo, a featured project, the team photo, and one per service.
 * They can delete one and add another whenever they like. That replacement IS
 * the approval — there is no review step and nothing for Kaleb to confirm.
 * Retired 2026-09-09 along with the photo curator.
 *
 * ── WHY THIS IS A FILE SWAP, NOT AN HTML EDIT ─────────────────────────────
 *
 * The site's HTML points at stable filenames: images/hero-home.webp,
 * images/septic.webp, and so on, referenced from 1 to 24 times each. So
 * publishing a new photo means overwriting one file. The markup is never
 * touched, which is what makes this safe to run unattended: the worst failure
 * is a stale image, never a broken page.
 *
 * ── WHY NO IMAGE LIBRARY ──────────────────────────────────────────────────
 *
 * Cloudinary resizes on request. Ask for the derived URL and write the bytes.
 * `c_fill,g_auto` lets Cloudinary choose the crop, which matters because a
 * client uploads whatever aspect ratio their phone produced, and a naive
 * centre crop beheads people. The logo uses `c_limit` so it is scaled and
 * never cropped. No sharp, no canvas, no build step.
 *
 * ── STATE ─────────────────────────────────────────────────────────────────
 *
 * .github/photo-sync-state.json records the source URL last published per
 * slot. A slot is republished only when its URL changes, so a run with no
 * client activity writes nothing and makes no commit. Delete the state file
 * to force a full re-publish.
 *
 * ── AUTH ──────────────────────────────────────────────────────────────────
 *
 * Reads a purpose-built, token-gated endpoint that returns four fields per
 * slot. It deliberately does not call getClient, which returns 242 fields
 * including the client's email address — a build job has no business
 * receiving any of that. Needs KPW_CURATOR_TOKEN as a repository secret.
 *
 * Usage:  node .github/scripts/photo-sync.js [--dry-run] [--force]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(__dirname, '..', 'photo-sync.config.json');
const STATE = path.join(__dirname, '..', 'photo-sync-state.json');
// Overridable so the mapping and download path can be exercised against a
// local stub without holding the real token. Unset in CI, which uses the
// live endpoint.
const ENDPOINT = process.env.PHOTO_SYNC_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxnHiCoiuJSBcDp5yIdE-oBSh57wS4hXqUKGrvk7bxe-8UpD7cNfejpTeJIjxwF4XIz/exec';

const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const die = m => { console.error('photo-sync: ' + m); process.exit(1); };

/** Insert a Cloudinary transform into an upload URL. */
function derive(url, transform) {
  if (!/\/image\/upload\//.test(url)) return null;
  return url.replace('/image/upload/', '/image/upload/' + transform + '/');
}

/** RIFF....WEBP magic. Cheaper and stricter than trusting Content-Type. */
function isWebp(buf) {
  return buf.length > 12 &&
         buf.toString('ascii', 0, 4) === 'RIFF' &&
         buf.toString('ascii', 8, 12) === 'WEBP';
}

const readJson = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return fallback; }
};

(async () => {
  const cfg = readJson(CONFIG, null);
  if (!cfg) die('missing or unreadable .github/photo-sync.config.json');
  if (!cfg.clientId) die('config has no clientId');
  if (!cfg.slots || !Object.keys(cfg.slots).length) die('config has no slots');

  const token = process.env.KPW_CURATOR_TOKEN;
  if (!token) die('KPW_CURATOR_TOKEN is not set (repository secret, or export it locally)');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getWebsitePhotos',
      clientId: cfg.clientId,
      curatorToken: token
    }),
    redirect: 'follow'
  });
  if (!res.ok) die('endpoint returned HTTP ' + res.status);

  let payload;
  try { payload = await res.json(); } catch (e) { die('endpoint did not return JSON'); }
  if (payload.error === 'Unauthorized') die('token rejected — check KPW_CURATOR_TOKEN');
  if (!payload.success) die('endpoint error: ' + (payload.error || 'unknown'));

  const live = {};
  (payload.photos || []).forEach(p => { live[p.slot] = p.url; });
  console.log(`photo-sync: ${payload.count} slot(s) set for ${cfg.clientId}`);

  const state = FORCE ? {} : readJson(STATE, {});
  const changed = [];

  for (const slot of Object.keys(cfg.slots)) {
    const url = live[slot];
    if (!url) { console.log(`  – ${slot}: not set by the client yet`); continue; }
    if (state[slot] === url) continue;
    changed.push({ slot, url, targets: cfg.slots[slot] });
  }

  // A slot in the portal with no entry here would publish nowhere at all, and
  // that is silent, so say it out loud rather than letting a renamed service
  // quietly stop updating the site.
  Object.keys(live).forEach(slot => {
    if (!cfg.slots[slot]) {
      console.warn(`  ! ${slot} has a photo but no mapping in photo-sync.config.json — it will never publish`);
    }
  });

  const out = process.env.GITHUB_OUTPUT;
  const report = (didChange, count = 0, summary = '') => {
    if (out) fs.appendFileSync(out, `changed=${didChange}\ncount=${count}\nsummary=${summary}\n`);
  };

  if (!changed.length) {
    console.log('photo-sync: every slot already current. Nothing changed.');
    return report(false);
  }

  let written = 0;
  for (const { slot, url, targets } of changed) {
    for (const t of targets) {
      const src = derive(url, t.transform);
      if (!src) { console.warn(`  ! ${slot}: not a Cloudinary upload URL, skipped`); continue; }
      const r = await fetch(src, { redirect: 'follow' });
      if (!r.ok) die(`${slot}: Cloudinary returned HTTP ${r.status} for ${t.file}`);
      const buf = Buffer.from(await r.arrayBuffer());
      // Check the format, not the size. A size floor was tried and removed:
      // the blog placeholder's source really is half a kilobyte, so it tripped
      // the floor while being perfectly valid. A Cloudinary error comes back as
      // JSON or HTML, which fails this check at any size.
      if (!isWebp(buf)) die(`${slot}: ${t.file} is not a WebP (${buf.length} bytes), refusing to write it`);
      const dest = path.join(REPO, t.file);
      if (!DRY) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, buf);
      }
      console.log(`  ${DRY ? 'would write' : 'wrote'} ${t.file}  ${(buf.length / 1024).toFixed(0)} KB  (${slot})`);
      written++;
    }
    state[slot] = url;
  }

  if (DRY) {
    console.log(`photo-sync: --dry-run, nothing written. ${written} file(s) would change.`);
    return report(false, written);
  }

  fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
  console.log(`photo-sync: updated ${written} file(s) across ${changed.length} slot(s)`);
  report(true, written, changed.map(c => c.slot).join('; ').slice(0, 200));
})().catch(e => die(e && e.stack ? e.stack : String(e)));
