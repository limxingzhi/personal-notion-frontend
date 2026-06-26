# Personal Notion Frontend

## Commands

```
npm run dev / build / start / lint
```

## Architecture

Single server component (`src/app/page.tsx`) reads data from filesystem cache (`.cache/tasks.json`, `.cache/description.json`, both 5-min TTL) and renders a client component (`HomePageClient.tsx`). On cache miss, the client fetches from Notion via `/api/tasks` / `/api/database` on mount. `/api/config` returns public env vars for header links.

## Gotchas

- **Uses raw `fetch` to Notion REST API, not `@notionhq/client`** — no SDK dependency
- **Filter logic**: "In progress", "To Do", "Done" always included; "Inbox" only if due ≤7 days (date filter `on_or_before`)
- **Notion properties**: `Name` (title), `Status` (status), `Due Date` (date), `Short note` (rich_text) — property names **case-sensitive**
- **No tests** configured
- **Env vars**: `NOTION_TOKEN` and `NOTION_DATABASE_ID` required (server-only, not `NEXT_PUBLIC_*`); `NEXT_PUBLIC_KANBAN_URL/LABEL` and `NEXT_PUBLIC_ADD_URL/LABEL` optional
- **Path alias**: `@/*` → `./src/*`
- **Docker**: multi-stage standalone build (`node:22-alpine`), runs as non-root `nextjs` user, published to GHCR via GitHub Actions on push to `main`/`dev`
