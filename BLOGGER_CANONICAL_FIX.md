# Blogger Canonical Fix — blog.procleaningsalinaks.com

## Problem (as reported in GSC)
Google Search Console can show blog.procleaningsalinaks.com/?m=1 URLs as
duplicate pages with an "Alternate page with proper canonical tag" error.
Blogger auto-generates ?m=1 mobile URLs for every post.

## Status: verified live 2026-07-28 — no action needed
Live-checked both the blog homepage and a `?m=1` request against
blog.procleaningsalinaks.com. The theme already emits a correct
self-referencing canonical tag, and it correctly resolves to the clean
(non-mobile) URL even when requested with `?m=1`:

```
canonicalUrl: https://blog.procleaningsalinaks.com/
```

Blogger's stock responsive theme handles this automatically — no manual
"Edit HTML" change was required for this blog.

## If GSC still shows this error after this date
That most likely means Google is displaying a stale error from before its
last recrawl, not a live issue. Use URL Inspection in Search Console to
re-test a `?m=1` URL live; if it reports the clean URL as canonical,
click "Validate Fix" rather than editing the theme.

## If a future theme change ever removes the canonical tag
Add this inside the theme's `<head>` section (Blogger → Theme → Edit HTML):

```xml
<b:if cond='data:blog.pageType == &quot;item&quot;'>
  <link rel='canonical' expr:href='data:post.url'/>
<b:else/>
  <link rel='canonical' expr:href='data:blog.canonicalUrl'/>
</b:if>
```

## Related blogs (same check applies)
- blog.kansasprairiewebworks.com — verified live 2026-07-28, already correct
- blog.mikeservicesllc.com — verified live 2026-07-28, already correct
