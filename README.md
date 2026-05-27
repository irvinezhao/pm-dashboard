# PM Dashboard

A local-first project management dashboard for projects, versions, subversions, requirements, and delivery ownership.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Data Storage

The app currently stores project data in browser `localStorage`. This is convenient for personal use and demos, but it is not shared across browsers or devices.

## Permissions Direction

The code now has a role gate for edit actions. The current role is wired as `owner` in the frontend so the app remains editable during local development.

For real access control on GitHub Pages, do not put passwords or edit permissions only in frontend code. GitHub Pages is static hosting, so secure editing needs an external auth and storage layer, such as GitHub OAuth plus a small API, Supabase, Firebase, or Cloudflare Workers.

## GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`.

To publish:

1. Push the repo to GitHub.
2. In GitHub, open `Settings > Pages`.
3. Set source to `GitHub Actions`.
4. Push to the `main` branch.

The workflow builds `dist` and deploys it to GitHub Pages.
