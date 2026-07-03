# SYNC_TO_AGENCY_BRAIN.md
# KPW Tier 4 Auto-Populate — Agency Brain
# Drop into any client kpw-build folder
# Command: Read SYNC_TO_AGENCY_BRAIN.md and execute

## MISSION
Read all files in this client build folder.
Extract every field the Agency Brain intake needs.
POST directly to the Agency Brain Web App.
Report what populated and what was blank.

## STEP 1 — Read these files
- CLIENT_BRIEF_TEMPLATE.md (primary source)
- AGENT_BRIEF.md (voice and tone)
- TASKS.md / PROGRESS.md if present
- All .html files (extract phone, services, CTAs)
- images/ folder — list every filename and describe
  what each image shows in 10 words or less

## STEP 2 — Extract these fields
clientName, domain, blogUrl, blogId, businessType,
phone, services (comma-separated), featuredService,
serviceAreas, cta, tagline, customerWords,
whatSetsApart, busiestMonth, slowestMonth,
recentJobPride, topQ1, topQ2, topQ3,
jobsToAvoid, competitorNotes, bestReview,
footerImageUrl, logoUrl

## STEP 3 — Submit to Agency Brain
POST JSON payload to this exact URL:
https://script.google.com/macros/s/AKfycbwT1ryRjscQw7mr-q-Qnaa0FocB7n9xdRC9HNJ0QYXUWgmmdQPVKzCGDP9NQwGz6qF3/exec

Use curl:
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{...payload...}' \
  "https://script.google.com/macros/s/AKfycbwT1ryRjscQw7mr-q-Qnaa0FocB7n9xdRC9HNJ0QYXUWgmmdQPVKzCGDP9NQwGz6qF3/exec"

## STEP 4 — Report back
- Client ID created
- Number of service rows added
- Fields that were blank (Kaleb fills manually)
- Direct link to Sheet to verify

## STEP 5 — Tell Kaleb next command
"Go to Google Sheet → Services tab →
select each service row →
KPW Brain → Research Selected Service"

## TECHNICAL FIELDS
GitHub Repo URL: https://github.com/BbotAI/procleaning.git
Formspree Form ID: mbdprrnj
