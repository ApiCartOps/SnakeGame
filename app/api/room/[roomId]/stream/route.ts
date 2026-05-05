import { NextRequest } from "next/server"
import { getRoom, subscribeToRoom } from "@/lib/game-store"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const room = getRoom(roomId)

  if (!room) {
    return new Response("Room not found", { status: 404 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial state
      const initialData = `data: ${JSON.stringify(room)}\n\n`
      controller.enqueue(encoder.encode(initialData))

      // Subscribe to room updates
      const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
        try {
          const data = `data: ${JSON.stringify(updatedRoom)}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch {
          // Connection closed
          unsubscribe()
        }
      })

      // Handle connection close
      request.signal.addEventListener("abort", () => {
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
