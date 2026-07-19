---
name: site-audit
description: Full read-only website quality and Google compliance audit for a client site — technical SEO, structured data, images, Core Web Vitals, local SEO, accessibility, security, EEAT, conversion, and content-gap analysis. Use when asked to audit a site, run a site audit, check SEO health, or find out where a client site stands. Works in any client folder.
---

# KPW WEBSITE QUALITY & GOOGLE COMPLIANCE AUDIT
v1.1 — Kansas Prairie Webworks
Run from inside a client folder. Read only.

## OPERATING RULES (override anything below that conflicts)

READ ONLY. Change no files. Create no files.
Make no commits. Run no fixes. Report only.
If you believe something must be changed,
say so — do not do it.

EVIDENCE REQUIRED. Every finding must carry:
  - file path + line number, OR
  - a measured value + the method used
No evidence = it goes in SUSPECTED, not
CONFIRMED. Never blend the two.

VERIFICATION METHOD. Anything rendered —
images, layout, Core Web Vitals, client-side
content — must be verified in headless
Chrome with JavaScript enabled. curl,
web_fetch, and static file reads are NOT
acceptable for these and have produced false
passes on this codebase before. State your
method per finding.

CLIENT-SIDE RENDERING. Before auditing
content, identify every section built by JS
rather than static HTML. This codebase
pattern renders service cards from hardcoded
arrays in main.js. Static-only analysis
misses them entirely. Report the list first.

RECONCILE WITH MEASURED DATA. Run or read
`node kpw_seo_check.js <domain>` output where
available. If your inference contradicts
measured GSC or PageSpeed data, the
measurement wins. Say so explicitly.

SCOPE. Cap CONFIRMED findings at the top 15
by estimated impact on rankings, trust, or
conversions. Everything else goes in a short
appendix. For each of the 15, state estimated
effort: minutes / hours / days.

DO NOT REPORT:
  - Best practices with no measured impact
    on this site
  - Issues on pages with zero traffic
  - Anything requiring a rewrite of working
    code
  - Anything already documented as known and
    open (see PHASE 0)

## PHASE 0 — ORIENT (do this first)

Determine everything from the folder you are
in. Do not ask, do not assume.

1. Identify the site: primary domain,
   blog subdomain, and total page count.
   Source it from the repo — canonicals,
   sitemap.xml, CNAME, or BLOG_AGENT.md.
2. Identify the business: name, services,
   stated service area, phone. Pull from page
   copy and JSON-LD. Report any place the
   name string differs between copy and
   schema.
3. Read PROGRESS.md, BLOG_AGENT.md, and any
   session or handoff notes in the folder.
   Extract the KNOWN AND OPEN issue list.
   Acknowledge each in one line — do not
   re-report them as new findings.
4. Report all of the above before auditing.

## STACK CONTEXT

Vanilla HTML/CSS/JS. No framework, no build
step. GitHub Pages hosting, Cloudflare DNS.
Blogger on a subdomain for blog content,
surfaced as cards on blog.html via the
Blogger v3 API.
Images: WebP canonical. Favicons: PNG set at
repo root, root-absolute paths.
The blog subdomain is a separate hostname for
Search Console and favicon purposes.
GSC Coverage API reporting 0 indexed while
live impressions exist is a known false
reading across these sites — impressions
prove indexing.

## AUDIT SCOPE

Crawl every publicly accessible page plus
robots.txt, sitemap.xml, llms.txt, and the
blog subdomain.

1. TECHNICAL SEO
   Titles (missing, duplicate, length),
   meta descriptions, H1 count and hierarchy,
   broken links, redirect chains, canonicals,
   indexability, robots.txt, sitemap validity
   and freshness, thin or duplicate content.
   llms.txt: present, valid, and consistent
   with robots.txt and sitemap.xml — same
   page list, no gaps in either direction.

2. STRUCTURED DATA
   Validate all JSON-LD. LocalBusiness,
   Organization, Service, FAQPage,
   BreadcrumbList, BlogPosting.
   Check specifically:
   - business name string identical across
     page copy, schema, and GBP
   - E.164 phone format
   - service-area business: no street address
     or coordinates exposed
   - schema count matches actual on-page
     items (e.g. blog cards vs BlogPosting
     blocks)

3. IMAGES
   Every reference in .html/.css/.js/.json/
   .xml resolves to a real file — verified in
   headless Chrome, not by status code on a
   URL you constructed. Report format vs
   extension mismatches (JPEG named .png has
   occurred here). Alt text. File size.
   Double extensions.

4. CORE WEB VITALS
   LCP, INP, CLS, FCP, TTFB. Mobile and
   desktop. Identify the actual LCP element
   per page. Note whether it is an <img> or a
   CSS background — background images are
   invisible to the preload scanner.
   Report lab vs field data separately and
   state the sample size before drawing any
   conclusion from field data.
   Source these numbers from
   `node kpw_seo_check.js <domain>`'s
   PageSpeed output — do not call PageSpeed
   Insights independently. That endpoint is
   keyed and rate-limited outside this
   script.

5. LOCAL SEO
   NAP consistency across site, schema, GBP,
   and Facebook. Service area alignment
   between site copy, schema, and GBP.
   Flag any query the site ranks for that
   falls outside its actual services or
   geography — wrong-signal terms dilute
   topical relevance.
   GBP/off-page: report only what is
   observable without login — review count
   and rating if visible in a public search
   result, whether a GBP listing exists and
   shows as verified, and NAP match against
   the site. Anything requiring login (GBP
   dashboard, Facebook admin panel, backlink
   tools) goes in the MANUAL CHECKS output
   section as a task for the owner — never
   reported as a finding here.

6. ACCESSIBILITY (WCAG 2.2 AA)
   Contrast ratios (compute, don't estimate),
   focus states, keyboard navigation, alt
   text quality, form labels, heading order,
   ARIA misuse, tap target size.

7. SECURITY
   HTTPS, mixed content, security headers,
   exposed credentials or API keys in
   client-side code, third-party script
   failures.

8. CONTENT & EEAT
   Does each page demonstrate real
   experience? Named owner, real photos,
   specific local detail, verifiable claims.
   Flag generic filler and AI-flat copy.
   Flag any PLACEHOLDER, TODO, example.com,
   or 555 phone number still live.

9. CONVERSION
   CTA presence and placement above the fold,
   phone number tappable on mobile, form
   friction, trust signals, mobile layout
   breakage.

10. CONTENT GAP ANALYSIS
   Pull the opportunity-scan queries from
   `node kpw_seo_check.js <domain>` output —
   real impressions, zero or low clicks, a
   real position. For every opportunity
   query, classify into exactly one bucket
   before recommending anything:

   GAP — the business genuinely performs this
     service, no page targets it.
     Action: recommend a new page.

   WEAK TARGETING — the business performs it,
     a page exists, but the page does not use
     the customer's actual phrasing.
     Action: recommend editing the existing
     page. Quote the page's current title,
     H1, and whether the query phrase appears
     anywhere on it.

   NOISE — the business does not perform this
     service, or the query targets a
     geography outside its stated service
     area.
     Action: exclude. Recommend nothing.
     Note it as a wrong-signal term.

   Determine which bucket from the site's own
   service pages and stated service area —
   never guess. If you cannot tell whether
   the business offers a service, say so and
   mark it UNKNOWN — that is a question for
   the owner, not a recommendation.

   Never recommend a page without classifying
   first. GAP and WEAK TARGETING findings
   compete for the CONFIRMED TOP 15 slots on
   the same impact basis as every other
   finding. NOISE entries are not findings —
   list them briefly for completeness, not as
   recommendations. UNKNOWN entries go in
   MANUAL CHECKS as a question for the owner,
   never as a recommendation.

## OUTPUT FORMAT

## SITE IDENTIFIED
(Phase 0 findings — domain, business, known
open issues)

## CLIENT-SIDE RENDERED SECTIONS
(list before anything else — the rest
depends on it)

## CONFIRMED — TOP 15
For each:
  - What: one sentence
  - Evidence: path:line or measured value
  - Method: how verified
  - Impact: rankings / trust / conversions,
    and estimated size
  - Effort: minutes / hours / days

## CONTENT GAP ANALYSIS
Every opportunity query, one line each, with
its bucket (GAP / WEAK TARGETING / NOISE /
UNKNOWN) and one-line reasoning. GAP and WEAK
TARGETING items that made the CONFIRMED TOP
15 can be cross-referenced rather than
repeated in full.

## SUSPECTED
Plausible but unverified. State what would
confirm or rule out each.

## APPENDIX
Everything below the top 15, one line each.

## MANUAL CHECKS
Items that require login or access this
skill does not have — GBP dashboard, Facebook
admin panel, backlink/citation tools, and any
UNKNOWN content-gap classification. Framed as
tasks for the owner, never as findings.

## FIX FIRST
The three items you would do first, and why
those three specifically.

An empty CONFIRMED section is an acceptable
and useful result. Do not manufacture
findings.
