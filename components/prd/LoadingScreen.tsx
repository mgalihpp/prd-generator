"use client"

import { Brain, Cog, Radio, Loader2 } from "lucide-react"

type Variant = "concept" | "architecture" | "research" | "compile"

const VARIANTS: Record<
  Variant,
  {
    Icon: typeof Brain
    title: string
    subtitle: string
    spin?: boolean
    pulse?: boolean
  }
> = {
  concept: {
    Icon: Brain,
    title: "Menganalisis Konsep...",
    subtitle: "Menyusun elevator pitch dan skenario pengguna",
    pulse: true,
  },
  architecture: {
    Icon: Loader2,
    title: "Merancang Solusi...",
    subtitle: "Memproses model, mengevaluasi tech stack, menelusuri tren",
    spin: true,
  },
  research: {
    Icon: Radio,
    title: "Meneliti Integrasi via Sonar...",
    subtitle: "Mengkueri dokumentasi integrasi terbaru",
    pulse: true,
  },
  compile: {
    Icon: Cog,
    title: "Menyusun Dokumen PRD...",
    subtitle: "Menghasilkan struktur markdown",
    pulse: true,
  },
}

export function LoadingScreen({
  variant,
  phaseLabel,
}: {
  variant: Variant
  phaseLabel?: string
}) {
  const v = VARIANTS[variant]
  const Icon = v.Icon
  const title = phaseLabel
    ? `${v.title.replace("...", "")} (${phaseLabel})...`
    : v.title

  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-6">
      <div
        className={
          v.spin ? "animate-spin-slow" : v.pulse ? "animate-pulse-pink" : ""
        }
      >
        <Icon className="text-pink h-14 w-14" strokeWidth={2.5} />
      </div>
      <h2 className="mt-6 text-center text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-center font-mono text-sm text-[#8a8a8a]">
        {v.subtitle}
      </p>
    </div>
  )
}
