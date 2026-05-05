"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Clock, Grid3X3, ArrowRight, Plus, LogIn } from "lucide-react"

interface GameLobbyProps {
  playerName: string
  onPlayerNameChange: (name: string) => void
  onCreateRoom: (maxPlayers: number, gameDuration: number) => void
  onJoinRoom: (roomId: string) => void
  isConnecting: boolean
  error: string | null
}

export function GameLobby({
  playerName,
  onPlayerNameChange,
  onCreateRoom,
  onJoinRoom,
  isConnecting,
  error,
}: GameLobbyProps) {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu")
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [gameDuration, setGameDuration] = useState(120)
  const [roomCode, setRoomCode] = useState("")

  const handleCreate = () => {
    if (!playerName.trim()) return
    onCreateRoom(maxPlayers, gameDuration)
  }

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return
    onJoinRoom(roomCode.toUpperCase())
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Player Name Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Your Name</label>
        <Input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          maxLength={16}
          className="text-lg font-medium"
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {mode === "menu" && (
        <div className="space-y-3">
          <Button
            onClick={() => setMode("create")}
            className="w-full h-16 text-lg gap-3"
            disabled={!playerName.trim()}
          >
            <Plus className="w-6 h-6" />
            Create Room
          </Button>
          <Button
            onClick={() => setMode("join")}
            variant="secondary"
            className="w-full h-16 text-lg gap-3"
            disabled={!playerName.trim()}
          >
            <LogIn className="w-6 h-6" />
            Join Room
          </Button>
        </div>
      )}

      {mode === "create" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Create New Room</h3>
          
          {/* Max Players */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="w-4 h-4" />
              Max Players
            </label>
            <div className="flex gap-2 flex-wrap">
              {[2, 4, 6, 8, 10].map((count) => (
                <Button
                  key={count}
                  variant={maxPlayers === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMaxPlayers(count)}
                  className="w-12"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Game Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              Game Duration
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "1 min", value: 60 },
                { label: "2 min", value: 120 },
                { label: "3 min", value: 180 },
                { label: "5 min", value: 300 },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  variant={gameDuration === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGameDuration(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Arena Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Grid3X3 className="w-4 h-4" />
            Arena Size: 50 x 50
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMode("menu")} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleCreate} 
              className="flex-1 gap-2"
              disabled={isConnecting || !playerName.trim()}
            >
              {isConnecting ? "Creating..." : "Create Room"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {mode === "join" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Join Room</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Room Code</label>
            <Input
              type="text"
              placeholder="Enter 6-character code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-2xl font-mono font-bold tracking-widest text-center uppercase"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMode("menu")} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handleJoin} 
              className="flex-1 gap-2"
              disabled={isConnecting || !playerName.trim() || roomCode.length < 4}
            >
              {isConnecting ? "Joining..." : "Join Room"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
