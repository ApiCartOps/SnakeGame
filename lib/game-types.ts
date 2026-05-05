export type Direction = "up" | "down" | "left" | "right"

export interface Position {
  x: number
  y: number
}

export interface Snake {
  id: string
  body: Position[]
  direction: Direction
  nextDirection: Direction
  score: number
  alive: boolean
  playerName: string
  color: string
}

export interface GameRoom {
  id: string
  snakes: Snake[]
  food: Position[]
  gameStatus: "waiting" | "countdown" | "playing" | "gameover"
  winner: string | null
  hostId: string
  maxPlayers: number
  timeRemaining: number
  gameDuration: number
  gridSize: number
  createdAt: number
}

export interface PlayerConfig {
  id: string
  name: string
  color: string
}

export const PLAYER_COLORS = [
  { name: "Emerald", head: "#34d399", body: "#10b981", glow: "rgba(52, 211, 153, 0.5)" },
  { name: "Rose", head: "#fb7185", body: "#f43f5e", glow: "rgba(251, 113, 133, 0.5)" },
  { name: "Sky", head: "#38bdf8", body: "#0ea5e9", glow: "rgba(56, 189, 248, 0.5)" },
  { name: "Amber", head: "#fbbf24", body: "#f59e0b", glow: "rgba(251, 191, 36, 0.5)" },
  { name: "Violet", head: "#a78bfa", body: "#8b5cf6", glow: "rgba(167, 139, 250, 0.5)" },
  { name: "Cyan", head: "#22d3ee", body: "#06b6d4", glow: "rgba(34, 211, 238, 0.5)" },
  { name: "Orange", head: "#fb923c", body: "#f97316", glow: "rgba(251, 146, 60, 0.5)" },
  { name: "Lime", head: "#a3e635", body: "#84cc16", glow: "rgba(163, 230, 53, 0.5)" },
  { name: "Fuchsia", head: "#e879f9", body: "#d946ef", glow: "rgba(232, 121, 249, 0.5)" },
  { name: "Teal", head: "#2dd4bf", body: "#14b8a6", glow: "rgba(45, 212, 191, 0.5)" },
]

export const GRID_SIZE = 50
export const INITIAL_SNAKE_LENGTH = 4
export const FOOD_COUNT = 8
export const GAME_SPEED = 100
export const DEFAULT_GAME_DURATION = 120 // 2 minutes in seconds
export const COUNTDOWN_DURATION = 3 // 3 seconds countdown
