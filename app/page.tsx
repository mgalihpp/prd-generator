"use client"

import { useEffect, useRef, useState } from "react"
import { Header } from "@/components/prd/Header"
import { ApiKeyModal, loadConfig } from "@/components/prd/ApiKeyModal"
import { ConceptStep } from "@/components/prd/ConceptStep"
import { ConceptRefinement } from "@/components/prd/ConceptRefinement"
import { ArchitectureStep } from "@/components/prd/ArchitectureStep"
import { DocumentStep } from "@/components/prd/DocumentStep"
import { LoadingScreen } from "@/components/prd/LoadingScreen"
import { callOpenRouter, callOpenRouterJSON } from "@/lib/openrouter-client"
import type {
  ApiKeyConfig,
  ArchCategory,
  ArchitectureResult,
  ConceptResult,
  SelectedArchitecture,
  Step,
  TechOption,
} from "@/lib/types"
import { DEFAULT_MODELS } from "@/lib/types"

type StepKey = "concept" | "architecture" | "document"

const STEP_KEY: Record<Step, StepKey> = {
  "concept-input": "concept",
  "concept-loading": "concept",
  "concept-result": "concept",
  "arch-loading": "architecture",
  "arch-result": "architecture",
  "doc-loading": "document",
  "doc-result": "document",
}

export default function Page() {
  const [step, setStep] = useState<Step>("concept-input")
  const [concept, setConcept] = useState("")
  const [conceptResult, setConceptResult] = useState<ConceptResult | null>(null)
  const [arch, setArch] = useState<ArchitectureResult | null>(null)
  const [selected, setSelected] = useState<SelectedArchitecture>({})
  const [markdown, setMarkdown] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [docPhase, setDocPhase] = useState<"research" | "compile">("research")
  const [revising, setRevising] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [config, setConfig] = useState<ApiKeyConfig>({ apiKey: "", model: DEFAULT_MODELS[0] })
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const cfg = loadConfig()
    setConfig(cfg)
    setHydrated(true)
    if (!cfg.apiKey) setApiKeyOpen(true)
  }, [])

  const ensureKey = (): boolean => {
    if (!config.apiKey) {
      setApiKeyOpen(true)
      return false
    }
    return true
  }

  const handleAnalyze = async (text: string) => {
    if (!ensureKey()) return
    setConcept(text)
    setStep("concept-loading")
    setError(null)
    try {
      const SYSTEM = `Kamu adalah analis produk senior. Diberikan deskripsi konsep produk dari pengguna (dalam Bahasa Indonesia), hasilkan analisis terstruktur.

Selalu kembalikan JSON valid persis dengan skema berikut (tanpa markdown, tanpa code fence):
{
  "elevatorPitch": "string - 3-5 kalimat ringkas tentang apa, untuk siapa, dan keunggulannya",
  "targetUser": "string - 2-3 kalimat tentang segmen pengguna utama",
  "keyProblems": ["string", "string", "string"],
  "useCases": ["string", "string", "string", "string"]
}

Tulis dalam Bahasa Indonesia yang natural dan profesional.`

      const userPrompt = `Konsep produk:\n"""\n${text}\n"""\n\nHasilkan analisis JSON.`

      const result = await callOpenRouterJSON<ConceptResult>({
        apiKey: config.apiKey,
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      })

      // Defensive normalization
      const normalized: ConceptResult = {
        elevatorPitch: String(result.elevatorPitch ?? ""),
        targetUser: String(result.targetUser ?? ""),
        keyProblems: Array.isArray(result.keyProblems) ? result.keyProblems.map(String) : [],
        useCases: Array.isArray(result.useCases) ? result.useCases.map(String) : [],
      }

      setConceptResult(normalized)
      setStep("concept-result")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
      setStep("concept-input")
    }
  }

  const handleRevise = async (feedback: string) => {
    if (!ensureKey() || !conceptResult) return
    setRevising(true)
    setError(null)
    try {
      const SYSTEM = `Kamu adalah analis produk senior. Diberikan deskripsi konsep produk dari pengguna (dalam Bahasa Indonesia), hasilkan analisis terstruktur.

Selalu kembalikan JSON valid persis dengan skema berikut (tanpa markdown, tanpa code fence):
{
  "elevatorPitch": "string - 3-5 kalimat ringkas tentang apa, untuk siapa, dan keunggulannya",
  "targetUser": "string - 2-3 kalimat tentang segmen pengguna utama",
  "keyProblems": ["string", "string", "string"],
  "useCases": ["string", "string", "string", "string"]
}

Tulis dalam Bahasa Indonesia yang natural dan profesional.`

      const userPrompt = `Konsep produk awal:\n"""\n${concept}\n"""\n\nAnalisis sebelumnya:\n${JSON.stringify(conceptResult)}\n\nFeedback dari pengguna untuk merevisi:\n"""\n${feedback}\n"""\n\nPerbarui dan keluarkan JSON terbaru sesuai skema.`

      const result = await callOpenRouterJSON<ConceptResult>({
        apiKey: config.apiKey,
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      })

      // Defensive normalization
      const normalized: ConceptResult = {
        elevatorPitch: String(result.elevatorPitch ?? ""),
        targetUser: String(result.targetUser ?? ""),
        keyProblems: Array.isArray(result.keyProblems) ? result.keyProblems.map(String) : [],
        useCases: Array.isArray(result.useCases) ? result.useCases.map(String) : [],
      }

      setConceptResult(normalized)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setRevising(false)
    }
  }

  const handleProceedArch = async () => {
    if (!ensureKey() || !conceptResult) return
    setStep("arch-loading")
    setError(null)
    try {
      const SYSTEM = `Kamu adalah arsitek solusi senior. Diberikan konsep produk dan analisisnya, hasilkan rekomendasi tech stack untuk 4 kategori: frontend, backend, database, dan deployment.

Untuk setiap kategori, berikan TEPAT 4 opsi dengan tier berbeda:
- "hemat" = paling hemat biaya / cepat dipasang
- "standard" = pilihan yang seimbang
- "populer" = paling banyak diadopsi komunitas
- "pro" = enterprise-grade / paling skalabel

Selalu kembalikan JSON valid persis dengan skema berikut (tanpa markdown, tanpa code fence):
{
  "frontend":   [{ "tier": "hemat", "name": "...", "description": "..." }, { "tier": "standard", ...}, { "tier": "populer", ...}, { "tier": "pro", ...}],
  "backend":    [4 opsi dengan tier sama],
  "database":   [4 opsi dengan tier sama],
  "deployment": [4 opsi dengan tier sama]
}

Setiap "description" 2-3 kalimat dalam Bahasa Indonesia yang menjelaskan kelebihan dan use-case kontekstual untuk produk ini. Sertakan alasan spesifik kenapa cocok untuk konsep produk yang diberikan.`

      const userPrompt = `Konsep produk:\n"""\n${concept}\n"""\n\nAnalisis konsep:\n${JSON.stringify(conceptResult, null, 2)}\n\nHasilkan rekomendasi arsitektur JSON sesuai skema.`

      const result = await callOpenRouterJSON<ArchitectureResult>({
        apiKey: config.apiKey,
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      })

      const cats: (keyof ArchitectureResult)[] = ["frontend", "backend", "database", "deployment"]
      const validTiers = new Set(["hemat", "standard", "populer", "pro"])
      const normalized: ArchitectureResult = {
        frontend: [],
        backend: [],
        database: [],
        deployment: [],
      }
      for (const c of cats) {
        const arr = Array.isArray(result[c]) ? result[c] : []
        normalized[c] = arr
          .filter((o) => o && validTiers.has(o.tier))
          .map((o) => ({
            tier: o.tier,
            name: String(o.name ?? ""),
            description: String(o.description ?? ""),
          }))
      }

      setArch(normalized)
      setStep("arch-result")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
      setStep("concept-result")
    }
  }

  const handleSelect = (cat: ArchCategory, opt: TechOption) => {
    setSelected((s) => ({ ...s, [cat]: opt }))
  }

  const handleProceedDoc = async () => {
    if (!ensureKey() || !conceptResult || !arch) return
    setMarkdown("")
    setStep("doc-loading")
    setDocPhase("research")
    setError(null)

    // Quick "research" phase visual delay (1.2s) before compile
    await new Promise((r) => setTimeout(r, 1200))
    setDocPhase("compile")

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

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

    const userPrompt = `Konsep produk:\n"""\n${concept}\n"""\n\nAnalisis konsep:\n${JSON.stringify(conceptResult, null, 2)}\n\nTech stack yang dipilih pengguna:\n${JSON.stringify(selected, null, 2)}\n\nTuliskan PRD markdown lengkap.`

    try {
      const res = await callOpenRouter({
        apiKey: config.apiKey,
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      })

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "")
        throw new Error(txt || "Gagal generate PRD")
      }
      setStep("doc-result")
      setStreaming(true)

      // Transform SSE stream to plain text
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      let acc = ""
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
              setStreaming(false)
              return
            }
            try {
              const parsed = JSON.parse(data)
              const delta: string | undefined = parsed?.choices?.[0]?.delta?.content
              if (delta) {
                acc += delta
                setMarkdown(acc)
              }
            } catch {
              // ignore non-JSON keepalives
            }
          }
        }
      } catch (err) {
        // Abort or other error during reading
      }
      setStreaming(false)
    } catch (e) {
      setStreaming(false)
      if ((e as Error).name === "AbortError") return
      setError(e instanceof Error ? e.message : "Error")
      setStep("arch-result")
    }
  }

  const handleReset = () => {
    abortRef.current?.abort()
    setStep("concept-input")
    setConcept("")
    setConceptResult(null)
    setArch(null)
    setSelected({})
    setMarkdown("")
    setError(null)
  }

  if (!hydrated) {
    return <div className="min-h-svh bg-[#0a0a0a]" />
  }

  const activeStep = STEP_KEY[step]
  const completed: Record<StepKey, boolean> = {
    concept: ["arch-loading", "arch-result", "doc-loading", "doc-result"].includes(step),
    architecture: ["doc-loading", "doc-result"].includes(step),
    document: false,
  }

  return (
    <div className="min-h-svh flex flex-col">
      <Header
        active={activeStep}
        completed={completed}
        onReset={handleReset}
        onOpenApiKey={() => setApiKeyOpen(true)}
      />

      {error && (
        <div className="bg-red-950/40 border-y border-red-900 text-red-200 px-6 py-3 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {step === "concept-input" && (
          <ConceptStep initial={concept} onAnalyze={handleAnalyze} />
        )}
        {step === "concept-loading" && <LoadingScreen variant="concept" />}
        {step === "concept-result" && conceptResult && (
          <ConceptRefinement
            result={conceptResult}
            onRevise={handleRevise}
            onProceed={handleProceedArch}
            revising={revising}
          />
        )}
        {step === "arch-loading" && <LoadingScreen variant="architecture" />}
        {step === "arch-result" && arch && (
          <ArchitectureStep
            arch={arch}
            selected={selected}
            onSelect={handleSelect}
            onProceed={handleProceedDoc}
          />
        )}
        {step === "doc-loading" && (
          <LoadingScreen
            variant={docPhase === "research" ? "research" : "compile"}
            phaseLabel={docPhase === "compile" ? "Fase 1/1" : undefined}
          />
        )}
        {step === "doc-result" && (
          <DocumentStep markdown={markdown} isStreaming={streaming} />
        )}
      </main>

      <ApiKeyModal
        open={apiKeyOpen}
        onClose={() => setApiKeyOpen(false)}
        onSave={(cfg) => setConfig(cfg)}
      />
    </div>
  )
}
