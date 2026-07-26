import { NextResponse } from "next/server"

import type { OpenRouterModel } from "@/lib/types"

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"

export async function GET() {
  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        "HTTP-Referer": "https://prd-engine.local",
        "X-Title": "PRD Engine Pro",
      },
      next: { revalidate: 60 * 60 },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json(
        { error: `OpenRouter ${res.status}: ${text.slice(0, 300)}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    const models: OpenRouterModel[] = Array.isArray(data?.data)
      ? data.data
          .filter(
            (model: Partial<OpenRouterModel>) => typeof model.id === "string"
          )
          .map((model: OpenRouterModel) => ({
            id: model.id,
            name: model.name,
            context_length: model.context_length,
            pricing: model.pricing
              ? {
                  prompt: model.pricing.prompt,
                  completion: model.pricing.completion,
                }
              : undefined,
          }))
      : []

    return NextResponse.json({ models })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil model OpenRouter",
      },
      { status: 500 }
    )
  }
}
