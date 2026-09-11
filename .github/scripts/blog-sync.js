#!/usr/bin/env node
/**
 * blog-sync — add newly published Blogger posts to blog.html as cards.
 *
 * Runs unattended in GitHub Actions. Publish on Blogger, and within the cron
 * interval the card appears on the site. Nothing to run by hand.
 *
 * ── WHY THE PUBLIC FEED, NOT THE BLOGGER API ──────────────────────────────
 *
 * Cards only ever show LIVE posts on a public blog, and <blog>/feeds/posts/
 * default?alt=json serves exactly that with no credential. The Blogger v3 API
 * needs OAuth, and the old manual workflow borrowed a token out of the
 * operator's local ~/.clasprc.json, which cannot work in CI and would have
 * meant a long-lived secret in every client repo. The feed removes it
 * entirely. Drafts stay invisible, which is correct.
 *
 * This never touches the KPW Agency Brain: it does not call it, import from
 * it, deploy it, or read its Script Properties. The Agency Brain publishes to
 * Blogger; this reads Blogger. A failure here cannot affect client posting.
 *
 * ── WHY IT IS TEMPLATE-DRIVEN ─────────────────────────────────────────────
 *
 * The three live sites do NOT share card markup. KPW uses
 * `service-card blog-card` with a placeholder src and a data-thumbnail;
 * Pro Cleaning uses a bare `service-card` with a `service-media` wrapper and
 * the real image in src; and they order the anchor's attributes differently
 * (`href` then `class` on one, `class` then `href` on the other).
 *
 * A single hardcoded card renderer would therefore produce foreign-looking
 * markup on two of three sites, and a regex written against one site's anchor
 * silently matches nothing on the other, which means it reports every post as
 * new and duplicates the whole page. So each repo owns:
 *
 *   .github/blog-card.template.html   its own card markup, with {{FIELDS}}
 *   <!-- BLOG-CARDS:START -->         in blog.html, where new cards go
 *
 * and this script is byte-identical everywhere.
 *
 * ── THE MATCHING RULE THAT MATTERS ────────────────────────────────────────
 *
 * A post counts as already present if any <article> block on the page links
 * to its FULL URL. Matching is a string comparison, never a slug pattern:
 * Blogger appends a numeric suffix on a permalink collision, e.g.
 *   .../2026/07/mobile-app-vs-better-website-kansas-business_01643798843.html
 * and a tidy-looking /[a-z0-9-]+\.html/ misses it without erroring. The KPW
 * blog already contains one of those. Titles are never matched on: they get
 * edited on Blogger after publication, permalinks do not.
 *
 * ── TEMPLATE FIELDS ───────────────────────────────────────────────────────
 *
 *   {{SLOT}}        the BLOG-n number for the slot comment
 *   {{URL}}         post permalink
 *   {{TITLE}}       post title, HTML-escaped
 *   {{DATE}}        "September 6, 2026"
 *   {{DATE_ISO}}    "2026-09-06"
 *   {{EXCERPT}}     first sentences, HTML-escaped
 *   {{IMAGE}}       Blogger image URL at card size, or the placeholder
 *   {{ALT}}         "<title> &mdash; <site name>", HTML-escaped
 *
 * Usage:  node .github/scripts/blog-sync.js [--dry-run]
 * Writes changed/count/summary to $GITHUB_OUTPUT for the workflow.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const BLOG_HTML = path.join(REPO, 'blog.html');
const AGENT_MD = path.join(REPO, 'BLOG_AGENT.md');
const TEMPLATE = path.join(__dirname, '..', 'blog-card.template.html');
const MARKER = '<!-- BLOG-CARDS:START -->';
const DRY = process.argv.includes('--dry-run');

const die = m => { console.error('blog-sync: ' + m); process.exit(1); };

/**
 * Exit 0 for "this repo is not set up for blog-sync yet".
 *
 * Not-configured is not a failure. On a cron, exiting 1 emails the owner
 * every thirty minutes forever, which trains everyone to ignore the alert
 * that actually matters. The template repo hits every one of these.
 * Genuine faults (a non-200 feed, a missing marker on a real site) still
 * exit 1.
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

// ── config ────────────────────────────────────────────────────────────────

function blogUrl() {
  if (!fs.existsSync(AGENT_MD)) skip('no BLOG_AGENT.md in this repo, nothing to sync');
  const m = /##\s*THIS SITE'S BLOG\s*\n+\s*(\S+)/.exec(fs.readFileSync(AGENT_MD, 'utf8'));
  if (!m) die("no 'THIS SITE'S BLOG' URL in BLOG_AGENT.md");
  const url = m[1].replace(/\/+$/, '');
  if (/CLIENT_DOMAIN|example\.com|\[/.test(url)) skip('BLOG_AGENT.md still has the placeholder blog URL, so this is a template rather than a live site');
  if (!/^https?:\/\//.test(url)) die('blog URL is not absolute: ' + url);
  return url;
}

// ── feed ──────────────────────────────────────────────────────────────────

/** Blogger has no cursor; page with the 1-based start-index until short. */
async function fetchAllPosts(blog) {
  const PAGE = 150;
  const out = [];
  for (let start = 1; start < 5000; start += PAGE) {
    const u = `${blog}/feeds/posts/default?alt=json&max-results=${PAGE}&start-index=${start}`;
    // Parsed inside the retry: a 200 carrying an HTML error page is a
    // transient upstream fault, and res.ok alone does not catch it.
    const json = await fetchJsonRetry(u, { headers: { 'User-Agent': 'kpw-blog-sync' } }, 'Blogger feed');
    const entries = ((json || {}).feed || {}).entry || [];
    out.push(...entries);
    if (entries.length < PAGE) break;
  }
  return out;
}

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
 * fetch() with retries. This polls Blogger 48 times a day; a single transient
 * blip should not be a failed job and an email. A 4xx is not retried, since
 * that is structural. A 5xx or a dropped connection is retried, then skipped:
 * an upstream outage is not actionable and the next run picks it up.
 */
/** fetchRetry, but the JSON parse happens inside the retry. See photo-sync. */
async function fetchJsonRetry(url, opts, label) {
  const delays = [2000, 6000];
  for (let attempt = 0; ; attempt++) {
    let res, err;
    try { res = await fetch(url, opts); } catch (e) { err = e; }

    if (res && res.ok) {
      const body = await res.text();
      try {
        return JSON.parse(body);
      } catch (e) {
        err = new Error('200 but not JSON (' + body.trim().slice(0, 60).replace(/\s+/g, ' ') + '…)');
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
    console.log(`blog-sync: ${label} ${why}, retrying in ${delays[attempt] / 1000}s`);
    await sleep(delays[attempt]);
  }
}

async function fetchRetry(url, opts, label) {
  const delays = [2000, 6000];
  for (let attempt = 0; ; attempt++) {
    let res, err;
    try { res = await fetch(url, opts); } catch (e) { err = e; }
    if (res && res.ok) return res;
    if (res && !res.ok && !isRetryableStatus(res.status)) {
      await discardBody(res);
      die(`${label}: HTTP ${res.status} — not retrying, that is a real error`);
    }
    await discardBody(res);
    const why = err ? err.message : 'HTTP ' + res.status;
    if (attempt >= delays.length) {
      skip(`${label} unavailable after ${attempt + 1} attempts (${why}). ` +
           'Transient upstream problem — the next run will retry.');
    }
    console.log(`blog-sync: ${label} ${why}, retrying in ${delays[attempt] / 1000}s`);
    await sleep(delays[attempt]);
  }
}

const alternate = e => {
  const l = (e.link || []).find(x => x.rel === 'alternate');
  return l ? l.href.split('#')[0].split('?')[0] : null;
};

/** Blogger encodes the requested size as the path segment before the file. */
const sized = (u, spec) => u ? u.replace(/\/[sw]\d+[^/]*\/([^/]+)$/, `/${spec}/$1`) : null;

const firstBodyImage = html => {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html || '');
  return m ? m[1] : null;
};

// ── text ──────────────────────────────────────────────────────────────────

const ENT = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
              '&#39;': "'", '&rsquo;': '’', '&lsquo;': '‘',
              '&ldquo;': '“', '&rdquo;': '”', '&mdash;': '—',
              '&ndash;': '–', '&hellip;': '…' };

function plainText(html) {
  let t = String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  t = t.replace(/&[a-z#0-9]+;/gi, x => ENT[x.toLowerCase()] !== undefined ? ENT[x.toLowerCase()] : x);
  return t.replace(/\s+/g, ' ').trim();
}

/**
 * Take whole sentences up to `max`.
 *
 * An earlier version cut at `max` and then backed up to the last sentence
 * boundary. On a post whose opening sentence is short and whose second one is
 * long, that returned the first sentence alone, which reads clipped next to
 * the hand-written cards around it. Accumulating instead gives two or three
 * sentences, which is what the existing cards look like.
 *
 * A single opening sentence longer than `max` is word-cut with an ellipsis,
 * never mid-word.
 *
 * 340 is measured, not guessed: the hand-written excerpts already on the three
 * sites run a median of 237-271 characters and up to 429. A 300 cap cut the
 * common two-sentence opening one sentence short.
 */
function excerpt(text, max = 340) {
  if (text.length <= max) return text;
  const parts = text.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (parts) {
    let out = '';
    for (const p of parts) {
      if ((out + p).trim().length > max) break;
      out += p;
    }
    out = out.trim();
    if (out.length >= 60) return out;
  }
  const cut = text.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return cut.slice(0, sp > 0 ? sp : max) + '…';
}

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pretty = s => esc(s)
  .replace(/’/g, '&rsquo;').replace(/‘/g, '&lsquo;')
  .replace(/“/g, '&ldquo;').replace(/”/g, '&rdquo;')
  .replace(/—/g, '&mdash;').replace(/–/g, '&ndash;')
  .replace(/…/g, '&hellip;');

const MONTHS = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];

/**
 * Format the date WITHOUT going through a Date object. Blogger returns an ISO
 * string carrying the blog's own offset; `new Date(...)` then renders in the
 * runner's timezone, and a GitHub runner is UTC while these blogs are on
 * Central. An evening post would show tomorrow's date. Read the parts off the
 * string exactly as the blog recorded them.
 */
function prettyDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : '';
}
const isoDate = iso => (/^(\d{4}-\d{2}-\d{2})/.exec(String(iso || '')) || [, ''])[1];

// ── learn house details from cards already on the page ────────────────────

function inferStyle(html) {
  const s = { altSuffix: null, placeholder: null, author: null, authorUrl: null,
              publisher: null, publisherUrl: null };

  // Decode the captured suffix. It is read straight out of the page, so on
  // Mike's it arrives as "Mike&rsquo;s Services LLC"; re-escaping that on the
  // way back out would render a literal "Mike&amp;rsquo;s".
  const alt = /alt="[^"]*&mdash;\s*([^"]+)"/.exec(html);
  if (alt) s.altSuffix = plainText(alt[1]).trim();

  const ph = /<img[^>]*\ssrc="([^"]*placeholder[^"]*)"/i.exec(html);
  if (ph) s.placeholder = ph[1];

  const a = /"author":\s*\{\s*"@type":\s*"Person",\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"/.exec(html);
  if (a) { s.author = a[1]; s.authorUrl = a[2]; }
  const p = /"publisher":\s*\{\s*"@type":\s*"Organization",\s*"name":\s*"([^"]+)",\s*"url":\s*"([^"]+)"/.exec(html);
  if (p) { s.publisher = p[1]; s.publisherUrl = p[2]; }
  return s;
}

/**
 * Every post URL already linked from a card. Scans <article> blocks so a link
 * in the page's intro copy is not mistaken for a card, and is indifferent to
 * attribute order, which differs between these sites.
 */
function existingUrls(html, blog) {
  const urls = new Set();
  for (const m of html.matchAll(/<article\b[\s\S]*?<\/article>/gi)) {
    for (const h of m[0].matchAll(/href="([^"]+)"/gi)) {
      const u = h[1].split('#')[0].split('?')[0];
      if (u.startsWith(blog)) urls.add(u);
    }
  }
  return urls;
}

// ── render ────────────────────────────────────────────────────────────────

function render(tpl, post, slot, style) {
  const alt = style.altSuffix ? `${post.title} — ${style.altSuffix}` : post.title;
  const map = {
    SLOT: String(slot),
    URL: esc(post.url),
    TITLE: pretty(post.title),
    DATE: esc(post.dateLabel),
    DATE_ISO: esc(post.dateIso),
    EXCERPT: pretty(post.excerpt),
    IMAGE: esc(post.image || style.placeholder || ''),
    ALT: pretty(alt)
  };
  return tpl.replace(/\{\{([A-Z_]+)\}\}/g, (whole, key) => {
    if (!(key in map)) die(`template uses {{${key}}}, which this script does not provide`);
    return map[key];
  }).replace(/\s+$/, '');
}

function schema(post, style) {
  const o = { '@context': 'https://schema.org', '@type': 'BlogPosting',
              headline: post.title, description: excerpt(post.plain, 200),
              url: post.url, datePublished: post.dateIso };
  if (style.author) o.author = { '@type': 'Person', name: style.author, url: style.authorUrl };
  if (style.publisher) o.publisher = { '@type': 'Organization', name: style.publisher, url: style.publisherUrl };
  o.mainEntityOfPage = { '@type': 'WebPage', '@id': post.url };
  return '  <script type="application/ld+json">\n' +
         JSON.stringify(o, null, 2).split('\n').map(l => '  ' + l).join('\n') +
         '\n  </script>';
}

// ── main ──────────────────────────────────────────────────────────────────

(async () => {
  if (!fs.existsSync(BLOG_HTML)) skip('no blog.html in this repo, nothing to sync');
  if (!fs.existsSync(TEMPLATE)) skip('no .github/blog-card.template.html, so this repo is not configured yet');

  const blog = blogUrl();
  let tpl = fs.readFileSync(TEMPLATE, 'utf8');

  // The image size is declared by the template, not guessed from the page.
  // Inferring it was tried and removed: these blogs carry a mix of s720,
  // s1280, w640-h640 and w640-h427 from years of hand-made cards, so "reuse
  // what is already there" just picks whichever image sorts first in the file.
  // Ask for the size this site's card actually renders at.
  const DEFAULT_SPEC = 'w640-h400-c';
  const dir = /<!--\s*blog-sync:\s*image=([\w-]+)\s*-->[^\S\n]*\n?/i.exec(tpl);
  const imageSpec = dir ? dir[1] : DEFAULT_SPEC;
  if (dir) tpl = tpl.replace(dir[0], '');
  tpl = tpl.replace(/\s+$/, '');
  console.log(`blog-sync: card image size ${imageSpec}${dir ? '' : ' (default)'}`);
  let html = fs.readFileSync(BLOG_HTML, 'utf8');

  if (!html.includes(MARKER)) {
    die(`blog.html has no ${MARKER} marker. Put it on its own line immediately ` +
        'before the first card, inside the card container.');
  }

  const style = inferStyle(html);
  const existing = existingUrls(html, blog);
  const entries = await fetchAllPosts(blog);
  console.log(`blog-sync: ${entries.length} live post(s) at ${blog}, ${existing.size} already carded`);

  const fresh = [];
  for (const e of entries) {
    const url = alternate(e);
    if (!url || existing.has(url)) continue;
    const body = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
    const plain = plainText(body);
    const raw = (e.media$thumbnail && e.media$thumbnail.url) || firstBodyImage(body);
    fresh.push({
      url,
      title: plainText((e.title && e.title.$t) || 'Untitled'),
      dateIso: isoDate(e.published && e.published.$t),
      dateLabel: prettyDate(e.published && e.published.$t),
      image: sized(raw, imageSpec),
      plain,
      excerpt: excerpt(plain)
    });
  }

  const gh = process.env.GITHUB_OUTPUT;
  const report = (changed, count = 0, summary = '') => {
    if (gh) fs.appendFileSync(gh, `changed=${changed}\ncount=${count}\nsummary=${summary}\n`);
  };

  if (!fresh.length) {
    console.log('blog-sync: no new posts. Nothing changed.');
    return report(false);
  }

  // Newest first across the whole grid, which is the convention on all sites.
  fresh.sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
  fresh.forEach(p => console.log(`  + ${p.dateIso}  ${p.title}`));

  const cards = fresh.map((p, i) => render(tpl, p, i + 1, style)).join('\n');
  html = html.replace(MARKER, MARKER + '\n' + cards);

  // Keep BLOG-n in document order. Sites without slot comments are unaffected.
  let n = 0;
  html = html.replace(/<!-- BLOG-\d+ -->/g, () => `<!-- BLOG-${++n} -->`);

  // JSON-LD only where the page already carries some, so a site that never
  // adopted per-post schema is not silently given a different head shape.
  const firstLd = html.indexOf('  <script type="application/ld+json">');
  if (firstLd !== -1 && (style.author || style.publisher)) {
    const blocks = fresh.map(p => schema(p, style)).join('\n');
    html = html.slice(0, firstLd) + blocks + '\n' + html.slice(firstLd);
  } else {
    console.log('blog-sync: no per-post JSON-LD on this page, skipped schema');
  }

  if (DRY) {
    console.log(`blog-sync: --dry-run, not writing. Would add ${fresh.length} card(s).`);
    return report(false, fresh.length);
  }

  fs.writeFileSync(BLOG_HTML, html);
  console.log(`blog-sync: added ${fresh.length} card(s) to blog.html`);
  report(true, fresh.length, fresh.map(p => p.title).join('; ').slice(0, 200));
})().catch(e => {
  if (e instanceof SkipSignal) {
    console.log('blog-sync: SKIPPED — ' + e.message);
    const out = process.env.GITHUB_OUTPUT;
    if (out) fs.appendFileSync(out, ['changed=false', 'count=0', 'summary=', ''].join(String.fromCharCode(10)));
    return;                      // natural exit 0, no process.exit()
  }
  die(e && e.stack ? e.stack : String(e));
});
