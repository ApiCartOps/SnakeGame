"use client"

import { useEffect, useRef, useCallback } from "react"
import type { GameRoom, Position } from "@/lib/game-types"
import { PLAYER_COLORS } from "@/lib/game-types"

interface GameCanvasProps {
  room: GameRoom
  cellSize: number
  playerId: string
}

export function GameCanvas({ room, cellSize, playerId }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getSnakeColors = useCallback((colorName: string) => {
    return PLAYER_COLORS.find((c) => c.name === colorName) || PLAYER_COLORS[0]
  }, [])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gridSize = room.gridSize

    // Clear canvas
    ctx.fillStyle = "#0a0a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines (subtle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
    ctx.lineWidth = 1
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, gridSize * cellSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(gridSize * cellSize, i * cellSize)
      ctx.stroke()
    }

    // Draw food with glow effect
    room.food.forEach((food: Position) => {
      const centerX = food.x * cellSize + cellSize / 2
      const centerY = food.y * cellSize + cellSize / 2
      const radius = cellSize / 2 - 2

      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2)
      gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)")
      gradient.addColorStop(0.5, "rgba(239, 68, 68, 0.3)")
      gradient.addColorStop(1, "rgba(239, 68, 68, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(food.x * cellSize - cellSize / 2, food.y * cellSize - cellSize / 2, cellSize * 2, cellSize * 2)

      // Food circle
      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
      ctx.beginPath()
      ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw snakes (draw current player last so they're on top)
    const sortedSnakes = [...room.snakes].sort((a, b) => {
      if (a.id === playerId) return 1
      if (b.id === playerId) return -1
      return 0
    })

    sortedSnakes.forEach((snake) => {
      if (!snake.alive) return

      const colors = getSnakeColors(snake.color)
      const isMe = snake.id === playerId

      // Draw body with glow
      snake.body.forEach((segment: Position, segIndex: number) => {
        const isHead = segIndex === 0
        const x = segment.x * cellSize
        const y = segment.y * cellSize
        const size = cellSize - 2
        const offset = 1

        // Glow for head (extra glow for current player)
        if (isHead) {
          ctx.shadowColor = colors.glow
          ctx.shadowBlur = isMe ? 20 : 12
        } else {
          ctx.shadowBlur = 0
        }

        // Body segment
        ctx.fillStyle = isHead ? colors.head : colors.body
        ctx.beginPath()
        ctx.roundRect(x + offset, y + offset, size, size, 4)
        ctx.fill()

        ctx.shadowBlur = 0

        // Draw eyes on head
        if (isHead) {
          const eyeSize = cellSize / 6
          const eyeOffset = cellSize / 4

          ctx.fillStyle = "#1a1a2e"

          let eye1X = x + cellSize / 2 - eyeOffset
          let eye1Y = y + cellSize / 2 - eyeOffset / 2
          let eye2X = x + cellSize / 2 + eyeOffset - eyeSize
          let eye2Y = y + cellSize / 2 - eyeOffset / 2

          if (snake.direction === "down") {
            eye1Y = y + cellSize / 2 + eyeOffset / 2
            eye2Y = y + cellSize / 2 + eyeOffset / 2
          } else if (snake.direction === "left") {
            eye1X = x + cellSize / 2 - eyeOffset
            eye2X = x + cellSize / 2 - eyeOffset
            eye1Y = y + cellSize / 2 - eyeOffset
            eye2Y = y + cellSize / 2 + eyeOffset - eyeSize
          } else if (snake.direction === "right") {
            eye1X = x + cellSize / 2 + eyeOffset / 2
            eye2X = x + cellSize / 2 + eyeOffset / 2
            eye1Y = y + cellSize / 2 - eyeOffset
            eye2Y = y + cellSize / 2 + eyeOffset - eyeSize
          }

          ctx.beginPath()
          ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw player name above head
      if (snake.body.length > 0) {
        const head = snake.body[0]
        ctx.font = "bold 10px sans-serif"
        ctx.fillStyle = isMe ? colors.head : "rgba(255, 255, 255, 0.7)"
        ctx.textAlign = "center"
        ctx.fillText(snake.playerName, head.x * cellSize + cellSize / 2, head.y * cellSize - 4)
      }
    })

    // Draw dead snakes (faded)
    room.snakes.forEach((snake) => {
      if (snake.alive) return

      snake.body.forEach((segment: Position) => {
        const x = segment.x * cellSize
        const y = segment.y * cellSize
        const size = cellSize - 2
        const offset = 1

        ctx.fillStyle = "rgba(100, 100, 100, 0.3)"
        ctx.beginPath()
        ctx.roundRect(x + offset, y + offset, size, size, 4)
        ctx.fill()
      })
    })

    // Draw border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
  }, [room, cellSize, playerId, getSnakeColors])

  useEffect(() => {
    drawGame()
  }, [drawGame])

  const canvasSize = room.gridSize * cellSize

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="rounded-lg border-2 border-border shadow-2xl"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  )
}
