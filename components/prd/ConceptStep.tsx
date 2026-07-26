"use client"

import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"

export function ConceptStep({
  initial,
  onAnalyze,
}: {
  initial?: string
  onAnalyze: (concept: string) => void
}) {
  const [concept, setConcept] = useState(initial ?? "")

  const canSubmit = concept.trim().length >= 10

  return (
    <div className="grid-bg flex flex-1 items-center">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
          AI untuk
          <br />
          <span className="text-pink">pembuat produk.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#a0a0a0] sm:text-lg">
          Susun Product Requirements Document (PRD) lengkap dengan rencana
          arsitektur cerdas. Ceritakan konsep kamu, dan kami akan menghasilkan
          blueprint-nya.
        </p>

        <div className="card-dark mt-10 p-5 sm:p-6">
          <label className="text-pink mb-3 block text-xs font-semibold tracking-[0.15em]">
            KONSEP PRODUK
          </label>
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={3}
              placeholder="Deskripsikan ide aplikasi kamu di sini (contoh: marketplace untuk koki lokal...)"
              className="flex-1 resize-none border-0 bg-transparent py-2 text-base text-white outline-none placeholder:text-[#5a5a5a]"
            />
            <button
              onClick={() => canSubmit && onAnalyze(concept.trim())}
              disabled={!canSubmit}
              className="btn-pink flex shrink-0 items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold"
            >
              Analisis <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-[#a0a0a0]">
          {["Analisis Berbasis AI", "Usulan Tech Stack", "Siap Ekspor"].map(
            (f) => (
              <div key={f} className="flex items-center gap-1.5">
                <Check className="text-pink h-4 w-4" strokeWidth={3} />
                <span>{f}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
