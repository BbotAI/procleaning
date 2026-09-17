# Blogger Canonical Fix — blog.procleaningsalinaks.com

## ✅ FIXED AND VERIFIED 2026-09-17

Kaleb removed the block from all three themes. Verified post by post as
Googlebot Smartphone: **71 posts (KPW 38, Mike's 25, Pro Cleaning 8), every one
with exactly one canonical pointing at its own clean URL, and no empty tag
anywhere.** Homepage, label and archive pages all correct on both desktop and
mobile. All three blog sitemaps resubmitted the same day.

Search Console still has to recrawl before the reports clear — start the
validations listed at the end of this file. Keep the rest of this document: it
is what to check if a theme is ever edited again.

---

## ⚠ 2026-09-16: THE SNIPPET THIS FILE USED TO RECOMMEND IS THE BUG

Earlier versions of this file, and `KPW_CANONICAL_FIX_SKILL.md`, said to paste
this into the Blogger theme `<head>`:

```xml
<!-- DO NOT ADD THIS. REMOVE IT IF IT IS THERE. -->
<b:if cond='data:blog.pageType == &quot;item&quot;'>
  <link rel='canonical' expr:href='data:post.url'/>
<b:else/>
  <link rel='canonical' expr:href='data:blog.canonicalUrl'/>
</b:if>
```

It got added to the KPW, Mike's and Pro Cleaning themes. **`data:post.url` does
not exist in `<head>`.** Post data is only in scope inside the Blog widget, so on
every post page it renders as:

```html
<link href='https://blog.example.com/2026/09/post.html' rel='canonical'/>  <- Blogger's own, correct
<link href='' rel='canonical'/>                                            <- the snippet
```

An empty href resolves to the page's own URL, so every post, and every `?m=1`
copy of it, declares two different canonicals. Google ignores both. The
Search Console result, confirmed per-URL with the URL Inspection API on
2026-09-16:

| GSC reason | Why |
|---|---|
| Duplicate without user-selected canonical | `?m=1` copies: conflicting canonicals = none |
| Page with redirect (in sitemap) | Google picked the `?m=1` copy as canonical, and the clean URL 302s to it for Googlebot Smartphone |
| Redirect error | same loop: clean URL -> 302 -> `?m=1`, whose canonical points back |

Dating it: on blog.kansasprairiewebworks.com, `?m=1` URLs last crawled before
~2026-07-26 are all in the healthy state ("Alternate page with proper
canonical tag") and every one crawled from 2026-08-01 on is broken. The skill
ran 2026-07-28. On Mike's blog, `?m=1` URLs were taking the search impressions
instead of the real posts (338 impressions on the `?m=1` copy of the
land-clearing post).

blog.dogebeats.com was set up 2026-09-13 without the snippet and has exactly
one canonical on every page type. It is the control.

## The fix — Blogger dashboard, about two minutes per blog

The Blogger API has no themes resource, so this cannot be done from code.

1. blogger.com -> pick the blog -> **Theme**
2. Arrow next to **Customize** -> **Backup** -> Download (safety copy)
3. Same arrow -> **Edit HTML**
4. Click inside the code, press **Ctrl+F**, search `data:post.url`
5. Delete the whole `<b:if cond='data:blog.pageType == &quot;item&quot;'>` ...
   `</b:if>` block (5 lines, shown above). Search `canonical` once more to be
   sure no other hand-added `<link rel='canonical'` remains.
   **Do not** touch `<b:include data='blog' name='all-head-content'/>` — that
   line is what emits the correct canonical.
6. **Save**

## Verify (anyone can run this)

```bash
curl -s -A "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  "https://blog.procleaningsalinaks.com/<any post>.html?m=1" | grep -io "<link[^>]*canonical[^>]*>"
```

Pass = exactly **one** line, pointing at the clean post URL (no `?m=1`).

Then in Search Console for this property: **Validate Fix** on "Duplicate without
user-selected canonical", "Page with redirect" and "Redirect error".

## Things that are NOT bugs — leave them

- **"Alternate page with proper canonical tag" on `?m=1` URLs.** That is the
  correct end state: Google found the mobile copy and filed it under the real
  post. It never "passes validation" because nothing is wrong. Don't validate it.
- **The 302 from a post to `?m=1` for mobile visitors.** Every Blogger blog does
  this and there is no setting to turn it off. The single correct canonical is
  what makes it harmless.

## Rule

**Never hand-add a canonical to a Blogger theme.** Blogger's
`all-head-content` include already emits a correct one on every page type.
Before changing anything, curl a post page and count the canonical tags.
