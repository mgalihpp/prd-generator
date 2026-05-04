const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"

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
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://prd-engine.local",
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

export type OpenRouterModel = {
  id: string
  name?: string
  context_length?: number
  pricing?: {
    prompt?: string
    completion?: string
  }
}

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const res = await fetch(OPENROUTER_MODELS_URL, {
    headers: {
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://prd-engine.local",
      "X-Title": "PRD Engine Pro",
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  const models: OpenRouterModel[] = Array.isArray(data?.data)
    ? data.data
        .filter((model: Partial<OpenRouterModel>) => typeof model.id === "string")
        .map((model: OpenRouterModel) => ({
          id: model.id,
          name: model.name,
          context_length: model.context_length,
          pricing: model.pricing
            ? { prompt: model.pricing.prompt, completion: model.pricing.completion }
            : undefined,
        }))
    : []

  return models
}

// Stream transformation helper for generate-prd
export function createOpenRouterStreamTransformer() {
  return new TransformStream<Uint8Array, string>({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk)
      const lines = text.split("\n")
      
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) continue
        const data = trimmed.slice(5).trim()
        if (data === "[DONE]") {
          controller.terminate()
          return
        }
        try {
          const parsed = JSON.parse(data)
          const delta: string | undefined = parsed?.choices?.[0]?.delta?.content
          if (delta) {
            controller.enqueue(delta)
          }
        } catch {
          // ignore non-JSON keepalives
        }
      }
    },
  })
}
