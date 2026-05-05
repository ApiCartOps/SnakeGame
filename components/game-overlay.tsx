"use client"

import type { GameRoom } from "@/lib/game-types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface GameOverlayProps {
  room: GameRoom
  cellSize: number
  playerId: string
  isHost: boolean
  onStart: () => void
  onReset: () => void
  onLeave: () => void
}

export function GameOverlay({ room, cellSize, playerId, isHost, onStart, onReset, onLeave }: GameOverlayProps) {
  const [copied, setCopied] = useState(false)
  const canvasSize = room.gridSize * cellSize

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (room.gameStatus === "waiting") {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg p-4"
        style={{ width: canvasSize, height: canvasSize, maxWidth: "100%" }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">WAITING FOR PLAYERS</h2>
        
        {/* Room Code */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-muted-foreground">Room Code:</span>
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg font-mono text-xl font-bold text-foreground hover:bg-secondary/80 transition-colors"
          >
            {room.id}
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Players List */}
        <div className="bg-card/50 rounded-lg p-4 mb-4 min-w-[250px]">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">
            Players ({room.snakes.length}/{room.maxPlayers})
          </h3>
          <div className="space-y-1">
            {room.snakes.map((snake) => (
              <div key={snake.id} className="flex items-center gap-2 px-2 py-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: snake.color === "Emerald" ? "#34d399" : 
                    snake.color === "Rose" ? "#fb7185" :
                    snake.color === "Sky" ? "#38bdf8" :
                    snake.color === "Amber" ? "#fbbf24" :
                    snake.color === "Violet" ? "#a78bfa" :
                    snake.color === "Cyan" ? "#22d3ee" :
                    snake.color === "Orange" ? "#fb923c" :
                    snake.color === "Lime" ? "#a3e635" :
                    snake.color === "Fuchsia" ? "#e879f9" : "#2dd4bf"
                  }}
                />
                <span className={cn(
                  "font-medium",
                  snake.id === playerId && "text-primary"
                )}>
                  {snake.playerName}
                  {snake.id === room.hostId && " (Host)"}
                  {snake.id === playerId && " (You)"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Settings */}
        <div className="text-sm text-muted-foreground mb-4 text-center">
          <p>Game Duration: {Math.floor(room.gameDuration / 60)}:{(room.gameDuration % 60).toString().padStart(2, "0")}</p>
          <p>Arena Size: {room.gridSize} x {room.gridSize}</p>
        </div>

        {/* Controls Info */}
        <p className="text-sm text-muted-foreground mb-4">
          Use <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">W A S D</kbd> or{" "}
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Arrow Keys</kbd> to move
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          {isHost && (
            <Button onClick={onStart} disabled={room.snakes.length < 1}>
              Start Game
            </Button>
          )}
          <Button variant="outline" onClick={onLeave}>
            Leave Room
          </Button>
        </div>

        {!isHost && (
          <p className="text-sm text-muted-foreground mt-4">Waiting for host to start the game...</p>
        )}
      </div>
    )
  }

  if (room.gameStatus === "countdown") {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
        style={{ width: canvasSize, height: canvasSize, maxWidth: "100%" }}
      >
        <h2 className="text-6xl font-bold text-primary animate-pulse">GET READY!</h2>
      </div>
    )
  }

  if (room.gameStatus === "gameover") {
    const winner = room.winner ? room.snakes.find((s) => s.id === room.winner) : null
    const sortedSnakes = [...room.snakes].sort((a, b) => b.score - a.score)
    const isWinner = room.winner === playerId

    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg p-4"
        style={{ width: canvasSize, height: canvasSize, maxWidth: "100%" }}
      >
        <h2 className={cn(
          "text-4xl sm:text-5xl font-bold mb-2",
          isWinner ? "text-primary" : "text-destructive"
        )}>
          {isWinner ? "YOU WIN!" : "GAME OVER"}
        </h2>
        
        {winner && !isWinner && (
          <p className="text-xl text-primary mb-4">{winner.playerName} Wins!</p>
        )}

        <div className="bg-card/50 rounded-lg p-4 min-w-[250px] mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">
            Final Scores
          </h3>
          <div className="space-y-2">
            {sortedSnakes.map((snake, index) => (
              <div
                key={snake.id}
                className={cn(
                  "flex justify-between items-center px-3 py-1 rounded",
                  index === 0 && "bg-primary/20 text-primary",
                  snake.id === playerId && "ring-1 ring-white/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                  <span className="font-medium">{snake.playerName}</span>
                </div>
                <span className="font-mono font-bold">{snake.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {isHost && (
            <Button onClick={onReset}>
              Play Again
            </Button>
          )}
          <Button variant="outline" onClick={onLeave}>
            Leave Room
          </Button>
        </div>

        {!isHost && (
          <p className="text-sm text-muted-foreground mt-4">Waiting for host to restart...</p>
        )}
      </div>
    )
  }

  return null
}
