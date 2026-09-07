# PROGRESS — Pro Cleaning Services

# 2026-09-07 — CONTENT BUILD: ODOR REMOVAL PAGE, THREE POSTS, BLOG CARDS

## The finding that drove all of it

Search Console, 90 days: **457 impressions, 4 clicks.** First data 2026-07-11,
so the site is two months old.

**199 of those 457 impressions — 44% — were for services she does not offer.**

| Query | Impr | Position | On the site? |
|---|---|---|---|
| odor removal salina (+ ks) | **94** | 55 | was: no |
| industrial cleaning salina ks | 69 | 32.4 | no |
| water removal salina ks | 20 | 82.8 | no |
| drain cleaning (several) | ~16 | 70–90 | no |
| cleaning services salina ks | 13 | **15.6** | yes |
| home cleaning services near me | 5 | **9.8** | yes |
| deep clean bathroom service | 2 | **1.0** ← 1 of her 4 clicks | yes |

The good news was underneath: for what she *does* offer she already sits at
**positions 8–16** on a two-month-old site. The demand is small but the
positions are real.

**Odor removal turned out not to be a phantom.** Jodi confirmed she does the
work — disinfect, odor treatment, locate the problem, clean. 94 impressions a
month at position 55 with no page to land on was the single biggest gap on the
site. Industrial cleaning, water removal and drain cleaning remain phantoms:
Google guessing, positions 32–90, nobody sees them. **Do not build pages for
those unless she says she does the work.**

## What was built

- **`odor-removal.html`** — fifth service page, cloned from
  `germ-prevention.html` so head, nav, footer and schema match. Argues the
  mechanism: odors come from a physical source, so an odor treatment used first
  is why the smell came back. Four steps in order — find, clean, disinfect,
  treat what absorbed it. Includes an *Honest Expectations* section covering
  smoke being stubborn, results improving over days, and structural causes
  (plumbing, leaks) that cleaning will not fix.
- **Three blog posts**, drafted in `blog-drafts/`, published to Blogger by
  Kaleb, then carded onto `blog.html`.
- **Review button** on the homepage and contact page,
  `g.page/r/CWanDWB1RI4PEBI/review`.
- **`/review/`** — short branded redirect to the same link, for invoices,
  the phone and follow-up texts.

## Roadblocks hit, so the next session does not rediscover them

**Her site is not built like Mike's.** Three concrete differences that broke
scripted edits first time:

1. **No blog card system existed at all.** No `data-thumbnail` loader in
   `main.js`, no `images/blog-placeholder.webp`. Mike's cards use a
   placeholder that JS swaps for the real image; hers cannot. **Her cards use a
   direct `src` with `loading="lazy"`** — simpler and with no JS dependency.
   Do not copy Mike's card markup here.
2. **No `blog-callout` CSS class.** Mike's service pages have one. Hers do
   not, so the From-the-blog links are an inline-styled paragraph in a
   `section` of their own.
3. **Different CSS token names.** She uses `--color-primary`,
   `--color-secondary`, `--bg-subtle`, `--muted`. Not `--primary` /
   `--dark` as on the KPW and Mike templates. Anything hardcoded from another
   site's palette will render wrong.

**HTML indentation is 8 spaces, not 10.** Two scripted edits failed silently on
an anchor mismatch before this was spotted. Check `cat -A` on a real line
before writing a match string.

**Blogger images must be uploaded through Blogger.** Verified all three are on
`blogger.googleusercontent.com`, not `blogger_img_proxy`. The sync script
aborts rather than writing if it sees a proxy URL — that is the failure that
produced blank blue tiles on Mike's site.

## Still open

- **She is not in the kpw-agency-brain system yet.** Blog posts here are
  hand-drafted into `blog-drafts/` and pasted into Blogger. Adding her would
  automate that, and she already has every account it needs.
- **Industrial / commercial cleaning.** `salina commercial cleaning` sits at
  position 19.5 and `industrial cleaning salina ks` pulled 69 impressions.
  Worth asking whether she does commercial work before building anything.
- **Give it 3–4 weeks.** The odor page is the one to watch — it is the only
  page on the site targeting demand that already exists at scale.

---

# 2026-09-07 — GBP IS ON THE SITE BUT INVISIBLE TO VISITORS

**Where the Google Business Profile currently sits: JSON-LD `sameAs` only.**

    share.google/0VlhTXsW5l7KnwuPC

It appears on all 10 pages, every one of them inside the structured-data
`sameAs` array. **There is no clickable link, no button and no card anywhere a
visitor can see or use.** Schema tells Google the profile exists; it does
nothing for a human on the page.

## How the three sites compare

| Site | GBP on page |
|---|---|
| `kansasprairiewebworks.com` | **visible review button** on `index.html` and `contact.html` — `g.page/r/CXAjC182r-F3EAI/review`, styled `btn btn--primary` |
| `mikeservicesllc.com` | placeholder comment awaiting a profile: `<!-- GOOGLE BUSINESS PROFILE LINK: add anchor tag here … -->` on `index.html:465` and `contact.html:161` |
| `procleaningsalinaks.com` | **schema only** — nothing visible, and no placeholder slot either |

Pro Cleaning is the odd one out: it *has* a live profile and the site does
nothing with it. No path for a happy customer to leave a review, and no
prompt for a visitor to check the ratings before calling.

## Two things to settle before adding it

1. **Which share link is current.** The site carries
   `share.google/0VlhTXsW5l7KnwuPC`; Kaleb supplied
   `share.google/OqUMiWhkWi30XWdfU` on 2026-09-07. Both 302 to Google's
   generic share resolver, which does not expose the destination to a server-
   side fetch, so **they could not be verified as the same profile from here.**
   Do not assume — confirm in the GBP dashboard before changing 10 files.

2. **A share link is the wrong tool for reviews.** `share.google/…` opens the
   profile. The review link is `g.page/r/<PLACE_ID>/review`, which drops the
   customer straight into the review box — that is what KPW's own site uses,
   and it is the difference between "have a look at us" and "leave us a
   review". Get it from the GBP dashboard: Ask for reviews → copy link.

**Recommended once confirmed:** mirror KPW's own pattern — a review button on
`contact.html` and `index.html`, plus keep the profile URL in `sameAs`. Review
count and velocity are top-three local-pack factors, and this client has an
established profile that the site is currently wasting.

---

# 2026-09-07 — GSC PAGE INDEXING: ALL FIVE REPORTS TRIAGED

Five Search Console reports arrived at once. **Four need no code change.** All
URLs were re-tested live as Googlebot and every real page returns **200**.

| Report | Verdict |
|---|---|
| Alternate page with proper canonical (`/index.html`) | cause removed — see below |
| Blocked by access forbidden 403 (`/contact.html`) | **already resolved** — returns 200, last crawl was 11 Jul, before the fix |
| Duplicate, Google chose different canonical | **validation already passed** 14 Aug |
| Not found 404 (`/cdn-cgi/l/email-protection`) | Cloudflare feature, not a page — see below |
| Discovered, currently not indexed (5 pages) | not a technical fault — see below |

## The one thing fixed: logo linked to index.html

Same trap as `mikeservicesllc.com`. The header logo linked to `index.html` on
all 10 pages, so every crawl rediscovered a duplicate URL, which Google then
correctly excluded via the canonical and reported back. Now `href="/"`.

**"Alternate page with proper canonical tag" is not an error.** It means Google
found a duplicate and honoured the canonical — the tag working. **Requesting
validation on it will always fail**, because the condition persists while the
URL is discoverable. Do not request it.

## /cdn-cgi/l/email-protection 404 — leave it alone

Cloudflare's **Email Address Obfuscation** is `on` for this zone (verified via
API). It rewrites the `mailto:` on `contact.html` into
`/cdn-cgi/l/email-protection#…`, which Google crawls and finds is not a page.
The 404 is correct.

Turning obfuscation off would clear the report and expose the real address to
harvesters, which is the thing the feature exists to prevent. **Not worth the
trade for one cosmetic 404 on a non-content URL.** Google does not penalise it.

## "Discovered — currently not indexed" on 5 pages

`services`, `service-area`, `deep-cleaning`, `home-cleaning`,
`germ-prevention`. All verified: file exists, in the sitemap, no `noindex`,
returns 200 to Googlebot.

Nothing is technically wrong. That status means Google knows about the pages
and has chosen not to spend crawl budget on them yet — a site-authority and
demand signal, not a fault. **No code change will move it.** It improves with
links, content and time, the same levers as everything else.

## Cloudflare bot settings for this zone (recorded for reference)

    security_level   medium
    browser_check    on
    challenge_ttl    1800

`browser_check` is the setting most likely behind the historical 403 on
`contact.html`. It is currently fine — Googlebot gets 200 — so it was left
alone. See `KPW_PROCLEANING_403_FIX.md` for the original investigation.

---

## Build date: 2026-06-12
## Builder: Kansas Prairie Webworks / Claude Code

---

## FILES CREATED

| File | Status |
|------|--------|
| styles.css | ✅ Complete |
| main.js | ✅ Complete |
| index.html | ✅ Complete |
| about.html | ✅ Complete |
| contact.html | ✅ Complete |
| services.html | ✅ Complete |
| service-area.html | ✅ Complete |
| home-cleaning.html | ✅ Complete |
| move-in-move-out.html | ✅ Complete |
| deep-cleaning.html | ✅ Complete |
| germ-prevention.html | ✅ Complete |
| sitemap.xml | ✅ Complete |
| robots.txt | ✅ Complete |
| CNAME | ✅ Created (domain placeholder — see below) |
| .gitignore | ✅ Complete |

---

## IMAGES — STATUS

### Present in images/ folder
| Filename on disk | Used as | Notes |
|---|---|---|
| `logo.png` | `images/logo.png` | Referenced directly. Convert to `logo.webp` for best performance |
| `hero-home.jpg` | Homepage hero background | CSS background — works as-is |
| `hero-service-1.jpg` | Home Cleaning card + hero | Works as-is |
| `hero-service-2.jpg` | Move In/Move Out card + hero | Works as-is |
| `hero-service-3.jpg` | Deep Cleaning card + hero | Works as-is |
| `hero-service-4.jpg` | Germ Prevention card + hero | Works as-is |
| `hero-service-5.jpg` | Not used | Extra image — add a 5th service or use as `featured-1.jpg` |
| `featured-1.jpg.jpg` | **NEEDS RENAME** | Rename to `featured-1.jpg` (remove double extension) |
| `og-image.jpg.jpeg` | **NEEDS RENAME** | Rename to `og-image.jpg` (remove double extension) |
| `DROP-IMAGES-HERE.txt.txt` | N/A | Has double extension — Windows file naming issue |

### Action Required — Image Renames
Before deploying, rename these files in the images/ folder:

```
featured-1.jpg.jpg   →   featured-1.jpg
og-image.jpg.jpeg    →   og-image.jpg
```

In Windows Explorer: right-click → Rename → remove the extra extension.
You may need to enable "Show file extensions" in View settings to see them.

### Missing Images (not provided)
No dedicated service card images (640×420) were provided.
Currently using the service hero images for card thumbnails — works fine visually.
If Jennifer provides card-sized photos later, name them:
- `home-cleaning.webp`
- `move-in-move-out.webp`
- `deep-cleaning.webp`
- `germ-prevention.webp`

---

## MISSING / INCOMPLETE CLIENT BRIEF FIELDS

| Field | Status | Action |
|---|---|---|
| **Domain name** | ❌ BLANK | Client must purchase domain and enter it |
| Google Maps URL | ❌ Blank | Will generate from address — no action needed |
| Lat / Long | ⚠️ Estimated | Used 38.8733, -97.8706 (Brookville approx.) — update if needed |
| Business Hours | ⚠️ Estimated | Used M-F 8am–5pm, Sat by appt — confirm with Jennifer |
| Service Area details | ⚠️ Written by builder | Based on geography — confirm counties with Jennifer |
| Community tags list | ⚠️ Written by builder | 24 towns listed — add or remove as needed |
| Service page H1s | ⚠️ Written by builder | All service H1s created from service names + city |
| Service descriptions | ⚠️ Written by builder | All content written from Section 12 voice notes |
| About page columns | ⚠️ Written by builder | All content written from Section 12 voice notes |
| FAQ items | ⚠️ Written by builder | 8 homepage FAQs + 5 per service page created |
| Contact process steps | ⚠️ Written by builder | 6 steps written based on industry standard flow |
| Featured project text | ⚠️ Written by builder | Generic trust copy — Jennifer may want to customize |

---

## CONTENT JUDGMENT CALLS

1. **Secondary color (#F5FBFD)** — The client's "secondary" color was near-white, which would make footer backgrounds and heading text invisible. Remapped: used `#F5FBFD` as `--bg-subtle` (alternating section bg) and derived `#006868` (dark teal) as the functional secondary for footers and headings. This looks correct for a teal-branded cleaning company.

2. **Service names** — Four services identified: Home Cleaning, Move In/Move Out, Deep Cleaning, Germ Prevention. File naming follows kebab-case convention: `home-cleaning.html`, `move-in-move-out.html`, `deep-cleaning.html`, `germ-prevention.html`.

3. **"Salina, KS" vs "Brookville, KS"** — The brief says address is Brookville, but the About section references Salina. Header and nav show "Salina, KS" as the service city since that's the primary market. Address in schema and footer shows Brookville (correct legal address). This is standard for service-area businesses.

4. **hero-service-5.jpg** — Not mapped to any page since there are only 4 services. Could be used as a featured project image once `featured-1.jpg` is renamed correctly, or saved for a future 5th service.

5. **Business hours** — Not provided in brief. Used industry-standard hours for a residential cleaning company: M-F 8am-5pm, Saturday by appointment. Confirm with Jennifer.

---

## DOMAIN — ACTION REQUIRED ⚠️

The domain name was left blank in CLIENT_BRIEF. This is the most critical missing item.

**Every instance of `your-domain.com` in these files must be replaced with the real domain before launch:**
- CNAME file
- All 9 HTML files (og:url, og:image, schema JSON-LD)
- sitemap.xml
- robots.txt

Once the domain is known, run a find-and-replace across all files:
  Find: `your-domain.com`
  Replace: `[actual domain]`

---

## POST-BUILD DEPLOYMENT CHECKLIST (for Kaleb)

- [x] Rename `featured-1.jpg.jpg` → `featured-1.jpg` in images folder
- [x] Rename `og-image.jpg.jpeg` → `og-image.jpg` in images folder
- [ ] Get domain from Jennifer — replace all `your-domain.com` with real domain
- [ ] Update CNAME file with real domain
- [ ] Review all pages — confirm zero old client content anywhere
- [ ] Check all phone links (`tel:` and `sms:`) use `7854520793`
- [ ] Check Directions link uses correct address
- [ ] Verify Formspree ID `mbdprrnj` is correct (test form submission)
- [ ] Verify Facebook URL is correct
- [ ] Confirm business hours with Jennifer
- [ ] Confirm service area counties with Jennifer
- [ ] Set up GitHub Pages: repo → Settings → Pages → main → / root → Save
- [ ] Add custom domain in GitHub Pages settings
- [ ] Set up Cloudflare DNS (A records + CNAME — see BUILD_COMMAND_TEMPLATE.md)
- [ ] Set Cloudflare SSL/TLS to Full
- [ ] Enable Enforce HTTPS once checkbox appears
- [ ] Test on mobile — sticky bar visible, scroll-to-top working
- [ ] Submit sitemap to Google Search Console
- [ ] Send Jennifer preview link for approval before announcing live

---

*Kansas Prairie Webworks — PROGRESS.md*
*Built 2026-06-12*
