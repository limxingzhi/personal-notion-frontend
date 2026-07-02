import { NextResponse } from "next/server"
import { readCache, writeCache } from "@/lib/cache"

const NOTION_TOKEN = process.env.NOTION_TOKEN!
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const NOTION_VERSION = "2022-06-28"

async function fetchDescription() {
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
    return { description: "" }
  }

  const data: any = await res.json()
  const description = data.description?.map((t: any) => t.plain_text).join("") ?? ""
  await writeCache(description, "description")
  return { description }
}

export async function GET() {
  const cached = await readCache("description")
  if (cached) {
    return NextResponse.json({ description: cached.data, fresh: cached.fresh, updatedAt: cached.timestamp })
  }
  const { description } = await fetchDescription()
  return NextResponse.json({ description, fresh: true, updatedAt: Date.now() })
}

export async function POST() {
  const { description } = await fetchDescription()
  return NextResponse.json({ description, fresh: true, updatedAt: Date.now() })
}
