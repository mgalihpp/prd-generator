"use client"

import { Check, Layers, RotateCcw, Key } from "lucide-react"
import { cn } from "@/lib/utils"

type StepKey = "concept" | "architecture" | "document"

const STEPS: { key: StepKey; label: string; n: number }[] = [
  { key: "concept", label: "Konsep", n: 1 },
  { key: "architecture", label: "Arsitektur", n: 2 },
  { key: "document", label: "Dokumen", n: 3 },
]

export function Header({
  active,
  completed,
  onReset,
  onOpenApiKey,
}: {
  active: StepKey
  completed: Record<StepKey, boolean>
  onReset: () => void
  onOpenApiKey: () => void
}) {
  return (
    <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <Layers className="w-7 h-7 text-pink" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight">PRD</span>
            <span className="font-bold text-lg text-pink tracking-tight">Engine</span>
            <span className="text-[10px] font-bold bg-[#1f1f1f] text-pink px-1.5 py-0.5 rounded-sm tracking-wider">
              PRO
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => {
            const isActive = active === s.key
            const isDone = completed[s.key]
            return (
              <div key={s.key} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold transition-colors",
                      isDone && "bg-pink-600 border-pink-600 text-white",
                      isActive && !isDone && "border-[#ff1f5a] text-[#ff1f5a]",
                      !isActive && !isDone && "border-[#3a3a3a] text-[#5a5a5a]"
                    )}
                    style={isDone ? { background: "#ff1f5a", borderColor: "#ff1f5a" } : undefined}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.n}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium hidden sm:inline transition-colors",
                      isActive && "text-white",
                      isDone && "text-[#ff1f5a]",
                      !isActive && !isDone && "text-[#5a5a5a]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-16 h-px",
                      isDone ? "bg-[#ff1f5a]" : "bg-[#2a2a2a]"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenApiKey}
            className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-[#1a1a1a]"
            title="API Key"
          >
            <Key className="w-4 h-4" />
            <span className="hidden md:inline">API Key</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-sm text-[#a0a0a0] hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-[#1a1a1a]"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  )
}
