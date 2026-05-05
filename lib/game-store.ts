import type { GameRoom, Snake, Position, Direction } from "./game-types"
import { PLAYER_COLORS, GRID_SIZE, INITIAL_SNAKE_LENGTH, FOOD_COUNT } from "./game-types"

// In-memory game store (for demo purposes)
const gameRooms = new Map<string, GameRoom>()
const roomListeners = new Map<string, Set<(room: GameRoom) => void>>()

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function getRandomPosition(gridSize: number, exclude: Position[] = []): Position {
  let pos: Position
  let attempts = 0
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    }
    attempts++
  } while (exclude.some((p) => p.x === pos.x && p.y === pos.y) && attempts < 1000)
  return pos
}

function getStartPosition(playerIndex: number, gridSize: number): { pos: Position; dir: Direction } {
  const margin = 5
  const positions = [
    { pos: { x: margin, y: margin }, dir: "right" as Direction },
    { pos: { x: gridSize - margin - 1, y: gridSize - margin - 1 }, dir: "left" as Direction },
    { pos: { x: gridSize - margin - 1, y: margin }, dir: "down" as Direction },
    { pos: { x: margin, y: gridSize - margin - 1 }, dir: "up" as Direction },
    { pos: { x: Math.floor(gridSize / 2), y: margin }, dir: "down" as Direction },
    { pos: { x: Math.floor(gridSize / 2), y: gridSize - margin - 1 }, dir: "up" as Direction },
    { pos: { x: margin, y: Math.floor(gridSize / 2) }, dir: "right" as Direction },
    { pos: { x: gridSize - margin - 1, y: Math.floor(gridSize / 2) }, dir: "left" as Direction },
    { pos: { x: Math.floor(gridSize / 3), y: Math.floor(gridSize / 3) }, dir: "right" as Direction },
    { pos: { x: Math.floor(gridSize * 2 / 3), y: Math.floor(gridSize * 2 / 3) }, dir: "left" as Direction },
  ]
  return positions[playerIndex % positions.length]
}

function createSnake(playerId: string, playerName: string, playerIndex: number, gridSize: number): Snake {
  const { pos: startPos, dir } = getStartPosition(playerIndex, gridSize)
  const body: Position[] = []

  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    const offset = dir === "right" ? -i : dir === "left" ? i : 0
    const yOffset = dir === "down" ? -i : dir === "up" ? i : 0
    body.push({ x: startPos.x + offset, y: startPos.y + yOffset })
  }

  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length].name

  return {
    id: playerId,
    body,
    direction: dir,
    nextDirection: dir,
    score: 0,
    alive: true,
    playerName,
    color,
  }
}

function generateFood(count: number, gridSize: number, snakes: Snake[]): Position[] {
  const occupiedPositions = snakes.flatMap((s) => s.body)
  const food: Position[] = []

  for (let i = 0; i < count; i++) {
    food.push(getRandomPosition(gridSize, [...occupiedPositions, ...food]))
  }

  return food
}

export function createRoom(hostId: string, hostName: string, maxPlayers: number, gameDuration: number): GameRoom {
  const roomId = generateRoomId()
  const gridSize = GRID_SIZE
  const hostSnake = createSnake(hostId, hostName, 0, gridSize)

  const room: GameRoom = {
    id: roomId,
    snakes: [hostSnake],
    food: generateFood(FOOD_COUNT, gridSize, [hostSnake]),
    gameStatus: "waiting",
    winner: null,
    hostId,
    maxPlayers,
    timeRemaining: gameDuration,
    gameDuration,
    gridSize,
    createdAt: Date.now(),
  }

  gameRooms.set(roomId, room)
  return room
}

export function getRoom(roomId: string): GameRoom | undefined {
  return gameRooms.get(roomId)
}

export function joinRoom(roomId: string, playerId: string, playerName: string): GameRoom | null {
  const room = gameRooms.get(roomId)
  if (!room) return null
  if (room.gameStatus !== "waiting") return null
  if (room.snakes.length >= room.maxPlayers) return null
  if (room.snakes.some((s) => s.id === playerId)) return room

  const playerIndex = room.snakes.length
  const newSnake = createSnake(playerId, playerName, playerIndex, room.gridSize)
  room.snakes.push(newSnake)
  room.food = generateFood(FOOD_COUNT, room.gridSize, room.snakes)

  notifyListeners(roomId, room)
  return room
}

export function leaveRoom(roomId: string, playerId: string): boolean {
  const room = gameRooms.get(roomId)
  if (!room) return false

  room.snakes = room.snakes.filter((s) => s.id !== playerId)

  if (room.snakes.length === 0) {
    gameRooms.delete(roomId)
    roomListeners.delete(roomId)
    return true
  }

  // Transfer host if needed
  if (room.hostId === playerId && room.snakes.length > 0) {
    room.hostId = room.snakes[0].id
  }

  notifyListeners(roomId, room)
  return true
}

export function updateDirection(roomId: string, playerId: string, direction: Direction): void {
  const room = gameRooms.get(roomId)
  if (!room || room.gameStatus !== "playing") return

  const snake = room.snakes.find((s) => s.id === playerId)
  if (!snake || !snake.alive) return

  const opposites: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  }

  if (opposites[direction] !== snake.direction) {
    snake.nextDirection = direction
  }
}

export function startCountdown(roomId: string): void {
  const room = gameRooms.get(roomId)
  if (!room || room.gameStatus !== "waiting") return

  room.gameStatus = "countdown"
  room.timeRemaining = room.gameDuration
  notifyListeners(roomId, room)

  // Start countdown
  let countdown = 3
  const countdownInterval = setInterval(() => {
    countdown--
    if (countdown <= 0) {
      clearInterval(countdownInterval)
      room.gameStatus = "playing"
      startGameLoop(roomId)
    }
    notifyListeners(roomId, room)
  }, 1000)
}

function moveSnake(snake: Snake, allSnakes: Snake[], food: Position[], gridSize: number): { snake: Snake; food: Position[]; ate: boolean } {
  if (!snake.alive) return { snake, food, ate: false }

  const newSnake = { ...snake, direction: snake.nextDirection }
  const head = newSnake.body[0]
  let newHead: Position

  switch (newSnake.direction) {
    case "up":
      newHead = { x: head.x, y: head.y - 1 }
      break
    case "down":
      newHead = { x: head.x, y: head.y + 1 }
      break
    case "left":
      newHead = { x: head.x - 1, y: head.y }
      break
    case "right":
      newHead = { x: head.x + 1, y: head.y }
      break
  }

  // Check wall collision
  if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
    return { snake: { ...snake, alive: false }, food, ate: false }
  }

  // Check self collision
  if (newSnake.body.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
    return { snake: { ...snake, alive: false }, food, ate: false }
  }

  // Check collision with other snakes
  const otherSnakes = allSnakes.filter((s) => s.id !== snake.id && s.alive)
  for (const other of otherSnakes) {
    if (other.body.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      return { snake: { ...snake, alive: false }, food, ate: false }
    }
  }

  // Check food collision
  const foodIndex = food.findIndex((f) => f.x === newHead.x && f.y === newHead.y)
  const ate = foodIndex !== -1

  if (ate) {
    newSnake.body = [newHead, ...newSnake.body]
    newSnake.score += 10
    const newFood = [...food]
    const occupied = allSnakes.flatMap((s) => s.body)
    newFood[foodIndex] = getRandomPosition(gridSize, [...occupied, ...newFood])
    return { snake: newSnake, food: newFood, ate: true }
  } else {
    newSnake.body = [newHead, ...newSnake.body.slice(0, -1)]
    return { snake: newSnake, food, ate: false }
  }
}

function startGameLoop(roomId: string): void {
  const gameInterval = setInterval(() => {
    const room = gameRooms.get(roomId)
    if (!room) {
      clearInterval(gameInterval)
      return
    }

    if (room.gameStatus !== "playing") {
      clearInterval(gameInterval)
      return
    }

    // Update time
    room.timeRemaining -= 0.1

    // Move all snakes
    let newFood = [...room.food]
    room.snakes = room.snakes.map((snake) => {
      const result = moveSnake(snake, room.snakes, newFood, room.gridSize)
      newFood = result.food
      return result.snake
    })
    room.food = newFood

    // Check win conditions
    const aliveSnakes = room.snakes.filter((s) => s.alive)
    
    if (room.timeRemaining <= 0 || aliveSnakes.length === 0 || (aliveSnakes.length === 1 && room.snakes.length > 1)) {
      room.gameStatus = "gameover"
      clearInterval(gameInterval)

      if (room.timeRemaining <= 0 || aliveSnakes.length > 1) {
        // Time's up - winner is highest score
        const winner = [...room.snakes].sort((a, b) => b.score - a.score)[0]
        room.winner = winner.id
      } else if (aliveSnakes.length === 1) {
        room.winner = aliveSnakes[0].id
      } else {
        room.winner = null
      }
    }

    notifyListeners(roomId, room)
  }, GAME_SPEED)
}

const GAME_SPEED = 100

export function resetRoom(roomId: string): void {
  const room = gameRooms.get(roomId)
  if (!room) return

  // Recreate snakes at starting positions
  room.snakes = room.snakes.map((snake, index) => 
    createSnake(snake.id, snake.playerName, index, room.gridSize)
  )
  room.food = generateFood(FOOD_COUNT, room.gridSize, room.snakes)
  room.gameStatus = "waiting"
  room.winner = null
  room.timeRemaining = room.gameDuration

  notifyListeners(roomId, room)
}

export function subscribeToRoom(roomId: string, callback: (room: GameRoom) => void): () => void {
  if (!roomListeners.has(roomId)) {
    roomListeners.set(roomId, new Set())
  }
  roomListeners.get(roomId)!.add(callback)

  return () => {
    roomListeners.get(roomId)?.delete(callback)
  }
}

function notifyListeners(roomId: string, room: GameRoom): void {
  roomListeners.get(roomId)?.forEach((callback) => callback(room))
}

// Cleanup old rooms periodically
setInterval(() => {
  const now = Date.now()
  const maxAge = 1000 * 60 * 30 // 30 minutes

  for (const [roomId, room] of gameRooms) {
    if (now - room.createdAt > maxAge && room.gameStatus !== "playing") {
      gameRooms.delete(roomId)
      roomListeners.delete(roomId)
    }
  }
}, 1000 * 60 * 5) // Run every 5 minutes
