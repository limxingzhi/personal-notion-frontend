import { readFile, writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"

const CACHE_DIR = path.join(process.cwd(), ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "tasks.json")
const TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: any
  timestamp: number
}

export async function readCache(name = "tasks"): Promise<{ data: any; fresh: boolean; timestamp: number } | null> {
  const file = name === "tasks" ? CACHE_FILE : path.join(CACHE_DIR, `${name}.json`)
  try {
    if (!existsSync(file)) return null
    const raw = await readFile(file, "utf-8")
    const entry: CacheEntry = JSON.parse(raw)
    const fresh = Date.now() - entry.timestamp < TTL_MS
    return { data: entry.data, fresh, timestamp: entry.timestamp }
  } catch {
    return null
  }
}

export async function writeCache(data: any, name = "tasks"): Promise<void> {
  const file = name === "tasks" ? CACHE_FILE : path.join(CACHE_DIR, `${name}.json`)
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
  const entry: CacheEntry = { data, timestamp: Date.now() }
  await writeFile(file, JSON.stringify(entry), "utf-8")
}
