import { NextResponse } from "next/server"
import { readCache, writeCache } from "@/lib/cache"
import { fetchFromNotion } from "@/lib/notion"

export async function GET() {
  const cached = await readCache()

  if (cached) {
    return NextResponse.json({ tasks: cached.data, fresh: cached.fresh, updatedAt: cached.timestamp })
  }

  // Cold start — fetch from Notion
  const tasks = await fetchFromNotion()
  await writeCache(tasks)
  return NextResponse.json({ tasks, fresh: true, updatedAt: Date.now() })
}

export async function POST() {
  const tasks = await fetchFromNotion()
  await writeCache(tasks)
  return NextResponse.json({ tasks, fresh: true, updatedAt: Date.now() })
}
