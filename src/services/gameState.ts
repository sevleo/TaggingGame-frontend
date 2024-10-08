import type Bullet from '@/models/bullet'
import { processInputs } from './processInputs'
import serverMessages from './processServerMessages'
import { INTERPOLATION_OFFSET } from '@/config/gameConstants'
import type { Input } from '@/types/Input'
import { type Ref } from 'vue'

// Unique ID of our entity. Assigned by Server on connection.
const gameState = {
  // entities: [] as any,
  entities: new Map<number, any>(),
  deadEntities: new Map<number, any>(),
  clientBullets: new Map<string, Bullet>(),
  gameBullets: new Map<number, Bullet>(),
  key_left: false as boolean,
  key_right: false as boolean,
  key_up: false as boolean,
  key_down: false as boolean,
  key_space: false as boolean,
  last_ts: null as any,
  clientId: null as any,
  entityId: null as any,
  input_sequence_number: 0 as number,
  pending_inputs: new Map<number, Input>(),
  status: { textContent: null as any } as any,
  canvas: {} as any,
  context: null as CanvasRenderingContext2D | null,
  update_interval: null as any,
  socket: null as any,
  mousePosition: { x: 0, y: 0 } as any,
  mouseMoved: false as boolean,
  faceDirection: { x: 0 as number, y: 0 as number },
  previousFaceDirection: { x: 0 as number, y: 0 as number },
  bullet_sequence_number: 0 as number,
  health: null as any
}

// Update Client state.
function updateGameState(
  isInGame: Ref<boolean>,
  playerHealth: Ref<number | null>,
  countEntities: Ref<number>
) {
  // Listen to the server.
  serverMessages.processServerMessages(playerHealth, countEntities)

  if (gameState.clientId == null) return // Not connected yet

  if (isInGame.value) {
    processInputs()
  }
  interpolate()

  updateBullets()

  // Show some info.
  const info = `Non-acknowledged inputs: ${gameState.pending_inputs.size}`
  gameState.status.textContent = info
}

function interpolate() {
  // Compute render timestamp.
  const now = Date.now()
  const render_timestamp = now - INTERPOLATION_OFFSET

  gameState.entities.forEach((entity: any) => {
    // No point in interpolating this client's entity.
    if (entity.clientId == gameState.clientId) {
      return
    }

    // Find the two authoritative positions surrounding the rendering timestamp.
    const buffer = entity.position_buffer

    // Drop older positions.
    while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
      buffer.shift()
    }

    // Check if there are at least two positions in the buffer that
    // surround the render_timestamp
    if (
      buffer.length >= 2 &&
      buffer[0][0] <= render_timestamp &&
      render_timestamp <= buffer[1][0]
    ) {
      const [t0, p0, fd0] = buffer[0] // represent the earlier timestamp and position.
      const [t1, p1, fd1] = buffer[1] // represent the later timestamp and position.

      entity.position = {
        x: p0.x + ((p1.x - p0.x) * (render_timestamp - t0)) / (t1 - t0),
        y: p0.y + ((p1.y - p0.y) * (render_timestamp - t0)) / (t1 - t0)
      }
      // entity.position.x = p0.x + ((p1.x - p0.x) * (render_timestamp - t0)) / (t1 - t0)
      // entity.position.y = p0.y + ((p1.y - p0.y) * (render_timestamp - t0)) / (t1 - t0)

      entity.faceDirection.x = fd0.x + ((fd1.x - fd0.x) * (render_timestamp - t0)) / (t1 - t0)
      entity.faceDirection.y = fd0.y + ((fd1.y - fd0.y) * (render_timestamp - t0)) / (t1 - t0)

      // entity.faceDirection.x = fd0.x
      // entity.faceDirection.y = fd0.y
    }
  })
}

function reconcile(entity: any, state: any) {
  for (const [key, input] of gameState.pending_inputs) {
    if (
      input.input_sequence_number !== null &&
      input.input_sequence_number <= state.last_processed_input
    ) {
      gameState.pending_inputs.delete(key)
    } else {
      entity.applyInput(input)
    }
  }
}

function updateBullets() {
  gameState.clientBullets.forEach((bullet: Bullet) => {
    bullet.updatePosition()
  })
  gameState.gameBullets.forEach((bullet: Bullet) => {
    bullet.updateClientPosition()
  })
}

export { gameState, updateGameState, reconcile }
