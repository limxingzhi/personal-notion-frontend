"use client"

import { useEffect, useState, useMemo } from "react"

interface Task {
  id: string
  name: string
  status: string
  dueDate: string | null
  shortNote: string
  url: string
  archivedAt: string | null
}

interface Button {
  label: string
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

const SECTION_ORDER = ["In progress", "To Do", "Inbox", "Done"]

const SECTION_SUBTITLE: Record<string, string> = {
  "In progress": "Tackle these today.",
  "To Do": "On the horizon — next few days.",
  Inbox: "This week's watchlist.",
  Done: "Cleared off the plate.",
}

function sectionRank(status: string): number {
  const i = SECTION_ORDER.indexOf(status)
  return i === -1 ? SECTION_ORDER.length : i
}

interface HomePageClientProps {
  initialTasks: Task[] | null
  initialDescription: string | null
  initialButtons: Button[]
  initialUpdatedAt: number | null
  initialCachedLabel: string | null
}

export default function HomePageClient({
  initialTasks,
  initialDescription,
  initialButtons,
  initialUpdatedAt,
  initialCachedLabel,
}: HomePageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks ?? [])
  const [loading, setLoading] = useState(false)
  const [cachedLabel, setCachedLabel] = useState<string>(initialCachedLabel ?? "")
  const [updatedAt, setUpdatedAt] = useState<number | null>(initialUpdatedAt)
  const [buttons, setButtons] = useState<Button[]>(initialButtons)
  const [description, setDescription] = useState<string>(initialDescription ?? "")

  const fetchTasks = async (refresh = false) => {
    setLoading(true)
    const [tasksRes, descRes] = await Promise.all([
      fetch("/api/tasks", { method: refresh ? "POST" : "GET" }),
      refresh ? fetch("/api/database", { method: "POST" }).then(r => r.json()) : Promise.resolve(null),
    ])
    const tasksData = await tasksRes.json()
    setTasks(tasksData.tasks)
    if (descRes) setDescription(descRes.description)
    setCachedLabel(tasksData.fresh ? "fresh" : "cached")
    setUpdatedAt(tasksData.updatedAt)
    setLoading(false)
  }

  // On mount, refetch if cache missed server-side
  useEffect(() => {
    if (initialTasks === null) fetchTasks()
    if (initialDescription === null) {
      fetch("/api/database").then(r => r.json()).then(data => setDescription(data.description))
    }
    if (initialButtons.length === 0) {
      fetch("/api/config").then(r => r.json()).then(data => setButtons(data.buttons ?? []))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          {buttons.map((btn, i) => (
            <a
              key={i}
              href={btn.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              {btn.label}
            </a>
          ))}
          <button
            onClick={() => fetchTasks(true)}
            disabled={loading}
            className="rounded border px-3 py-1 text-sm transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {description && (
        <p className="mb-6 text-center text-sm italic text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

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
                  const archiveLabel = task.status === "Done" && task.archivedAt
                    ? `Done ${relativeDate(task.archivedAt).text}`
                    : null

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
                      {archiveLabel ? (
                        <span className="whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
                          {archiveLabel}
                        </span>
                      ) : rd.tag ? (
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
