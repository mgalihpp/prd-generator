"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import type { ConceptResult } from "@/lib/types"

export function ConceptRefinement({
  result,
  onRevise,
  onProceed,
  revising,
}: {
  result: ConceptResult
  onRevise: (feedback: string) => void
  onProceed: () => void
  revising: boolean
}) {
  const [feedback, setFeedback] = useState("")

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid-bg flex-1">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-2 h-2 rounded-full bg-[#ff1f5a] animate-pulse" />
        <h2 className="text-sm font-semibold text-pink tracking-[0.15em]">
          PENYEMPURNAAN KONSEP
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main */}
        <div className="card-dark p-6 sm:p-8 space-y-7">
          <Section title="Elevator Pitch">
            <p className="text-[#d5d5d5] leading-relaxed text-[15px]">{result.elevatorPitch}</p>
          </Section>

          <Section title="Target Pengguna">
            <p className="text-[#d5d5d5] leading-relaxed text-[15px]">{result.targetUser}</p>
          </Section>

          <Section title="Masalah Utama yang Diselesaikan">
            <ul className="space-y-2">
              {result.keyProblems.map((p, i) => (
                <li key={i} className="flex gap-3 text-[#d5d5d5] text-[15px] leading-relaxed">
                  <span className="text-pink mt-2 shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          {result.useCases?.length > 0 && (
            <Section title="Use Cases Utama">
              <ul className="space-y-2">
                {result.useCases.map((u, i) => (
                  <li key={i} className="flex gap-3 text-[#d5d5d5] text-[15px] leading-relaxed">
                    <span className="text-pink mt-2 shrink-0">•</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card-dark p-5">
            <label className="text-xs font-semibold text-pink tracking-[0.15em] mb-3 block">
              REVISI / FEEDBACK
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Butuh perubahan? Tulis di sini..."
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#ff1f5a] rounded-md p-3 text-sm outline-none transition-colors resize-none"
            />
            <button
              onClick={() => feedback.trim() && onRevise(feedback.trim())}
              disabled={!feedback.trim() || revising}
              className="mt-3 w-full px-4 py-2.5 rounded-md border border-[#2a2a2a] hover:bg-[#1a1a1a] text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {revising ? "Memperbarui..." : "Perbarui Konsep"}
            </button>
          </div>

          <button
            onClick={onProceed}
            disabled={revising}
            className="btn-pink w-full rounded-lg px-5 py-4 font-semibold flex items-center justify-center gap-2"
          >
            Lanjut ke Arsitektur <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2.5 text-white">{title}</h3>
      {children}
    </div>
  )
}
