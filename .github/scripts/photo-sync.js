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
 * ── NO CREDENTIAL, AND NO REPOSITORY SECRET ───────────────────────────────
 *
 * Reads a purpose-built endpoint returning four fields per slot. It
 * deliberately does not call getClient, which returns 242 fields including
 * the client's email address — a build job has no business receiving that.
 *
 * It needs no token. Every URL it returns is a Cloudinary image already
 * served on the client's own public website, so a gate here protected
 * nothing while costing a secret in every client repo. Briefly required
 * 2026-09-09, removed 2026-09-10 along with the gate on the endpoint.
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
// local stub. Unset in CI, which uses the live endpoint.
const ENDPOINT = process.env.PHOTO_SYNC_ENDPOINT ||
  'https://script.google.com/macros/s/AKfycbxnHiCoiuJSBcDp5yIdE-oBSh57wS4hXqUKGrvk7bxe-8UpD7cNfejpTeJIjxwF4XIz/exec';

const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

const die = m => { console.error('photo-sync: ' + m); process.exit(1); };

/**
 * Exit 0 for "this repo is not set up for photo-sync yet".
 *
 * Not-configured is not a failure. A scheduled job that exits 1 emails the
 * owner every thirty minutes, and a repo waiting on a secret or an intake
 * form would do that indefinitely until the noise trained everyone to ignore
 * it, including the run that actually broke.
 *
 * Genuine faults still exit 1: a 4xx from either service, unreadable JSON,
 * or bytes that are not a WebP. A 5xx or a dropped connection is retried and
 * then skipped, because an upstream outage is not something a human can act
 * on at 3am and the next run picks it up.
 */
class SkipSignal extends Error {}

/**
 * Signal "nothing to do", handled at the bottom so the process ends
 * naturally with status 0.
 *
 * This deliberately does NOT call process.exit(). Doing so while a fetch
 * response was still in flight aborted Node with a libuv assertion and exit
 * code 127 — a FAILED job, which is precisely the email this path exists to
 * prevent. Reproduced on 2026-09-11 against a stub returning 404; draining
 * the body first was tried and did not fix it. Throwing and letting the
 * stack unwind does.
 */
const skip = m => { throw new SkipSignal(m); };

/** Insert a Cloudinary transform into an upload URL. */
function derive(url, transform) {
  if (!/\/image\/upload\//.test(url)) return null;
  return url.replace('/image/upload/', '/image/upload/' + transform + '/');
}

/**
 * Magic-byte check, against the format the target filename actually claims.
 * Cheaper and stricter than trusting Content-Type.
 *
 * This used to test for WebP and nothing else, which was correct only while
 * every site photo-sync touched was WebP. Pro Cleaning's logo and featured-1
 * are .jpg and their transforms say f_jpg, so the first run after she
 * uploaded her photos fetched a perfectly good JPEG, failed the WebP test,
 * and exited 1 - a failure email for a file that was exactly right. Check
 * the format the file says it is, not one hardcoded format.
 */
const MAGIC = {
  webp: buf => buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF'
                               && buf.toString('ascii', 8, 12) === 'WEBP',
  jpg:  buf => buf.length > 3  && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF,
  png:  buf => buf.length > 8  && buf.toString('hex', 0, 8) === '89504e470d0a1a0a'
};

function formatOf(file) {
  const ext = path.extname(file).toLowerCase().replace('.', '');
  return ext === 'jpeg' ? 'jpg' : ext;
}

/**
 * True when buf is a real image of the format named by file's extension. An
 * unrecognised extension still has to be *some* known image, which keeps the
 * original point of this check: a Cloudinary error arrives as JSON or HTML
 * and must never be written over a live site photo.
 */
function isExpectedImage(buf, file) {
  const fmt = formatOf(file);
  if (MAGIC[fmt]) return MAGIC[fmt](buf);
  return Object.values(MAGIC).some(fn => fn(buf));
}

const readJson = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return fallback; }
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Which HTTP statuses are worth retrying.
 *
 * MEASURED, not assumed. On 2026-09-11 the Apps Script exec URL returned
 * **404 on 2 of 6 identical requests**, seconds apart, with no change at
 * either end. Its redirect chain to script.googleusercontent.com transiently
 * 404s under load. Treating 4xx as structural — the usual, correct rule —
 * was therefore wrong for this endpoint and was the last source of failure
 * emails: ~1 run in 12 even after 5xx retries were added.
 *
 * 404 and 429 are retried. 400, 401 and 403 stay fatal, because those really
 * do mean the request itself is wrong and retrying only delays the answer.
 */
/**
 * Drain an unusable response before we walk away from it.
 *
 * Without this, exiting while a response body is still unread leaves an open
 * handle and Node aborts with a libuv assertion and exit code 127 — which on
 * a runner is a FAILED job, i.e. the exact email this whole retry path exists
 * to stop. Caught on 2026-09-11 testing the 404 case against a local stub;
 * the HTML case did not show it because that path already calls res.text().
 */
async function discardBody(res) {
  try { if (res && res.body && !res.bodyUsed) await res.body.cancel(); } catch (e) { /* nothing to do */ }
}

function isRetryableStatus(status) {
  if (status >= 500) return true;
  return status === 404 || status === 429;
}


/**
 * fetch() with retries, because this runs 48 times a day against two
 * services neither of us controls.
 *
 * Without it, one transient blip from Apps Script or Cloudinary was a failed
 * job and an email. On 2026-09-10 that was 12 failures in 45 runs on Mike's
 * repo, roughly a quarter, all of them self-correcting by the next half hour.
 * Noise at that rate is worse than useless: it buries the run that matters.
 *
 * A 5xx or a dropped connection is retried. A 4xx is not — that is structural
 * and retrying it just delays a real answer.
 */
/**
 * Like fetchRetry, but the JSON parse happens INSIDE the retry.
 *
 * This is the bug that survived the first retry pass. Apps Script answers a
 * struggling request with an HTML error page carrying a **200** status, so
 * `res.ok` is true, the retry never fires, and `res.json()` throws on the
 * way out. That was ~1 failed run in 12 on 2026-09-11, each one an email.
 *
 * `res.ok` is not enough validation for Apps Script. A response only counts
 * as usable once it has parsed.
 */
async function fetchJsonRetry(url, opts, label, isValid) {
  const delays = [2000, 6000];
  for (let attempt = 0; ; attempt++) {
    let res, err;
    try { res = await fetch(url, opts); } catch (e) { err = e; }

    if (res && res.ok) {
      const body = await res.text();
      try {
        const parsed = JSON.parse(body);
        if (!isValid || isValid(parsed)) return parsed;
        // Valid JSON, wrong answer. Apps Script intermittently 302-redirects
        // the POST, and a redirect turns POST into GET, so the body is
        // dropped and doGet answers instead — with its health check,
        // {"status":"KPW Agency Brain is live"}. Nothing is wrong at either
        // end; the request simply took the wrong door. Retry it.
        throw new Error('unexpected payload: ' + body.trim().slice(0, 70));
      } catch (e) {
        // A 200 that is not JSON is Apps Script having a bad moment, not a
        // structural problem. Retry it like any other transient fault.
        err = new Error(/^unexpected payload/.test(e.message)
          ? e.message
          : '200 but not JSON (' + body.trim().slice(0, 60).replace(/\s+/g, ' ') + '…)');
      }
    } else if (res && !res.ok && !isRetryableStatus(res.status)) {
      await discardBody(res);
      die(`${label}: HTTP ${res.status} — not retrying, that is a real error`);
    }

    await discardBody(res);
    const why = err ? err.message : 'HTTP ' + res.status;
    if (attempt >= delays.length) {
      skip(`${label} unusable after ${attempt + 1} attempts (${why}). ` +
           'Transient upstream problem — the next run will retry.');
    }
    console.log(`photo-sync: ${label} ${why}, retrying in ${delays[attempt] / 1000}s`);
    await sleep(delays[attempt]);
  }
}

async function fetchRetry(url, opts, label) {
  const delays = [2000, 6000];
  for (let attempt = 0; ; attempt++) {
    let res, err;
    try {
      res = await fetch(url, opts);
    } catch (e) {
      err = e;
    }
    if (res && res.ok) return res;
    if (res && !res.ok && !isRetryableStatus(res.status)) {
      await discardBody(res);
      die(`${label}: HTTP ${res.status} — not retrying, that is a real error`);
    }
    await discardBody(res);
    const why = err ? err.message : 'HTTP ' + res.status;
    if (attempt >= delays.length) {
      // Upstream is having a moment. The next scheduled run picks it up, and
      // there is nothing here for a human to do, so do not fail the job.
      skip(`${label} unavailable after ${attempt + 1} attempts (${why}). ` +
           'Transient upstream problem — the next run will retry.');
    }
    console.log(`photo-sync: ${label} ${why}, retrying in ${delays[attempt] / 1000}s`);
    await sleep(delays[attempt]);
  }
}

(async () => {
  const cfg = readJson(CONFIG, null);
  if (!cfg) skip('no .github/photo-sync.config.json in this repo, nothing to map');
  if (!cfg.clientId) die('config has no clientId');
  if (!cfg.slots || !Object.keys(cfg.slots).length) die('config has no slots');

  // No credential needed, and no repository secret to set. Every URL this
  // returns is a Cloudinary image already served on the client's own public
  // website, so requiring a token here protected nothing while costing a
  // secret in every client repo. Briefly required 2026-09-09, removed
  // 2026-09-10 along with the gate on the endpoint itself.

  const payload = await fetchJsonRetry(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getWebsitePhotos',
      clientId: cfg.clientId
    }),
    redirect: 'follow'
  }, 'Agency Brain endpoint', p => p && (p.success === true || typeof p.error === 'string'));
  // Unauthorized here would mean the endpoint was re-gated without this
  // script being updated, which is a real fault rather than a config gap.
  if (payload.error === 'Unauthorized') die('endpoint rejected the request — getWebsitePhotos appears to be gated again');
  // Not being in the Clients sheet yet is not: the intake form has not been
  // filled in. Pro Cleaning sits in exactly this state.
  if (!payload.success && /not found/i.test(String(payload.error || ''))) {
    skip(payload.error + '. Fill in the intake form so the client exists in the Agency Brain.');
  }
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
      const r = await fetchRetry(src, { redirect: 'follow' }, `Cloudinary (${t.file})`);
      const buf = Buffer.from(await r.arrayBuffer());
      // Check the format against the filename's own extension, not the size.
      // A size floor was tried and removed:
      // the blog placeholder's source really is half a kilobyte, so it tripped
      // the floor while being perfectly valid. A Cloudinary error comes back as
      // JSON or HTML, which fails this check at any size.
      if (!isExpectedImage(buf, t.file)) die(`${slot}: ${t.file} is not a valid ${formatOf(t.file) || 'image'} (${buf.length} bytes), refusing to write it`);
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
})().catch(e => {
  if (e instanceof SkipSignal) {
    console.log('photo-sync: SKIPPED — ' + e.message);
    const out = process.env.GITHUB_OUTPUT;
    if (out) fs.appendFileSync(out, ['changed=false', 'count=0', 'summary=', ''].join(String.fromCharCode(10)));
    return;                      // natural exit 0, no process.exit()
  }
  die(e && e.stack ? e.stack : String(e));
});
