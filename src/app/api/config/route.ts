import { NextResponse } from "next/server"
import { readButtons } from "@/lib/buttons"

export async function GET() {
  return NextResponse.json({ buttons: readButtons() })
}
