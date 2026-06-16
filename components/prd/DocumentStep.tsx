"use client"

import { useState } from "react"
import { Copy, Check, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function DocumentStep({
  markdown,
  isStreaming,
}: {
  markdown: string
  isStreaming: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prd.md"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid-bg flex-1 w-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Dokumen Final</h1>
          <p className="mt-2 text-sm font-mono">
            <span className="text-[#a0a0a0]">Status: </span>
            <span className={isStreaming ? "text-yellow-400" : "text-green-400"}>
              {isStreaming ? "Generating..." : "Selesai"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!markdown || isStreaming}
            className="px-4 py-2.5 rounded-md border border-[#2a2a2a] hover:bg-[#1a1a1a] text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh .md</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!markdown || isStreaming}
            className="btn-pink rounded-md px-5 py-2.5 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Tersalin!" : "Salin Markdown"}
          </button>
        </div>
      </div>

      <div className="card-dark p-6 sm:p-10 min-h-[500px]">
        {markdown ? (
          <article className="prd-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-[#ff1f5a] animate-pulse ml-1 -mb-1" />
            )}
          </article>
        ) : (
          <p className="text-[#7a7a7a] font-mono text-sm">Menunggu dokumen...</p>
        )}
      </div>
    </div>
  )
}
