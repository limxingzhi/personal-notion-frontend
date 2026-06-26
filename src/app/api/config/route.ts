import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    kanbanUrl: process.env.NEXT_PUBLIC_KANBAN_URL ?? "",
    kanbanLabel: process.env.NEXT_PUBLIC_KANBAN_LABEL ?? "Week kanban",
    addUrl: process.env.NEXT_PUBLIC_ADD_URL ?? "",
    addLabel: process.env.NEXT_PUBLIC_ADD_LABEL ?? "Add",
  })
}
