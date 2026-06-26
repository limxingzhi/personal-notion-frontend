import { readCache } from "@/lib/cache"
import HomePageClient from "./HomePageClient"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [config, tasksCached, descCached] = await Promise.all([
    (async () => ({
      kanbanUrl: process.env.NEXT_PUBLIC_KANBAN_URL ?? "",
      kanbanLabel: process.env.NEXT_PUBLIC_KANBAN_LABEL ?? "Week kanban",
      addUrl: process.env.NEXT_PUBLIC_ADD_URL ?? "",
      addLabel: process.env.NEXT_PUBLIC_ADD_LABEL ?? "Add",
    }))(),
    readCache(),
    readCache("description"),
  ])

  return (
    <HomePageClient
      initialTasks={tasksCached?.data ?? null}
      initialDescription={descCached?.data ?? null}
      initialConfig={config}
      initialUpdatedAt={tasksCached?.timestamp ?? null}
      initialCachedLabel={tasksCached ? (tasksCached.fresh ? "fresh" : "cached") : null}
    />
  )
}
