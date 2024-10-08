// Canvas
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 500
const GRID_SIZE = 50

// Pawn
const RADIUS = 10
const MOVEMENT_SPEED = 300

// Bullet
const BULLET_SPEED = 9
const BULLET_COOLDOWN = 200

// Game
const GAME_SPEED_RATE = 16.67

// Network
const INTERPOLATION_OFFSET = 300 // Should be close to BROADCAST_RATE_INTERVAL on server for better performance

export {
  RADIUS,
  MOVEMENT_SPEED,
  BULLET_SPEED,
  BULLET_COOLDOWN,
  GAME_SPEED_RATE,
  INTERPOLATION_OFFSET,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GRID_SIZE
}
