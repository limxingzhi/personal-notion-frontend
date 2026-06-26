import { readCache } from "@/lib/cache"
import { readButtons } from "@/lib/buttons"
import HomePageClient from "./HomePageClient"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [buttons, tasksCached, descCached] = await Promise.all([
    Promise.resolve(readButtons()),
    readCache(),
    readCache("description"),
  ])

  return (
    <HomePageClient
      initialTasks={tasksCached?.data ?? null}
      initialDescription={descCached?.data ?? null}
      initialButtons={buttons}
      initialUpdatedAt={tasksCached?.timestamp ?? null}
      initialCachedLabel={tasksCached ? (tasksCached.fresh ? "fresh" : "cached") : null}
    />
  )
}
