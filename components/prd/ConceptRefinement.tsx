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
    <div className="grid-bg mx-auto max-w-7xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff1f5a]" />
        <h2 className="text-pink text-sm font-semibold tracking-[0.15em]">
          PENYEMPURNAAN KONSEP
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="card-dark space-y-7 p-6 sm:p-8">
          <Section title="Elevator Pitch">
            <p className="text-[15px] leading-relaxed text-[#d5d5d5]">
              {result.elevatorPitch}
            </p>
          </Section>

          <Section title="Target Pengguna">
            <p className="text-[15px] leading-relaxed text-[#d5d5d5]">
              {result.targetUser}
            </p>
          </Section>

          <Section title="Masalah Utama yang Diselesaikan">
            <ul className="space-y-2">
              {result.keyProblems.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-[15px] leading-relaxed text-[#d5d5d5]"
                >
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
                  <li
                    key={i}
                    className="flex gap-3 text-[15px] leading-relaxed text-[#d5d5d5]"
                  >
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
            <label className="text-pink mb-3 block text-xs font-semibold tracking-[0.15em]">
              REVISI / FEEDBACK
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Butuh perubahan? Tulis di sini..."
              className="w-full resize-none rounded-md border border-[#2a2a2a] bg-[#0a0a0a] p-3 text-sm transition-colors outline-none focus:border-[#ff1f5a]"
            />
            <button
              onClick={() => feedback.trim() && onRevise(feedback.trim())}
              disabled={!feedback.trim() || revising}
              className="mt-3 w-full rounded-md border border-[#2a2a2a] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {revising ? "Memperbarui..." : "Perbarui Konsep"}
            </button>
          </div>

          <button
            onClick={onProceed}
            disabled={revising}
            className="btn-pink flex w-full items-center justify-center gap-2 rounded-lg px-5 py-4 font-semibold"
          >
            Lanjut ke Arsitektur <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}
