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
    <header className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="relative">
            <Layers className="text-pink h-7 w-7" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight">PRD</span>
            <span className="text-pink text-lg font-bold tracking-tight">
              Engine
            </span>
            <span className="text-pink rounded-sm bg-[#1f1f1f] px-1.5 py-0.5 text-[10px] font-bold tracking-wider">
              PRO
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => {
            const isActive = active === s.key
            const isDone = completed[s.key]
            return (
              <div key={s.key} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      isDone && "border-pink-600 bg-pink-600 text-white",
                      isActive && !isDone && "border-[#ff1f5a] text-[#ff1f5a]",
                      !isActive && !isDone && "border-[#3a3a3a] text-[#5a5a5a]"
                    )}
                    style={
                      isDone
                        ? { background: "#ff1f5a", borderColor: "#ff1f5a" }
                        : undefined
                    }
                  >
                    {isDone ? <Check className="h-4 w-4" /> : s.n}
                  </div>
                  <span
                    className={cn(
                      "hidden text-sm font-medium transition-colors sm:inline",
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
                      "h-px w-8 sm:w-16",
                      isDone ? "bg-[#ff1f5a]" : "bg-[#2a2a2a]"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenApiKey}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            title="API Key"
          >
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">API Key</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  )
}
