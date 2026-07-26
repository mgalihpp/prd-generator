"use client"

import { useState } from "react"
import { Copy, Check, Download } from "lucide-react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { plantumlUrl } from "@/lib/plantuml"

function PlantUmlDiagram({ source }: { source: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    // Fallback: show the raw source so the document is never broken.
    return (
      <pre className="overflow-x-auto rounded-md border border-[#2a2a2a] bg-[#111] p-4 text-xs">
        <code>{source}</code>
      </pre>
    )
  }

  return (
    <span className="my-4 block overflow-x-auto rounded-md border border-[#2a2a2a] bg-white p-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={plantumlUrl(source)}
        alt="Diagram PlantUML"
        loading="lazy"
        className="mx-auto inline-block max-w-full"
        onError={() => setFailed(true)}
      />
    </span>
  )
}

// Renders PlantUML code blocks as diagrams. While streaming, the block is still
// incomplete, so keep it as code and only fetch the rendered image once done —
// avoids spamming the PlantUML server with partial (broken) diagrams per token.
function makeMarkdownComponents(isStreaming: boolean): Components {
  return {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className ?? "")
      const lang = match?.[1]?.toLowerCase()
      const isUml = lang === "plantuml" || lang === "puml" || lang === "uml"
      if (isUml && !isStreaming) {
        return <PlantUmlDiagram source={String(children).replace(/\n$/, "")} />
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
  }
}

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
    <div className="grid-bg mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Dokumen Final
          </h1>
          <p className="mt-2 font-mono text-sm">
            <span className="text-[#a0a0a0]">Status: </span>
            <span
              className={isStreaming ? "text-yellow-400" : "text-green-400"}
            >
              {isStreaming ? "Generating..." : "Selesai"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!markdown || isStreaming}
            className="flex items-center gap-2 rounded-md border border-[#2a2a2a] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Unduh .md</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!markdown || isStreaming}
            className="btn-pink flex items-center gap-2 rounded-md px-5 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Tersalin!" : "Salin Markdown"}
          </button>
        </div>
      </div>

      <div className="card-dark min-h-[500px] p-6 sm:p-10">
        {markdown ? (
          <article className="prd-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={makeMarkdownComponents(isStreaming)}
            >
              {markdown}
            </ReactMarkdown>
            {isStreaming && (
              <span className="-mb-1 ml-1 inline-block h-5 w-2 animate-pulse bg-[#ff1f5a]" />
            )}
          </article>
        ) : (
          <p className="font-mono text-sm text-[#7a7a7a]">
            Menunggu dokumen...
          </p>
        )}
      </div>
    </div>
  )
}
