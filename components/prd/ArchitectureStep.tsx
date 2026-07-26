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
    <div className="grid-bg mx-auto max-w-7xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff1f5a]" />
            <h2 className="text-pink text-sm font-semibold tracking-[0.15em]">
              PILIH TECH STACK
            </h2>
          </div>
          <p className="text-sm text-[#a0a0a0]">
            Pilih satu opsi per kategori. Pilihanmu akan disertakan dalam
            dokumen PRD.
          </p>
        </div>
        <button
          onClick={onProceed}
          disabled={!allSelected}
          className="btn-pink flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold sm:w-auto"
        >
          Lanjut ke Dokumen <ArrowRight className="h-4 w-4" />
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
          const isCustomSelected =
            !!sel && !opts.some((o) => o.name === sel.name)
          return (
            <div key={cat}>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-5 w-1 rounded-sm bg-[#ff1f5a]" />
                <h3 className="text-xl font-bold">{CATEGORY_LABELS[cat]}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sorted.map((opt) => {
                  const isSelected = selected[cat]?.name === opt.name
                  return (
                    <button
                      key={opt.name + opt.tier}
                      onClick={() => onSelect(cat, opt)}
                      className={cn(
                        "card-dark card-dark-hover relative flex h-full flex-col p-5 text-left",
                        isSelected && "card-selected"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute -top-2.5 right-4 rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider",
                          TIER_BADGE[opt.tier]
                        )}
                      >
                        {TIER_LABELS[opt.tier]}
                      </span>
                      {isSelected && (
                        <span className="absolute top-3 left-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff1f5a]">
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        </span>
                      )}
                      <h4 className="mt-2 mb-2 pr-2 text-base font-bold">
                        {opt.name}
                      </h4>
                      <p className="text-[13px] leading-relaxed text-[#a0a0a0]">
                        {opt.description}
                      </p>
                    </button>
                  )
                })}

                {/* Custom input card */}
                <div
                  className={cn(
                    "card-dark relative flex h-full flex-col p-5",
                    isCustomSelected && "card-selected"
                  )}
                >
                  <span className="absolute -top-2.5 right-4 rounded-md bg-[#ff1f5a] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
                    CUSTOM
                  </span>
                  {isCustomSelected && (
                    <span className="absolute top-3 left-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff1f5a]">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                  <h4 className="mt-2 mb-2 pr-2 text-base font-bold">
                    Tech Stack Kustom
                  </h4>
                  <p className="mb-3 text-[13px] leading-relaxed text-[#a0a0a0]">
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
                      className="min-w-0 flex-1 rounded-md border border-[#2a2a2a] bg-[#0f0f0f] px-3 py-2 text-sm transition-colors outline-none focus:border-[#ff1f5a]"
                    />
                    <button
                      onClick={() => applyCustom(cat)}
                      disabled={!custom[cat].trim()}
                      className="btn-pink flex shrink-0 items-center justify-center rounded-md px-3 py-2 font-semibold disabled:opacity-50"
                      title="Gunakan tech stack kustom"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {isCustomSelected && sel && (
                    <p className="mt-2 truncate text-[12px] font-medium text-[#ff1f5a]">
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
