---
name: notion
description: Notion API integration patterns, SDK usage, and best practices. Use when building Notion-connected features — database queries, page CRUD, blocks, and authentication.
---

# Notion Skill

## SDK

```bash
npm install @notionhq/client
```

## Client Setup

```ts
import { Client } from "@notionhq/client"

// Server-side only (RSC / Route Handlers / Server Actions)
const notion = new Client({ auth: process.env.NOTION_TOKEN })

// Client-side: proxy through Route Handler, never expose the token
```

## Database Queries

```ts
// Query a database
const response = await notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID,
  filter: {
    property: "Status",
    status: { equals: "Done" },
  },
  sorts: [{ property: "Created", direction: "descending" }],
})

// response.results — array of pages
// response.has_more — pagination flag
// response.next_cursor — cursor for next page
```

### Common Filters

```ts
// Text contains
{ property: "Name", rich_text: { contains: "search term" } }

// Date range
{ property: "Date", date: { after: "2024-01-01" } }

// Multi-select includes
{ property: "Tags", multi_select: { contains: "featured" } }

// Checkbox
{ property: "Published", checkbox: { equals: true } }

// Relation
{ property: "Project", relation: { contains: "page-id" } }

// Formula
{ property: "Score", formula: { number: { greater_than: 50 } } }
```

## Page Operations

```ts
// Create a page
await notion.pages.create({
  parent: { database_id: process.env.NOTION_DATABASE_ID },
  properties: {
    Name: { title: [{ text: { content: "New Page" } }] },
    Status: { status: { name: "Todo" } },
    Tags: { multi_select: [{ name: "featured" }] },
    Date: { date: { start: "2024-06-01" } },
  },
})

// Update a page
await notion.pages.update({
  page_id: "page-id",
  properties: {
    Status: { status: { name: "Done" } },
  },
})

// Retrieve a page
const page = await notion.pages.retrieve({ page_id: "page-id" })
```

## Property Value Types

The Notion API uses a verbose property format. Extract values with helpers:

```ts
function getTitle(prop: any): string {
  return prop?.title?.[0]?.plain_text ?? ""
}

function getRichText(prop: any): string {
  return prop?.rich_text?.[0]?.plain_text ?? ""
}

function getSelect(prop: any): string | null {
  return prop?.select?.name ?? null
}

function getStatus(prop: any): string | null {
  return prop?.status?.name ?? null
}

function getDate(prop: any): string | null {
  return prop?.date?.start ?? null
}

function getMultiSelect(prop: any): string[] {
  return prop?.multi_select?.map((s: any) => s.name) ?? []
}

function getCheckbox(prop: any): boolean {
  return prop?.checkbox ?? false
}

function getNumber(prop: any): number | null {
  return prop?.number ?? null
}
```

## Block API (Page Content)

```ts
// Get page blocks
const { results } = await notion.blocks.children.list({
  block_id: "page-id",
})

// Append blocks
await notion.blocks.children.append({
  block_id: "page-id",
  children: [
    {
      heading_2: {
        rich_text: [{ text: { content: "Section" } }],
      },
    },
    {
      paragraph: {
        rich_text: [{ text: { content: "Some text" } }],
      },
    },
  ],
})
```

## Search

```ts
const { results } = await notion.search({
  query: "search term",
  filter: { value: "page", property: "object" },
  sort: { direction: "descending", timestamp: "last_edited_time" },
})
```

## Error Handling

```ts
import {
  APIErrorCode,
  ClientErrorCode,
  isNotionClientError,
} from "@notionhq/client"

try {
  // notion call...
} catch (error) {
  if (isNotionClientError(error)) {
    switch (error.code) {
      case APIErrorCode.RateLimited:
        // Retry after backoff
        break
      case APIErrorCode.ObjectNotFound:
        // Handle missing page/db
        break
      case APIErrorCode.Unauthorized:
        // Token issue
        break
      case APIErrorCode.ValidationError:
        // Invalid request
        break
      default:
        throw error
    }
  }
}
```

## Rate Limiting

Notion API allows ~3 requests per second. For bulk operations, add throttling:

```ts
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Batch with delay
for (const item of items) {
  await notion.pages.create({ /* ... */ })
  await delay(350) // ~3 req/s
}
```

## Pagination

```ts
async function queryAll(databaseId: string, filter?: any) {
  const results: any[] = []
  let cursor: string | undefined

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
    })
    results.push(...response.results)
    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return results
}
```

## Best Practices

- **Never expose the Notion token client-side** — use Route Handlers or Server Actions
- **Cache database queries** when data doesn't need to be fresh every request
- **Use revalidation** — `revalidatePath()` after mutations to refresh cached views
- **Handle deleted pages gracefully** — they return `ObjectNotFound` or have `archived: true`
- **Property names are case-sensitive** in filters and page creation
