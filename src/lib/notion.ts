export interface Task {
  id: string
  name: string
  status: string
  dueDate: string | null
  shortNote: string
  url: string
  archivedAt: string | null
}

const NOTION_TOKEN = process.env.NOTION_TOKEN!
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const NOTION_VERSION = "2022-06-28"

export function getTitle(prop: any): string {
  return prop?.title?.map((t: any) => t.plain_text).join("") ?? ""
}

export function getRichText(prop: any): string {
  return prop?.rich_text?.map((t: any) => t.plain_text).join("") ?? ""
}

export function getStatus(prop: any): string | null {
  return prop?.status?.name ?? null
}

export function getDate(prop: any): string | null {
  return prop?.date?.start ?? null
}

export async function fetchFromNotion(): Promise<Task[]> {
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const res = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({
        filter: {
          or: [
            {
              property: "Status",
              status: { equals: "In progress" },
            },
            {
              property: "Status",
              status: { equals: "To Do" },
            },
            {
              property: "Status",
              status: { equals: "Done" },
            },
            {
              and: [
                {
                  property: "Status",
                  status: { equals: "Inbox" },
                },
                {
                  property: "Due Date",
                  date: {
                    on_or_before: weekFromNow.toISOString().split("T")[0],
                  },
                },
              ],
            },
          ],
        },
        sorts: [{ property: "Due Date", direction: "ascending" }],
      }),
    },
  )

  if (!res.ok) {
    throw new Error(`Notion API error: ${res.status} ${await res.text()}`)
  }

  const data: any = await res.json()

  return data.results.map((page: any) => ({
    id: page.id,
    name: getTitle(page.properties.Name),
    status: getStatus(page.properties.Status) ?? "",
    dueDate: getDate(page.properties["Due Date"]),
    shortNote: getRichText(page.properties["Short note"]),
    url: page.url,
    archivedAt: page.last_edited_time ?? null,
  }))
}
