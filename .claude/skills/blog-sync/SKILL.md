---
name: blog-sync
description: Pull newly published posts from this client's Blogger blog via the Blogger API and add them to blog.html as new cards with matching JSON-LD schema. Use when asked to update blogs, sync blogs, add new blog posts, pull new published blogs, or refresh the blog page for a client. Works in any client folder.
---

1. Read `BLOG_AGENT.md` in the current client folder. It is authoritative
   for the full workflow, API calls, auth method, and rules — this skill
   does not restate any of it. If this skill and `BLOG_AGENT.md` ever
   disagree, `BLOG_AGENT.md` wins.

2. PREFLIGHT — verify before doing anything:
   - `BLOG_AGENT.md` exists in this folder
   - Its `THIS SITE'S BLOG` line is set to a real client subdomain, NOT
     the `blog.[CLIENT_DOMAIN].com` placeholder and NOT
     `blog.kansasprairiewebworks.com`

   If either check fails, STOP and report. Do not guess the client's
   blog URL.

3. Execute the `BLOG_AGENT.md` workflow.

4. Verify with headless Chrome, JS enabled — report card count and any
   console errors. curl is not acceptable.

5. Update the slot tracker and the known-gaps section in
   `BLOG_AGENT.md` to reflect this run. Resolve stale entries rather
   than leaving them.

6. Commit and push. Report the commit hash and what was added.

7. If zero new posts, say so and change nothing.
