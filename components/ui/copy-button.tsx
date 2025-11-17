"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
  size?: "sm" | "default" | "icon"
}

export function CopyButton({ text, className, size = "icon" }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("복사 실패:", err)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleCopy}
      className={cn("h-8 w-8 p-0", className)}
      title="클립보드에 복사"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

