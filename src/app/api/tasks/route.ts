import { NextResponse } from "next/server"
import { readCache, writeCache } from "@/lib/cache"
import { fetchFromNotion } from "@/lib/notion"

export async function GET(request: Request) {
  console.log(`[api] GET /api/tasks ${request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown"}`)
  const cached = await readCache()

  if (cached) {
    console.log(`[api] tasks cache ${cached.fresh ? "fresh" : "stale"}`)
    return NextResponse.json({ tasks: cached.data, fresh: cached.fresh, updatedAt: cached.timestamp })
  }

  console.log("[api] tasks cold start — fetching from Notion")
  const tasks = await fetchFromNotion()
  await writeCache(tasks)
  return NextResponse.json({ tasks, fresh: true, updatedAt: Date.now() })
}

export async function POST(request: Request) {
  console.log(`[api] POST /api/tasks — force refresh ${request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown"}`)
  const tasks = await fetchFromNotion()
  await writeCache(tasks)
  return NextResponse.json({ tasks, fresh: true, updatedAt: Date.now() })
}
