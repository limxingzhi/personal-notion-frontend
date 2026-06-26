import "@/app/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "My Notion tasks",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
