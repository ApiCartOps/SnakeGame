"use client"

import type { Snake } from "@/lib/game-types"
import { PLAYER_COLORS } from "@/lib/game-types"
import { cn } from "@/lib/utils"

interface ScorePanelProps {
  snakes: Snake[]
  playerId: string
  timeRemaining: number
}

function getColorClasses(colorName: string): { gradient: string; bg: string } {
  const colorMap: Record<string, { gradient: string; bg: string }> = {
    Emerald: { gradient: "from-emerald-400 to-emerald-500", bg: "bg-emerald-500/20 border-emerald-500/50" },
    Rose: { gradient: "from-rose-400 to-rose-500", bg: "bg-rose-500/20 border-rose-500/50" },
    Sky: { gradient: "from-sky-400 to-sky-500", bg: "bg-sky-500/20 border-sky-500/50" },
    Amber: { gradient: "from-amber-400 to-amber-500", bg: "bg-amber-500/20 border-amber-500/50" },
    Violet: { gradient: "from-violet-400 to-violet-500", bg: "bg-violet-500/20 border-violet-500/50" },
    Cyan: { gradient: "from-cyan-400 to-cyan-500", bg: "bg-cyan-500/20 border-cyan-500/50" },
    Orange: { gradient: "from-orange-400 to-orange-500", bg: "bg-orange-500/20 border-orange-500/50" },
    Lime: { gradient: "from-lime-400 to-lime-500", bg: "bg-lime-500/20 border-lime-500/50" },
    Fuchsia: { gradient: "from-fuchsia-400 to-fuchsia-500", bg: "bg-fuchsia-500/20 border-fuchsia-500/50" },
    Teal: { gradient: "from-teal-400 to-teal-500", bg: "bg-teal-500/20 border-teal-500/50" },
  }
  return colorMap[colorName] || colorMap.Emerald
}

function formatTime(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60)
  const secs = Math.floor(Math.max(0, seconds) % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function ScorePanel({ snakes, playerId, timeRemaining }: ScorePanelProps) {
  const sortedSnakes = [...snakes].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="flex justify-center">
        <div className={cn(
          "px-6 py-2 rounded-full font-mono text-2xl font-bold",
          timeRemaining <= 30 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-secondary text-foreground"
        )}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Player Scores */}
      <div className="flex flex-wrap gap-2 justify-center">
        {sortedSnakes.map((snake, index) => {
          const isMe = snake.id === playerId
          const colors = getColorClasses(snake.color)

          return (
            <div
              key={snake.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-300 min-w-[120px]",
                colors.bg,
                !snake.alive && "opacity-40 grayscale",
                isMe && "ring-2 ring-white/30"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  #{index + 1}
                </span>
                <div
                  className={cn(
                    "w-3 h-3 rounded-full bg-gradient-to-br shrink-0",
                    colors.gradient
                  )}
                />
                <span className={cn(
                  "font-medium text-sm truncate max-w-[80px]",
                  isMe && "text-primary"
                )}>
                  {snake.playerName}
                  {isMe && " (You)"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-foreground">
                  {snake.score}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">
                  {snake.alive ? `${snake.body.length}` : "Dead"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
