---
name: nextjs
description: Next.js project patterns, commands, and best practices. Use when building or modifying Next.js apps (App Router, pages, API routes, data fetching, server components).
---

# Next.js Skill

## Project Structure

- `app/` — App Router pages and layouts
- `app/api/` — API routes (Route Handlers)
- `components/` — Shared React components
- `lib/` — Utility functions, shared logic
- `public/` — Static assets
- `styles/` — Global styles

## Conventions

- **Server components by default** — only add `"use client"` when you need interactivity (hooks, event handlers, browser APIs)
- **Route groups** — use `(group)` to organise without affecting URL
- **Loading/error states** — always add `loading.tsx` and `error.tsx` at relevant route segments
- **Data fetching** — prefer `async` server components over `useEffect`; use React Server Components (RSC) for initial data
- **API routes** — use Route Handlers in `app/api/` instead of pages/api
- **Server actions** — use `"use server"` for form mutations; prefer Actions over manual API endpoints for same-origin mutations

## Running the Project

```bash
npm run dev       # Development server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
npm run test      # Run tests (if configured)
```

## Component Patterns

### Server Component with Data Fetching

```tsx
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await getPosts()
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Client Component (interactivity)

```tsx
"use client"

import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Server Action

```tsx
"use server"

import { revalidatePath } from "next/cache"

export async function createItem(formData: FormData) {
  const title = formData.get("title")
  // persist...
  revalidatePath("/items")
}
```

## Common Libraries

- `next/navigation` — `useRouter()`, `usePathname()`, `useSearchParams()`
- `next/cache` — `revalidatePath()`, `revalidateTag()`, `unstable_cache()`
- `next/image` — `Image` component (use `sizes`, `priority` for LCP)
- `next/link` — `Link` component for client-side navigation
- `next/font` — `next/font/google` for custom fonts

## Testing

```bash
npx playwright test    # E2E tests
npx vitest run         # Unit/integration tests (if vitest configured)
npx jest               # Unit tests (if jest configured)
```

## Troubleshooting

- **Route not working** — check file name conventions (`page.tsx`, `layout.tsx`, `route.tsx`, `loading.tsx`, `error.tsx`)
- **Client component needed** — if you get an error about state/hooks/events, add `"use client"` directive at the top
- **"Failed to fetch" from server action** — ensure the action file has `"use server"` at the top (or the action is in a separate file)
- **Static/dynamic mismatch** — check if you need `export const dynamic = "force-dynamic"` or `export const revalidate = 60`
