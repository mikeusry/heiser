import { spawnSync } from 'node:child_process';

const message = [
  'Heiser Pages deploys only from GitHub main via .github/workflows/deploy-site.yml.',
  'Do not run wrangler pages deploy from a laptop.',
  'Push to main, or run the Deploy site workflow from the Actions tab (it runs only on main).',
].join('\n');

if (process.env.CI !== 'true') {
  console.error(message);
  process.exit(1);
}

const sha = process.env.GITHUB_SHA;
if (!sha) {
  console.error('GITHUB_SHA is required to deploy.');
  process.exit(1);
}

const result = spawnSync(
  'npx',
  [
    '--no-install',
    'wrangler',
    'pages',
    'deploy',
    'dist',
    '--project-name',
    'heiser',
    '--branch',
    'main',
    '--commit-hash',
    sha,
    '--commit-dirty=false',
  ],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
