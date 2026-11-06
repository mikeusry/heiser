# Heiser Group

Astro site for heisergroup.com. Production deploys go to Cloudflare Pages project `heiser` only from GitHub `main`, via `.github/workflows/deploy-site.yml`. Nothing deploys this site with Wrangler from a laptop.

## Deployment

Push to `main`, or run the **Deploy site** workflow from the Actions tab. The job runs only when `github.ref` is `refs/heads/main`.

`npm run deploy` exits with a pointer to that workflow unless `CI=true` (GitHub Actions sets this). Do not run `wrangler pages deploy` locally.

Worker-only commits under `workers/contact-form/` do not deploy the site. The contact-form worker keeps its own workflow (`.github/workflows/deploy-contact-form.yml`).

### Repository secrets

The workflow does not create these. Confirm they exist on `mikeusry/heiser` before the first main deploy:

| Secret | Required | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_PAGES_TOKEN` | Yes | Passed as `CLOUDFLARE_API_TOKEN` for this site deploy. Pages write access for account `07f1d3224d68222be7b6f97190608b80`, project `heiser`. This is not the contact-form workflow's `CLOUDFLARE_API_TOKEN`. |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account id `07f1d3224d68222be7b6f97190608b80`. |
| `MOTHERSHIP_READ_TOKEN` | Yes, must be added | GitHub token with read access to private `mikeusry/mothership`. The workflow clones that repo to `../Mothership` for `@pointdog/admin-core` (`file:`) and uses it so `npm ci` can fetch private `point-dog` (`github:mikeusry/mothership`). |

## Commands

From the repo root:

| Command | Action |
| --- | --- |
| `npm ci` | Install from the lockfile. Needs `../Mothership` and read access to `mikeusry/mothership`. |
| `npm run dev` | Local dev server at `localhost:4321` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview the build locally |
| `npm run deploy` | Refuses. Production deploy is the GitHub Action on `main` |

Node version is in `.nvmrc` (20).
