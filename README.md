# BuilderOS

The operating system for open source builders — one workspace that aggregates GitHub, npm, Docker Hub, deploys, community, and revenue instead of a dozen open browser tabs.

This repo is an early scaffold: a plugin architecture, a Postgres-backed workspace model, and one real plugin (GitHub — stars, forks, open issues/PRs, latest release) wired end to end. Every other integration in the long-term vision (npm, Docker Hub, Stripe, Discord, Vercel, ...) is intentionally not built yet.

Part of the [builtbysharan.com](https://builtbysharan.com) toolkit.

## Self-hosting

Requires [Docker](https://www.docker.com/) and [pnpm](https://pnpm.io/).

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"   # SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"   # CREDENTIAL_ENCRYPTION_KEY
cp .env.example .env   # fill in the two secrets above, plus OWNER_EMAIL / OWNER_PASSWORD

docker compose up -d          # postgres + redis
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev                      # http://localhost:3001
```

Sign in with `OWNER_EMAIL` / `OWNER_PASSWORD` to create your own workspace and connect a real GitHub repo (a classic personal access token with no scopes is enough for public repos).

To run the whole stack (web + postgres + redis) as a single production-like deployment:

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Try the demo

Click **Continue as Demo** on the login screen — no signup required. It drops you into a pre-populated "BuilderOS Demo" workspace with real-looking GitHub stats for `vercel/next.js`. The demo workspace is read-only (connecting or syncing returns a friendly message instead of touching GitHub) so it stays intact for the next visitor.

## Want it managed instead?

If you'd rather not run your own Postgres/Redis, reach out at [connect@builtbysharan.com](mailto:connect@builtbysharan.com) and we'll set you up with a hosted instance.

## Architecture

- `apps/web` — Next.js (App Router) frontend + API routes
- `packages/db` — Prisma schema and client
- `packages/plugin-sdk` — the `Plugin` interface every integration implements (auth, `connect`, `sync`, metrics, events, widgets)
- `packages/plugin-github` — the first real plugin, built against that interface

See [packages/plugin-sdk/src/types.ts](packages/plugin-sdk/src/types.ts) for the plugin contract.

## License

MIT — see [LICENSE](LICENSE).
