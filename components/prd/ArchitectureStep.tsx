"use client"

import { useState } from "react"
import { ArrowRight, Check, Plus } from "lucide-react"
import {
  CATEGORY_LABELS,
  TIER_LABELS,
  type ArchCategory,
  type ArchitectureResult,
  type SelectedArchitecture,
  type TechOption,
  type TechTier,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const CATS: ArchCategory[] = ["frontend", "backend", "database", "deployment"]
const TIER_ORDER: TechTier[] = ["hemat", "standard", "populer", "pro"]

const TIER_BADGE: Record<TechTier, string> = {
  hemat: "bg-[#ff1f5a] text-white",
  standard: "bg-[#ff1f5a] text-white",
  populer: "bg-[#ff1f5a] text-white",
  pro: "bg-[#ff1f5a] text-white",
}

export function ArchitectureStep({
  arch,
  selected,
  onSelect,
  onProceed,
}: {
  arch: ArchitectureResult
  selected: SelectedArchitecture
  onSelect: (cat: ArchCategory, opt: TechOption) => void
  onProceed: () => void
}) {
  const allSelected = CATS.every((c) => !!selected[c])

  const [custom, setCustom] = useState<Record<ArchCategory, string>>({
    frontend: "",
    backend: "",
    database: "",
    deployment: "",
  })

  const applyCustom = (cat: ArchCategory) => {
    const name = custom[cat].trim()
    if (!name) return
    onSelect(cat, {
      tier: "standard",
      name,
      description: "Tech stack kustom yang kamu tentukan sendiri.",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid-bg flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#ff1f5a] animate-pulse" />
            <h2 className="text-sm font-semibold text-pink tracking-[0.15em]">
              PILIH TECH STACK
            </h2>
          </div>
          <p className="text-sm text-[#a0a0a0]">
            Pilih satu opsi per kategori. Pilihanmu akan disertakan dalam dokumen PRD.
          </p>
        </div>
        <button
          onClick={onProceed}
          disabled={!allSelected}
          className="btn-pink rounded-lg px-6 py-3.5 font-semibold flex items-center justify-center gap-2 sm:w-auto"
        >
          Lanjut ke Dokumen <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-9">
        {CATS.map((cat) => {
          const opts = arch[cat] ?? []
          // Sort options by tier order
          const sorted = [...opts].sort(
            (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
          )
          const sel = selected[cat]
          const isCustomSelected = !!sel && !opts.some((o) => o.name === sel.name)
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-5 bg-[#ff1f5a] rounded-sm" />
                <h3 className="text-xl font-bold">{CATEGORY_LABELS[cat]}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sorted.map((opt) => {
                  const isSelected = selected[cat]?.name === opt.name
                  return (
                    <button
                      key={opt.name + opt.tier}
                      onClick={() => onSelect(cat, opt)}
                      className={cn(
                        "card-dark card-dark-hover relative p-5 text-left flex flex-col h-full",
                        isSelected && "card-selected"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute -top-2.5 right-4 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md",
                          TIER_BADGE[opt.tier]
                        )}
                      >
                        {TIER_LABELS[opt.tier]}
                      </span>
                      {isSelected && (
                        <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#ff1f5a] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </span>
                      )}
                      <h4 className="font-bold text-base mb-2 mt-2 pr-2">{opt.name}</h4>
                      <p className="text-[13px] text-[#a0a0a0] leading-relaxed">
                        {opt.description}
                      </p>
                    </button>
                  )
                })}

                {/* Custom input card */}
                <div
                  className={cn(
                    "card-dark relative p-5 flex flex-col h-full",
                    isCustomSelected && "card-selected"
                  )}
                >
                  <span className="absolute -top-2.5 right-4 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#ff1f5a] text-white">
                    CUSTOM
                  </span>
                  {isCustomSelected && (
                    <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#ff1f5a] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                  <h4 className="font-bold text-base mb-2 mt-2 pr-2">Tech Stack Kustom</h4>
                  <p className="text-[13px] text-[#a0a0a0] leading-relaxed mb-3">
                    Punya pilihan sendiri? Ketik nama tech-nya di bawah.
                  </p>
                  <div className="mt-auto flex gap-2">
                    <input
                      value={custom[cat]}
                      onChange={(e) =>
                        setCustom((c) => ({ ...c, [cat]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyCustom(cat)
                      }}
                      placeholder="cth: SvelteKit"
                      className="flex-1 min-w-0 rounded-md bg-[#0f0f0f] border border-[#2a2a2a] px-3 py-2 text-sm outline-none focus:border-[#ff1f5a] transition-colors"
                    />
                    <button
                      onClick={() => applyCustom(cat)}
                      disabled={!custom[cat].trim()}
                      className="btn-pink rounded-md px-3 py-2 font-semibold flex items-center justify-center shrink-0 disabled:opacity-50"
                      title="Gunakan tech stack kustom"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {isCustomSelected && sel && (
                    <p className="mt-2 text-[12px] text-[#ff1f5a] font-medium truncate">
                      Dipilih: {sel.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
