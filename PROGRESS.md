# PROGRESS — Pro Cleaning Services

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
