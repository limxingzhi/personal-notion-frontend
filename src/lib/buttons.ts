import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { load } from "js-yaml"

export interface Button {
  label: string
  url: string
}

interface ButtonConfig {
  buttons: Button[]
}

const BUTTONS_PATH = path.join(process.cwd(), "buttons.yaml")

export function readButtons(): Button[] {
  try {
    if (!existsSync(BUTTONS_PATH)) return []
    const raw = readFileSync(BUTTONS_PATH, "utf-8")
    const config = load(raw) as ButtonConfig
    return config?.buttons ?? []
  } catch {
    return []
  }
}
