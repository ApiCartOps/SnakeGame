"use client"

import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { Direction } from "@/lib/game-types"

interface MobileControlsProps {
  onDirection: (direction: Direction) => void
  disabled?: boolean
}

export function MobileControls({ onDirection, disabled }: MobileControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
      <div />
      <Button
        variant="secondary"
        size="lg"
        className="w-16 h-16"
        onClick={() => onDirection("up")}
        disabled={disabled}
      >
        <ChevronUp className="w-8 h-8" />
        <span className="sr-only">Up</span>
      </Button>
      <div />
      <Button
        variant="secondary"
        size="lg"
        className="w-16 h-16"
        onClick={() => onDirection("left")}
        disabled={disabled}
      >
        <ChevronLeft className="w-8 h-8" />
        <span className="sr-only">Left</span>
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="w-16 h-16"
        onClick={() => onDirection("down")}
        disabled={disabled}
      >
        <ChevronDown className="w-8 h-8" />
        <span className="sr-only">Down</span>
      </Button>
      <Button
        variant="secondary"
        size="lg"
        className="w-16 h-16"
        onClick={() => onDirection("right")}
        disabled={disabled}
      >
        <ChevronRight className="w-8 h-8" />
        <span className="sr-only">Right</span>
      </Button>
    </div>
  )
}
