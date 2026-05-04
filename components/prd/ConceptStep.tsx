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
    <div className="flex-1 flex items-center grid-bg">
      <div className="max-w-5xl mx-auto px-6 py-16 w-full">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight">
          AI untuk
          <br />
          <span className="text-pink">pembuat produk.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-[#a0a0a0] max-w-2xl leading-relaxed">
          Susun Product Requirements Document (PRD) lengkap dengan rencana arsitektur cerdas.
          Ceritakan konsep kamu, dan kami akan menghasilkan blueprint-nya.
        </p>

        <div className="mt-10 card-dark p-5 sm:p-6">
          <label className="text-xs font-semibold text-pink tracking-[0.15em] mb-3 block">
            KONSEP PRODUK
          </label>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={3}
              placeholder="Deskripsikan ide aplikasi kamu di sini (contoh: marketplace untuk koki lokal...)"
              className="flex-1 bg-transparent border-0 outline-none resize-none text-base text-white placeholder:text-[#5a5a5a] py-2"
            />
            <button
              onClick={() => canSubmit && onAnalyze(concept.trim())}
              disabled={!canSubmit}
              className="btn-pink rounded-lg px-6 py-3.5 font-semibold flex items-center justify-center gap-2 shrink-0"
            >
              Analisis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm text-[#a0a0a0]">
          {["Analisis Berbasis AI", "Usulan Tech Stack", "Siap Ekspor"].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-pink" strokeWidth={3} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
