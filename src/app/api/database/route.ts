import { NextResponse } from "next/server"
import { readCache, writeCache } from "@/lib/cache"

const NOTION_TOKEN = process.env.NOTION_TOKEN!
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const NOTION_VERSION = "2022-06-28"

async function fetchDescription() {
  console.log(`[notion] fetching database description`)
  const res = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`,
    {
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
    },
  )

  if (!res.ok) {
    console.log(`[notion] description fetch failed: ${res.status}`)
    return { description: "" }
  }

  const data: any = await res.json()
  const description = data.description?.map((t: any) => t.plain_text).join("") ?? ""
  console.log(`[notion] description: ${description.slice(0, 60)}${description.length > 60 ? "..." : ""}`)
  await writeCache(description, "description")
  return { description }
}

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown"
  console.log(`[api] ${ip} GET /api/database`)
  const cached = await readCache("description")
  if (cached) {
    return NextResponse.json({ description: cached.data, fresh: cached.fresh, updatedAt: cached.timestamp })
  }
  const { description } = await fetchDescription()
  return NextResponse.json({ description, fresh: true, updatedAt: Date.now() })
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown"
  console.log(`[api] ${ip} POST /api/database — force refresh`)
  const { description } = await fetchDescription()
  return NextResponse.json({ description, fresh: true, updatedAt: Date.now() })
}
