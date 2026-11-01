# Heiser (mikeusry/heiser) — rules for Claude Code
Owner bot: Heiser. Astro site for The Heiser Group (cleaning company, point.dog client), hosted on Cloudflare Pages (project `heiser`, point.dog Digital account) at heisergroup.com. Not Vercel.
- src/: Astro site. src/middleware.ts guards /admin/* and /api/admin/* with a cookie login.
- workers/contact-form: Cloudflare Worker for the contact and quote form (spam filter in src/spam.ts). Lead emails go out from forms@point.dog.

## Deploy
main is live. The site is a Cloudflare Pages direct upload (no Git connection); until PR #5's .github/workflows/deploy-site.yml is merged, see .claude-context.md for the current deploy. After that, the site deploys only from main through that workflow. The contact-form Worker deploys from main through .github/workflows/deploy-contact-form.yml. Never wrangler deploy by hand, and never change the Mac's wrangler login.

## Commands
- Root: npm ci · npm run build · npm run dev · npm run preview (no lint or test script at root)
- workers/contact-form: npm ci · npm test (vitest) · npm run typecheck

## Risky paths (extra care)
- src/middleware.ts, src/pages/admin and any /api/admin routes: auth. Every admin route must stay behind the check.
- workers/contact-form: every form change needs a real test submission against the deployed Worker (a clean lead goes through, a spam sample is blocked) and proof the lead email still arrives with what Heiser needs.
- Worker secrets, DNS, email sending settings, deletes: flag clearly in the PR.

## What done means
- One job per PR, draft PR only. Never merge, push to main or deploy. Mike presses merge.
- Evidence block in the PR body tied to the head commit: commands run + output, failing-then-passing test, screenshots for anything a visitor sees.
- Checked on the preview URL, and on live after merge before anyone says "live".

## Cross-check reviewer checklist (Claude Code on Mike's Mac)
Record author model (Grok/Composer) and reviewer model in the verdict. Fail the PR if any is true:
- Auth gap: a new route, API or admin page with no auth check, or a check that can be skipped.
- Money math: totals, prices, tax or rounding changed without a test covering it.
- Missing tests: behavior changed and no test fails with the fix reverted.
- Secrets: any key, token or .env value in code, logs, PR text or output. Names only, never values.
- Scope: files changed outside the brief, or workflow/secret/DNS/deploy changes not flagged.
- Deletes: anything deleted without Mike's yes.
