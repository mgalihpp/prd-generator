"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, X, ExternalLink, KeyRound, ShieldCheck, Loader2 } from "lucide-react"
import { DEFAULT_MODELS, type OpenRouterModel } from "@/lib/types"
import { ModelSelector } from "./ModelSelector"

const STORAGE_KEY = "prd-engine-config"

export function loadConfig(): { apiKey: string; model: string } {
  if (typeof window === "undefined") return { apiKey: "", model: DEFAULT_MODELS[0] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        apiKey: parsed.apiKey || "",
        model: parsed.model || DEFAULT_MODELS[0],
      }
    }
  } catch {}
  return { apiKey: "", model: DEFAULT_MODELS[0] }
}

export function saveConfig(cfg: { apiKey: string; model: string }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
}

export function ApiKeyModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (cfg: { apiKey: string; model: string }) => void
}) {
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState(DEFAULT_MODELS[0])
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (open) {
      const cfg = loadConfig()
      setApiKey(cfg.apiKey)
      setModel(cfg.model)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setModelsLoading(true)
    setModelsError(null)

    fetch("/api/openrouter-models")
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Gagal mengambil model OpenRouter")
        return data.models as OpenRouterModel[]
      })
      .then((nextModels) => {
        if (cancelled) return
        setModels(nextModels)
        setModel((current) => {
          if (nextModels.some((item) => item.id === current)) return current
          return nextModels[0]?.id || current
        })
      })
      .catch((error) => {
        if (cancelled) return
        setModelsError(error instanceof Error ? error.message : "Gagal mengambil model OpenRouter")
        setModels(DEFAULT_MODELS.map((id) => ({ id })))
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  if (!open) return null

  const handleSave = () => {
    const cfg = { apiKey: apiKey.trim(), model }
    saveConfig(cfg)
    onSave(cfg)
    onClose()
  }

  const modelOptions: OpenRouterModel[] = models.length
    ? models
    : DEFAULT_MODELS.map((id) => ({ id }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-xl relative rounded-2xl border border-[#232323] shadow-2xl shadow-black/60"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, rgba(255,31,90,0.08) 0%, rgba(20,20,20,1) 45%, #141414 100%)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-[0.04] pointer-events-none overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-md flex items-center justify-center text-[#9a9a9a] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-7">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff1f5a] to-[#c40d40] flex items-center justify-center shadow-lg shadow-[#ff1f5a]/30 shrink-0">
              <KeyRound className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="pt-0.5">
              <h2 className="text-xl font-bold tracking-tight">Konfigurasi API</h2>
              <p className="text-[13px] text-[#9a9a9a] mt-0.5">
                Hubungkan OpenRouter untuk mengaktifkan generator PRD.
              </p>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-[11px] font-bold text-pink tracking-[0.18em] mb-2 block">
              OPENROUTER API KEY
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#ff1f5a] focus:ring-1 focus:ring-[#ff1f5a]/40 rounded-lg px-3.5 py-3 pr-10 text-sm font-mono outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Sembunyikan" : "Tampilkan"}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-[#7a7a7a] hover:text-white hover:bg-white/5 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 gap-3">
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-pink hover:underline inline-flex items-center gap-1"
              >
                Dapatkan key gratis di openrouter.ai
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[11px] text-[#6a6a6a] inline-flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3" />
                Disimpan lokal
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-pink tracking-[0.18em] block">
                MODEL AI
              </label>
              {modelsLoading && (
                <span className="text-[11px] text-[#7a7a7a] inline-flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  memuat model...
                </span>
              )}
            </div>
            <ModelSelector
              value={model}
              options={modelOptions}
              loading={modelsLoading}
              onChange={setModel}
            />
            {modelsError ? (
              <p className="text-[11px] text-red-300 mt-2">
                {modelsError} — pakai daftar fallback.
              </p>
            ) : (
              <p className="text-[11px] text-[#6a6a6a] mt-2">
                Daftar diambil real-time dari OpenRouter. Model{" "}
                <span className="text-emerald-400 font-semibold">GRATIS</span> tidak butuh kredit.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-[#2a2a2a] text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 px-4 py-3 rounded-lg btn-pink text-sm font-semibold"
            >
              Simpan & Lanjut
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
