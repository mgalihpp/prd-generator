import { callOpenRouter } from "@/lib/openrouter"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SYSTEM = `Kamu adalah Product Manager senior yang menulis Product Requirements Document (PRD) profesional.

Tulis PRD lengkap dalam format Markdown GitHub-flavored (gunakan heading, bullet, tabel, code block bila perlu) dengan struktur berikut:

# PRD: [Nama Produk]

## 1. Ringkasan (Overview)
## 2. Tujuan & Sasaran
## 3. Target Pengguna & Persona
## 4. Masalah yang Dipecahkan
## 5. Use Cases / User Stories
## 6. Fitur Utama (MVP)
   - Tabel: Fitur | Prioritas | Deskripsi
## 7. Fitur Lanjutan (Post-MVP)
## 8. Arsitektur Teknis
   - Sub-bagian: Frontend, Backend, Database, Deployment & Infrastruktur
   - Sertakan tech yang dipilih pengguna + alasan
## 9. Skema Data (high-level)
## 10. API & Integrasi Eksternal
## 11. Metrik Sukses (KPI)
## 12. Risiko & Mitigasi
## 13. Roadmap & Milestones (3-6 bulan pertama)
## 14. Asumsi & Out-of-Scope

Tulis dalam Bahasa Indonesia yang profesional dan detail. Jangan tambahkan kata pengantar atau kalimat di luar dokumen — keluarkan langsung markdown PRD.`

export async function POST(req: Request) {
  try {
    const { concept, conceptResult, architecture, apiKey, model } = await req.json()
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), { status: 400 })
    }

    const userPrompt = `Konsep produk:\n"""\n${concept}\n"""\n\nAnalisis konsep:\n${JSON.stringify(conceptResult, null, 2)}\n\nTech stack yang dipilih pengguna:\n${JSON.stringify(architecture, null, 2)}\n\nTuliskan PRD markdown lengkap.`

    const upstream = await callOpenRouter({
      apiKey,
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      stream: true,
    })

    if (!upstream.body) {
      return new Response(JSON.stringify({ error: "No upstream body" }), { status: 502 })
    }

    // Transform OpenRouter SSE to plain text stream of markdown deltas
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ""

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ""

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith("data:")) continue
              const data = trimmed.slice(5).trim()
              if (data === "[DONE]") {
                controller.close()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const delta: string | undefined = parsed?.choices?.[0]?.delta?.content
                if (delta) {
                  controller.enqueue(encoder.encode(delta))
                }
              } catch {
                // ignore non-JSON keepalives
              }
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
