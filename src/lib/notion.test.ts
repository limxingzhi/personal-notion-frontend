import { describe, it, expect } from "vitest"
import { getTitle, getRichText, getStatus, getDate } from "./notion"

describe("getTitle", () => {
  it("joins multiple title segments", () => {
    const prop = {
      title: [
        { plain_text: "Follow up on " },
        { plain_text: "productivity" },
        { plain_text: " research" },
      ],
    }
    expect(getTitle(prop)).toBe("Follow up on productivity research")
  })

  it("handles single segment", () => {
    const prop = {
      title: [{ plain_text: "Hello world" }],
    }
    expect(getTitle(prop)).toBe("Hello world")
  })

  it("returns empty string for missing title", () => {
    expect(getTitle({})).toBe("")
    expect(getTitle(null)).toBe("")
    expect(getTitle(undefined)).toBe("")
  })

  it("returns empty string for empty title array", () => {
    expect(getTitle({ title: [] })).toBe("")
  })
})

describe("getRichText", () => {
  it("joins all rich text segments with formatting", () => {
    // Real data from the "Follow up on productivity research" page
    const prop = {
      rich_text: [
        {
          plain_text: "Reflect on how the ",
          annotations: { bold: false },
        },
        {
          plain_text: "Minimal",
          annotations: { bold: true },
        },
        {
          plain_text: " Viable Routine and Energy Levels are working out.",
          annotations: { bold: false },
        },
      ],
    }
    expect(getRichText(prop)).toBe(
      "Reflect on how the Minimal Viable Routine and Energy Levels are working out."
    )
  })

  it("handles single segment", () => {
    const prop = {
      rich_text: [{ plain_text: "Quick note" }],
    }
    expect(getRichText(prop)).toBe("Quick note")
  })

  it("handles code annotations", () => {
    const prop = {
      rich_text: [
        { plain_text: "Run " },
        { plain_text: "npm test" },
        { plain_text: " to verify" },
      ],
    }
    expect(getRichText(prop)).toBe("Run npm test to verify")
  })

  it("handles links", () => {
    const prop = {
      rich_text: [
        { plain_text: "See " },
        { plain_text: "details", href: "https://example.com" },
        { plain_text: " for more" },
      ],
    }
    expect(getRichText(prop)).toBe("See details for more")
  })

  it("returns empty string for missing rich_text", () => {
    expect(getRichText({})).toBe("")
    expect(getRichText(null)).toBe("")
    expect(getRichText(undefined)).toBe("")
  })

  it("returns empty string for empty rich_text array", () => {
    expect(getRichText({ rich_text: [] })).toBe("")
  })
})

describe("getStatus", () => {
  it("returns status name", () => {
    const prop = { status: { name: "In progress", color: "blue" } }
    expect(getStatus(prop)).toBe("In progress")
  })

  it("returns null for missing status", () => {
    expect(getStatus({})).toBeNull()
    expect(getStatus(null)).toBeNull()
    expect(getStatus(undefined)).toBeNull()
  })
})

describe("getDate", () => {
  it("returns date start", () => {
    const prop = { date: { start: "2026-07-03" } }
    expect(getDate(prop)).toBe("2026-07-03")
  })

  it("returns null for missing date", () => {
    expect(getDate({})).toBeNull()
    expect(getDate(null)).toBeNull()
    expect(getDate(undefined)).toBeNull()
  })
})
