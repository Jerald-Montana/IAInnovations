# Spam Detection → 404.html Implementation & Fix
Status: 🔄 In Progress

## Step 1: [DONE] Understand current state
- No server-side spam rules in .htaccess
- Client-side form spam checks exist (honeypot, timing)
- Contact.html has validateHuman() → ../404.html on spam

## Step 2: [PENDING] Fix client-side false positives
- js/form-validation.js: Ensure passesAntiSpamChecks() → location.href='/html/404.html'
- Contact.html: Increase timing threshold to 5s

## Step 3: [PENDING] Add server-side .htaccess spam blocking
- Block obvious spam bots (semrushBot, MJ12bot, etc.)
- Block spam referrers
- Block attack patterns (/wp-admin, etc.)
- All → R=404 to /html/404.html

## Step 4: [PENDING] Test
- Normal navigation ✅
- Form submit (legit) ✅
- Form spam → 404 ✅
- Bot UA curl test → 404 ✅

## Step 5: [PENDING] Complete
