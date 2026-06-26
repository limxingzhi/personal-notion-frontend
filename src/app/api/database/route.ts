import { NextResponse } from "next/server"

const NOTION_TOKEN = process.env.NOTION_TOKEN!
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!
const NOTION_VERSION = "2022-06-28"

export async function GET() {
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
    return NextResponse.json({ description: "" }, { status: 200 })
  }

  const data: any = await res.json()
  const description = data.description?.[0]?.plain_text ?? ""

  return NextResponse.json({ description })
}
