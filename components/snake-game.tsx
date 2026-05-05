"use client"

import { useState, useEffect, useCallback } from "react"
import { useMultiplayerGame } from "@/hooks/use-multiplayer-game"
import { GameCanvas } from "@/components/game-canvas"
import { ScorePanel } from "@/components/score-panel"
import { GameOverlay } from "@/components/game-overlay"
import { GameLobby } from "@/components/game-lobby"
import { MobileControls } from "@/components/mobile-controls"

const CELL_SIZE = 12

function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function SnakeGame() {
  const [mounted, setMounted] = useState(false)
  const [playerId, setPlayerId] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get or create player ID
    let storedId = localStorage.getItem("snake-player-id")
    if (!storedId) {
      storedId = generatePlayerId()
      localStorage.setItem("snake-player-id", storedId)
    }
    setPlayerId(storedId)

    // Get stored player name
    const storedName = localStorage.getItem("snake-player-name")
    if (storedName) {
      setPlayerName(storedName)
    }

    // Check if mobile
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name)
    localStorage.setItem("snake-player-name", name)
  }

  const {
    room,
    error,
    isConnecting,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    updateDirection,
    startGame,
    resetGame,
  } = useMultiplayerGame({
    playerId,
    playerName: playerName || "Player",
  })

  const handleCreateRoom = useCallback(async (maxPlayers: number, gameDuration: number) => {
    await createRoom(maxPlayers, gameDuration)
  }, [createRoom])

  const handleJoinRoom = useCallback(async (roomId: string) => {
    await joinRoom(roomId)
  }, [joinRoom])

  if (!mounted || !playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 bg-background">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            SNAKE <span className="text-primary">ARENA</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Web Multiplayer Snake Battle</p>
        </header>

        {!room ? (
          <GameLobby
            playerName={playerName}
            onPlayerNameChange={handlePlayerNameChange}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isConnecting={isConnecting}
            error={error}
          />
        ) : (
          <>
            {/* Score Panel - only show during game */}
            {room.gameStatus === "playing" && (
              <ScorePanel
                snakes={room.snakes}
                playerId={playerId}
                timeRemaining={room.timeRemaining}
              />
            )}

            {/* Game Area */}
            <div className="flex justify-center overflow-auto">
              <div className="relative">
                <GameCanvas
                  room={room}
                  cellSize={CELL_SIZE}
                  playerId={playerId}
                />
                <GameOverlay
                  room={room}
                  cellSize={CELL_SIZE}
                  playerId={playerId}
                  isHost={isHost}
                  onStart={startGame}
                  onReset={resetGame}
                  onLeave={leaveRoom}
                />
              </div>
            </div>

            {/* Mobile Controls */}
            {isMobile && room.gameStatus === "playing" && (
              <MobileControls
                onDirection={updateDirection}
                disabled={room.gameStatus !== "playing"}
              />
            )}

            {/* Instructions */}
            {room.gameStatus === "playing" && !isMobile && (
              <footer className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  Eat the red food to grow your snake. Avoid walls and other snakes!
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Use <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">W A S D</kbd> or{" "}
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Arrow Keys</kbd> to move
                </p>
              </footer>
            )}
          </>
        )}
      </div>
    </main>
  )
}
