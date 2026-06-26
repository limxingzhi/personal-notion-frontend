"use client"

import { useEffect, useState, useCallback, useMemo } from "react"

interface Task {
  id: string
  name: string
  status: string
  dueDate: string | null
  shortNote: string
  url: string
}

function relativeDate(dueDate: string | null): { text: string; tag: string | null } {
  if (!dueDate) return { text: "", tag: null }
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffMs = due.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays < 0)
    return { text: `${Math.abs(diffDays)}d ago`, tag: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" }
  if (diffDays === 0)
    return { text: "Today", tag: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200" }
  if (diffDays === 1)
    return { text: "Tomorrow", tag: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200" }
  if (diffDays <= 3)
    return { text: `In ${diffDays} days`, tag: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200" }
  return { text: `In ${diffDays} days`, tag: null }
}

const SECTION_ORDER = ["In progress", "To Do"]

const SECTION_SUBTITLE: Record<string, string> = {
  "In progress": "Tackle these today.",
  "To Do": "On the horizon — next few days.",
  Inbox: "This week's watchlist.",
}

function sectionRank(status: string): number {
  const i = SECTION_ORDER.indexOf(status)
  return i === -1 ? SECTION_ORDER.length : i
}

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [cachedLabel, setCachedLabel] = useState<string>("")
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const fetchTasks = useCallback(async (refresh = false) => {
    setLoading(true)
    const res = await fetch("/api/tasks", {
      method: refresh ? "POST" : "GET",
    })
    const data = await res.json()
    setTasks(data.tasks)
    setCachedLabel(data.fresh ? "fresh" : "cached")
    setUpdatedAt(data.updatedAt)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const sections = useMemo(() => {
    const grouped = new Map<string, Task[]>()
    for (const task of tasks) {
      const group = grouped.get(task.status) ?? []
      group.push(task)
      grouped.set(task.status, group)
    }
    return [...grouped.entries()].sort(
      ([a], [b]) => sectionRank(a) - sectionRank(b),
    )
  }, [tasks])

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Task Tracker</h1>
        <div className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_ADD_URL && (
            <a
              href={process.env.NEXT_PUBLIC_ADD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              {process.env.NEXT_PUBLIC_ADD_LABEL ?? "Add"}
            </a>
          )}
          {process.env.NEXT_PUBLIC_KANBAN_URL ? (
            <a
              href={process.env.NEXT_PUBLIC_KANBAN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              {process.env.NEXT_PUBLIC_KANBAN_LABEL ?? "Kanban"}
            </a>
          ) : (
            <a
              href="https://app.notion.com/p/38ac42a1162380f6860ce8d45ec97419?v=38ac42a1162380fb8f67000c794b27c1"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Week kanban
            </a>
          )}
          <button
            onClick={() => fetchTasks(true)}
            disabled={loading}
            className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {tasks.length === 0 && !loading ? (
        <p className="text-gray-500 dark:text-gray-400">No tasks to show.</p>
      ) : (
        <div className="space-y-6">
          {sections.map(([status, items]) => (
            <section key={status}>
              <h2 className="mb-1 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                {status}
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </h2>
              <p className="mb-2 text-center text-xs text-gray-400 dark:text-gray-500">
                {SECTION_SUBTITLE[status] ?? ""}
              </p>
              <ul className="space-y-1">
                {items.map((task) => {
                  const rd = relativeDate(task.dueDate)

                  return (
                    <li
                      key={task.id}
                      className="flex items-start gap-3 py-1"
                    >
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <span className="block">{task.name}</span>
                        {task.shortNote.trim() && (
                          <span className="block text-xs text-gray-400 dark:text-gray-500">
                            {task.shortNote}
                          </span>
                        )}
                      </a>
                      {rd.tag ? (
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${rd.tag}`}>
                          {rd.text}
                        </span>
                      ) : rd.text ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {rd.text}
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {updatedAt && (
        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          Last updated: {new Date(updatedAt).toLocaleTimeString()} · {cachedLabel}
        </p>
      )}
    </main>
  )
}
