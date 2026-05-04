const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

export type OpenRouterMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function callOpenRouter(opts: {
  apiKey: string
  model: string
  messages: OpenRouterMessage[]
  json?: boolean
  stream?: boolean
}) {
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
  }
  if (opts.json) {
    body.response_format = { type: "json_object" }
  }
  if (opts.stream) {
    body.stream = true
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
      "HTTP-Referer": "https://prd-engine.local",
      "X-Title": "PRD Engine Pro",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 500)}`)
  }
  return res
}

export async function callOpenRouterJSON<T>(opts: {
  apiKey: string
  model: string
  messages: OpenRouterMessage[]
}): Promise<T> {
  const res = await callOpenRouter({ ...opts, json: true })
  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ""
  // Strip code fences if any
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // try to extract JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as T
    throw new Error("AI response was not valid JSON: " + content.slice(0, 300))
  }
}
