import { NextRequest, NextResponse } from "next/server"
import { createRoom, getRoom, joinRoom, leaveRoom, updateDirection, startCountdown, resetRoom } from "@/lib/game-store"
import type { Direction } from "@/lib/game-types"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, roomId, playerId, playerName, direction, maxPlayers, gameDuration } = body

  switch (action) {
    case "create": {
      const room = createRoom(playerId, playerName, maxPlayers || 10, gameDuration || 120)
      return NextResponse.json({ success: true, room })
    }

    case "join": {
      const room = joinRoom(roomId, playerId, playerName)
      if (!room) {
        return NextResponse.json({ success: false, error: "Room not found or full" }, { status: 400 })
      }
      return NextResponse.json({ success: true, room })
    }

    case "leave": {
      leaveRoom(roomId, playerId)
      return NextResponse.json({ success: true })
    }

    case "direction": {
      updateDirection(roomId, playerId, direction as Direction)
      return NextResponse.json({ success: true })
    }

    case "start": {
      startCountdown(roomId)
      return NextResponse.json({ success: true })
    }

    case "reset": {
      resetRoom(roomId)
      return NextResponse.json({ success: true })
    }

    case "get": {
      const room = getRoom(roomId)
      if (!room) {
        return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, room })
    }

    default:
      return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
  }
}
