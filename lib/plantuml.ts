// Encode PlantUML diagram text into a rendering URL.
//
// Uses PlantUML's simple HEX encoding (prefix "~h") which requires NO deflate
// compression — keeping this dependency-free. See:
// https://plantuml.com/text-encoding
//
// Trade-off: HEX URLs are longer than the deflate form, and the diagram text is
// sent to the public PlantUML server for rendering.

const PLANTUML_SERVER = "https://www.plantuml.com/plantuml"

function toHex(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let hex = ""
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0")
  }
  return hex
}

/** Build a PlantUML server URL for the given diagram source. */
export function plantumlUrl(
  source: string,
  format: "svg" | "png" = "svg"
): string {
  const trimmed = source.trim()
  // Ensure @startuml/@enduml wrappers so bare snippets still render.
  const wrapped = /@start\w+/i.test(trimmed)
    ? trimmed
    : `@startuml\n${trimmed}\n@enduml`
  return `${PLANTUML_SERVER}/${format}/~h${toHex(wrapped)}`
}
