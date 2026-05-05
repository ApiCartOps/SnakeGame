"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import type { GameRoom, Direction } from "@/lib/game-types"

interface UseMultiplayerGameOptions {
  roomId?: string
  playerId: string
  playerName: string
}

export function useMultiplayerGame({ roomId, playerId, playerName }: UseMultiplayerGameOptions) {
  const [room, setRoom] = useState<GameRoom | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const lastDirectionRef = useRef<Direction | null>(null)

  // Create a new room
  const createRoom = useCallback(async (maxPlayers: number, gameDuration: number) => {
    setIsConnecting(true)
    setError(null)
    try {
      const response = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          playerId,
          playerName,
          maxPlayers,
          gameDuration,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setRoom(data.room)
        return data.room.id
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError("Failed to create room")
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [playerId, playerName])

  // Join an existing room
  const joinRoom = useCallback(async (targetRoomId: string) => {
    setIsConnecting(true)
    setError(null)
    try {
      const response = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          roomId: targetRoomId,
          playerId,
          playerName,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setRoom(data.room)
        return true
      } else {
        setError(data.error || "Failed to join room")
        return false
      }
    } catch (err) {
      setError("Failed to join room")
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [playerId, playerName])

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!room) return
    try {
      await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          roomId: room.id,
          playerId,
        }),
      })
    } catch (err) {
      // Ignore
    }
    eventSourceRef.current?.close()
    setRoom(null)
  }, [room, playerId])

  // Update direction
  const updateDirection = useCallback((direction: Direction) => {
    if (!room || room.gameStatus !== "playing") return
    if (lastDirectionRef.current === direction) return
    lastDirectionRef.current = direction

    fetch("/api/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "direction",
        roomId: room.id,
        playerId,
        direction,
      }),
    }).catch(() => {})
  }, [room, playerId])

  // Start game
  const startGame = useCallback(async () => {
    if (!room) return
    try {
      await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          roomId: room.id,
        }),
      })
    } catch (err) {
      // Ignore
    }
  }, [room])

  // Reset game
  const resetGame = useCallback(async () => {
    if (!room) return
    try {
      await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          roomId: room.id,
        }),
      })
    } catch (err) {
      // Ignore
    }
  }, [room])

  // Subscribe to room updates via SSE
  useEffect(() => {
    if (!room) return

    const eventSource = new EventSource(`/api/room/${room.id}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setRoom(data)
      } catch (err) {
        // Ignore parse errors
      }
    }

    eventSource.onerror = () => {
      // Reconnection is handled automatically by EventSource
    }

    return () => {
      eventSource.close()
    }
  }, [room?.id])

  // Handle keyboard input
  useEffect(() => {
    if (!room || room.gameStatus !== "playing") return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      let direction: Direction | null = null

      // WASD or Arrow keys
      if (key === "w" || key === "arrowup") {
        direction = "up"
        e.preventDefault()
      } else if (key === "s" || key === "arrowdown") {
        direction = "down"
        e.preventDefault()
      } else if (key === "a" || key === "arrowleft") {
        direction = "left"
        e.preventDefault()
      } else if (key === "d" || key === "arrowright") {
        direction = "right"
        e.preventDefault()
      }

      if (direction) {
        updateDirection(direction)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [room, updateDirection])

  // Get current player's snake
  const mySnake = room?.snakes.find((s) => s.id === playerId)
  const isHost = room?.hostId === playerId

  return {
    room,
    error,
    isConnecting,
    mySnake,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    updateDirection,
    startGame,
    resetGame,
  }
}
