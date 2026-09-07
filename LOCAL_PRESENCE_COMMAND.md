# LOCAL_PRESENCE_COMMAND.md — Kansas Prairie Webworks
## Phase 1: Local Presence Document Generator
## Run AFTER website build is complete and live.
## Version 1.0
## Internal use only — kansasprairiewebworks.com

---

## HOW TO USE

1. Website build must be complete and pushed to GitHub Pages first.
2. Open Claude Code in the client project folder.
3. Paste everything between the triple backticks below. Walk away.
4. All five marketing docs will be created in a new marketing/ subfolder.
5. Use the docs to set up and optimize Google Business Profile and Facebook manually.

---

## THE COMMAND
## Copy everything between the triple backticks and paste into Claude Code

```
Read INTAKE_FROM_BUILD.md first. Pull all client data from Agency Brain using the CLIENT_ID from the folder name. Only fall back to CLIENT_BRIEF_TEMPLATE.md if Agency Brain API is unavailable.

Agency Brain is the primary source of truth for all client data.
All fields — name, phone, email, services, counties, voice, tone —
come from Agency Brain automatically via the getClient and getServices actions.

--- CONTEXT ---

You are building the local presence documentation package for a Kansas Prairie Webworks
Tier 4 client. The website is already live. Your job is to create five marketing documents
that give Kaleb everything needed to set up and optimize the client's Google Business
Profile and Facebook Business Page — fully pre-filled from the client brief.

All output goes into a marketing/ subfolder. Create it if it does not exist.

Do not modify any existing files in the project folder.
Do not rewrite or contradict anything already built into the website.
Treat CLIENT_BRIEF_TEMPLATE.md as the single source of truth for all client data.

--- BEFORE YOU WRITE ANYTHING ---

Read CLIENT_BRIEF_TEMPLATE.md completely. Extract and confirm:
- Business name, owner name, phone (digits and display), email
- Address, city, state, ZIP
- Website domain
- Facebook URL (if provided)
- Google Business Profile URL (if provided)
- All services and service page filenames
- All counties and community tags
- Brand colors and voice/tone notes (Section 12)
- Blog setup details (Section 13)
- Any special notes from Section 11

List every extracted value before proceeding.

Then use web search to research:
- Top 3–5 competitors in the same service category and city/region
- Common Google Business Profile primary and secondary categories for this business type
- Common service descriptions and trust signals used by top-ranking local businesses
- Any obvious gaps or opportunities this client can fill

---

FILE 1 — marketing/CLIENT_MARKETING_SOURCE_OF_TRUTH.md

Create this file first. It is the master reference for all other files.

Structure:
1. CONFIRMED FACTS
   - Full normalized NAP (Name, Address, Phone) in exact format to use everywhere
   - Website URL
   - Social URLs (Facebook, Google Business if provided)
   - All services (final approved list matching website pages)
   - All service areas (counties + community tags)
   - Business hours
   - Brand voice summary (3 sentences max from Section 12)

2. MISSING FACTS
   - List every field from the client brief that was blank or N/A
   - Flag which missing items block GBP or Facebook setup
   - Flag which missing items are optional vs required

3. CONFLICTS DETECTED
   - Any contradiction between sections of the client brief
   - Any mismatch between brief data and website files if visible

4. FINAL NORMALIZED BUSINESS PROFILE
   - The single approved version of business name, address, phone, hours,
     and service list to use consistently across website, GBP, and Facebook

5. WEBSITE CONSISTENCY AUDIT
   - Confirm services on website match services in brief
   - Confirm phone numbers match
   - Confirm service areas match
   - Note any mismatches found

6. FINAL APPROVED LISTS
   - Services (final)
   - Service areas (final)
   - Trust signals (final — pulled from brief + website)

---

FILE 2 — marketing/COMPETITOR_PATTERN_RESEARCH.md

Use web search to research competitors in the same field and region.

Structure:
1. MARKET SEARCHED
   - Search queries used
   - Region and service type targeted

2. COMPETITOR EXAMPLES REVIEWED
   - Business name, brief description, what they do well
   - Do NOT copy their wording — only observe patterns

3. COMMON CATEGORY PATTERNS
   - What primary GBP categories appear most often
   - What secondary categories appear most often

4. COMMON SERVICE PATTERNS
   - How top businesses describe their services
   - What services are emphasized most
   - What services are underemphasized (opportunity gaps)

5. COMMON TRUST AND REVIEW PATTERNS
   - What trust signals appear most (licensed, insured, local, years experience)
   - What review themes appear most (response time, quality, price, communication)
   - What photo types appear most (job site, equipment, before/after, team)

6. STRATEGIC RECOMMENDATIONS
   - Specific opportunities for this client based on competitor gaps
   - Category recommendations supported by competitor research
   - Content angles competitors are missing

7. WHAT NOT TO COPY
   - Any competitor patterns that do not fit this client's actual business

---

FILE 3 — marketing/GOOGLE_BUSINESS_PROFILE_BUILD.md

This is a complete, implementation-ready GBP setup document.
Every field must be pre-filled from the client brief and competitor research.
Kaleb will use this document to set up or optimize the client's GBP manually.

Structure:

1. BUSINESS IDENTITY (exact copy-paste ready values)
   - Business name (as it should appear on GBP — no keyword stuffing)
   - Phone (display format)
   - Website URL
   - Address or service-area business designation
   - Hours (exact format for GBP entry)
   - NAP consistency note — this exact format must match website and Facebook

2. CATEGORY STRATEGY
   - Recommended primary category (with reasoning)
   - Recommended secondary categories (up to 9, with reasoning for each)
   - Categories considered but rejected (with reasoning)
   - Cross-check: confirm each category has a matching website page

3. SERVICES LIST
   - Full GBP services list, grouped by category
   - Service names match website page wording exactly
   - Flag any services that need a website page before adding to GBP

4. SERVICE AREAS
   - Final list of service areas to add to GBP
   - Prioritized order (home county first, then surrounding)
   - Any areas to hold until website support page exists

5. BUSINESS DESCRIPTION (copy-paste ready)
   - Write a 750-character max GBP business description
   - Natural, conversational, no keyword stuffing
   - Uses client's real services, real location, real trust signals
   - Matches the voice and tone from Section 12 of the client brief
   - Ends with a clear call to action

6. PROFILE COMPLETION CHECKLIST
   [ ] Business name entered exactly as approved
   [ ] Phone number verified
   [ ] Website URL verified
   [ ] Address or service area configured
   [ ] Hours entered (regular + holiday)
   [ ] Primary category set
   [ ] Secondary categories added
   [ ] Services list populated
   [ ] Business description added
   [ ] Logo uploaded (use logo.png from images/ folder)
   [ ] Cover photo uploaded (use hero-home.jpg from images/ folder)
   [ ] At least 5 job/project photos uploaded
   [ ] Request a Quote / Book link added (contact page URL)
   [ ] Opening date added if known
   [ ] Q&A section seeded (see below)

7. Q&A SEEDS (5 questions + answers, copy-paste ready)
   Write 5 likely customer questions with strong, natural answers.
   Base questions on services, service area, pricing, process, and emergency availability.

8. REVIEW STRATEGY
   - When to ask: after job completion, before leaving the site
   - How to ask: suggested script for in-person request
   - Review request text message template (copy-paste ready)
   - Response template for positive reviews
   - Response template for negative reviews

9. GOOGLE POSTS CALENDAR (10 post ideas, copy-paste ready)
   - Mix of: service spotlights, seasonal tips, warning signs, blog promotion,
     service area callouts, before/after, trust signals, emergency availability
   - Each post: headline + 2–3 sentence body + call to action
   - Tag which service page or blog post each links to

10. WEBSITE SYNC REQUIREMENTS
    - Which website pages support each GBP category
    - Which blog posts support which GBP services
    - Any missing pages or posts to create later

11. COMPLIANCE NOTES
    - Do not keyword-stuff the business name
    - Only add services the business actually offers
    - Only add service areas actually served
    - Review Google's guidelines before publishing

---

FILE 4 — marketing/FACEBOOK_BUSINESS_BUILD.md

This is a complete, implementation-ready Facebook Business Page setup document.
Every field must be pre-filled. Kaleb uses this to set up or optimize the client's
Facebook Page manually.

Structure:

1. PAGE IDENTITY (copy-paste ready)
   - Page name (exact)
   - Category recommendation
   - Phone, website, email
   - Address or service-area designation
   - Hours

2. ABOUT SECTION (copy-paste ready)
   - Short description (255 characters max)
   - Long description (full about section)
   - Services summary paragraph
   - Region/neighborhood summary

3. SERVICES SECTION
   - Full Facebook services list
   - Wording aligned with website and GBP (consistency across all platforms)
   - Short service descriptions in Facebook's conversational tone

4. BRANDING SETUP
   - Profile photo: use logo.png — upload at 180x180px minimum
   - Cover photo: use hero-home.jpg — upload at 1640x924px ideal
   - CTA button recommendation (Call Now / Get Quote / Send Message)
   - Messenger auto-reply suggestion (copy-paste ready)
   - Lead/contact handling recommendation

5. CONTENT STRATEGY — 15 STARTER POSTS (copy-paste ready)
   Write 15 Facebook posts covering:
   - 3 service spotlights (one per main service)
   - 2 educational / warning-sign posts
   - 2 before/after or job spotlight posts
   - 2 local trust / community posts
   - 2 blog post promotions (link to Blogger posts if available)
   - 2 review highlights (template — swap in real review text)
   - 1 seasonal / weather-related post
   - 1 emergency availability post (if applicable)

   Each post: written in the client's voice from Section 12.
   Include suggested image description for each post.

6. CROSS-PLATFORM SYNC
   - What must stay word-for-word identical: business name, phone, address, hours
   - What should stay closely aligned: service names, service area wording
   - What can be more conversational on Facebook: posts, descriptions, tone

7. COMPETITOR INSIGHTS FOR FACEBOOK
   - What top local competitors do well on Facebook
   - What this client should emulate strategically
   - What should stay unique to this client's voice

8. SETUP CHECKLIST
   [ ] Page created with correct name and category
   [ ] Profile photo uploaded (logo.png)
   [ ] Cover photo uploaded (hero-home.jpg)
   [ ] About section completed
   [ ] Services section populated
   [ ] CTA button set
   [ ] Contact info verified (phone, website, email, hours)
   [ ] Messenger auto-reply configured
   [ ] First 3 posts published
   [ ] Page linked to website footer
   [ ] Admin roles configured (Kaleb + client owner)
   [ ] Business Manager / Meta Business Suite connected if needed

---

FILE 5 — marketing/LOCAL_PRESENCE_EXECUTION_PLAN.md

This is the master operator file. Kaleb uses this to manage the full local presence
rollout for the client in the correct order.

Structure:

1. FILES CREATED IN THIS PACKAGE
   - List all five files with one-line description of each

2. SOURCE OF TRUTH SUMMARY
   - Business name, NAP, website, services (final approved versions)
   - 3-sentence brand voice summary

3. RECOMMENDED ORDER OF OPERATIONS
   Week 1:
   - Review CLIENT_MARKETING_SOURCE_OF_TRUTH.md
   - Confirm any missing facts with client
   - Website already live — verify all pages loading correctly

   Week 2:
   - Set up / claim Google Business Profile using GOOGLE_BUSINESS_PROFILE_BUILD.md
   - Upload photos, complete all fields, publish first 3 Google Posts
   - Request first reviews from satisfied customers

   Week 3:
   - Set up / optimize Facebook Business Page using FACEBOOK_BUSINESS_BUILD.md
   - Publish first 5 Facebook posts from content strategy
   - Configure Messenger auto-reply

   Week 4+:
   - Ongoing: 2–4 Facebook posts per week
   - Ongoing: 2–4 Google Posts per month
   - Ongoing: blog post → BLOG_AGENT.md → blog card on website → share on Facebook + Google Posts
   - Monthly: review new reviews and respond within 48 hours

4. MISSING HUMAN INPUTS
   - List every piece of information still needed from the client
   - Flag which items block launch vs which are optional

5. CONSISTENCY CHECKLIST — DO NOT BREAK
   [ ] Business name identical on website, GBP, Facebook
   [ ] Phone number identical on website, GBP, Facebook
   [ ] Address / service area identical on website, GBP, Facebook
   [ ] Hours identical on website, GBP, Facebook
   [ ] Primary services listed the same way on all platforms
   [ ] Website URL correct on GBP and Facebook
   [ ] Logo consistent across all platforms

6. MONTHLY MAINTENANCE CHECKLIST
   [ ] Respond to all new Google reviews
   [ ] Respond to all Facebook messages and comments
   [ ] Publish 2–4 Google Posts
   [ ] Publish 8–12 Facebook posts
   [ ] Add any new blog posts via BLOG_AGENT.md
   [ ] Check GBP insights for new search queries to target
   [ ] Check if any business info has changed (hours, phone, services)

7. PHASE 2 AUTOMATION NOTE
   This document system is Phase 1 — manual copy/paste implementation.
   Phase 2 will automate posting to Google Business Profile and Facebook
   via Make.com + Google Sheets + Claude API integration.
   All content created in Phase 1 becomes the seed data for Phase 2 automation.

---

WHEN COMPLETE:

Confirm the following:
- [ ] marketing/ subfolder created
- [ ] All 5 files written with client-specific data (not generic placeholders)
- [ ] Every copy-paste block is complete and ready to use
- [ ] Missing information flagged clearly in each file
- [ ] No existing project files modified

Print a summary listing:
- All 5 files created
- Key missing information still needed from client
- Any conflicts found between brief sections
- Estimated time to complete GBP and Facebook setup using these docs
```

---

## AFTER CLAUDE CODE FINISHES — CHECKLIST

- [ ] Review marketing/CLIENT_MARKETING_SOURCE_OF_TRUTH.md — confirm all facts correct
- [ ] Fill in any flagged missing information with client
- [ ] Use GOOGLE_BUSINESS_PROFILE_BUILD.md to set up / optimize GBP
- [ ] Use FACEBOOK_BUSINESS_BUILD.md to set up / optimize Facebook Page
- [ ] Follow LOCAL_PRESENCE_EXECUTION_PLAN.md week by week
- [ ] Add marketing/ folder contents to .gitignore — these are internal docs, not deployed

---

## PHASE 2 — FUTURE AUTOMATION (DO NOT BUILD YET)

Once Phase 1 is running smoothly across 2–3 clients, Phase 2 will add:
- Make.com automation: Google Sheets → Claude API → Facebook post auto-publish
- Make.com automation: Google Sheets → Claude API → Google Business Profile post
- Google Sheets as the content brain — Kaleb approves content, automation publishes it
- Blog posts from Blogger → automatically shared to Facebook and GBP via Make.com

Phase 2 requires: Make.com account, Google Sheets setup, Meta Business API access,
Google Business Profile API access, and Claude API key.

---

*Kansas Prairie Webworks — LOCAL_PRESENCE_COMMAND.md v1.1*
*kansasprairiewebworks.com — 785-577-7695*
*Internal use only*
