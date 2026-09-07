# PRO CLEANING GSC FIX — 403 CLOUDFLARE + VALIDATION
# Autonomous mode. Single report at end.
# No broad changes — targeted fix only.

---

## OPERATING INSTRUCTIONS

Autonomous mode. No confirmation stops.
This prompt fixes the 403 Blocked by Cloudflare WAF issue on
procleaningsalinaks.com that is preventing Google from indexing pages.

---

## PART 1 — DIAGNOSE THE 403 ERROR

Read the Cloudflare credentials from kpw_credentials folder.
Find the Cloudflare API token and Zone ID for procleaningsalinaks.com.

Check the current Cloudflare WAF rules for procleaningsalinaks.com:
```
GET https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/firewall/rules
Authorization: Bearer [CF_API_TOKEN]
```

Also check WAF custom rules:
```
GET https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/rulesets
```

Look for any rule that would block Googlebot or other legitimate crawlers.
The previous fix on kansasprairiewebworks.com added a rule to ALLOW
known good bots (Googlebot, Bingbot, etc.) before any block rules fire.

Report exactly what WAF rules currently exist for procleaningsalinaks.com.

---

## PART 2 — APPLY THE CLOUDFLARE BOT ALLOWLIST FIX

If a rule is found blocking Googlebot or if no bot allowlist rule exists:

Add a WAF rule that allows verified bots BEFORE any challenge/block rules:

```json
{
  "description": "Allow verified good bots — Googlebot Bingbot etc",
  "expression": "(cf.client.bot) or (http.user_agent contains \"Googlebot\") or (http.user_agent contains \"bingbot\") or (http.user_agent contains \"AhrefsBot\") or (http.user_agent contains \"SemrushBot\")",
  "action": "skip",
  "action_parameters": {
    "ruleset": "current"
  },
  "enabled": true
}
```

This rule must be positioned BEFORE any challenge or block rules so
Googlebot is never caught by security rules.

Check if this same rule already exists from the previous KPW fix —
if it does, verify it applies to procleaningsalinaks.com zone too
or if each domain needs its own rule.

---

## PART 3 — VERIFY FIX

After applying the rule:

Use Cloudflare's API to confirm the rule is active:
```
GET https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/firewall/rules
```

Confirm the allowlist rule appears and is enabled.

Also check robots.txt for procleaningsalinaks.com:
```
GET https://procleaningsalinaks.com/robots.txt
```

Confirm it allows Googlebot:
```
User-agent: *
Allow: /
```

If robots.txt is blocking anything — fix it in the pro_cleaning_services repo.

---

## PART 4 — CHECK PRO CLEANING BLOG DUPLICATE POSTS

Using the public Blogger Atom feed for blog.procleaningsalinaks.com
(Blog ID: 5592322905436185298) — pull the full post list and check:
- Any underscore-suffixed duplicate URLs
- Any duplicate titles

Report findings. No deletions without confirmation.

---

## FINAL REPORT FORMAT

**PART 1 — CLOUDFLARE DIAGNOSIS:**
- Zone ID found: YES/NO
- WAF rules found: [list them]
- Rule blocking Googlebot: YES/NO — [describe which rule]
- Existing bot allowlist: YES/NO

**PART 2 — FIX APPLIED:**
- Bot allowlist rule added/verified: confirmed
- Rule position (before block rules): confirmed
- Rule enabled: confirmed

**PART 3 — VERIFICATION:**
- Rule confirmed active via API: confirmed
- robots.txt allows Googlebot: confirmed

**PART 4 — BLOG DUPLICATE CHECK:**
- Posts checked: [count]
- Duplicates found: YES/NO — [list if any]

**MANUAL STEPS REMAINING:**
1. In GSC for mikeservicesllc.com — click Start New Validation on:
   - Redirect error
   - Alternate page with proper canonical tag
2. In GSC for procleaningsalinaks.com — after Cloudflare fix:
   - Click Start New Validation on "Blocked due to access forbidden (403)"
   - Click Start New Validation on "Alternate page with proper canonical tag"
3. Delete duplicate KPW blog post manually in Blogger dashboard:
   web-development-vs-website-design-kansas-small-business_0431377441.html

---

*End of prompt. Autonomous mode. Single report at completion.*
