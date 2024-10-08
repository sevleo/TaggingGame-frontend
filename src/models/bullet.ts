import { BULLET_SPEED } from '@/config/gameConstants'
import { gameState } from '@/services/gameState'

class Bullet {
  bullet_id: number | null
  clientId: number
  position: {
    x: number
    y: number
  }
  direction: {
    x: number
    y: number
  }
  speed: number
  initialPosition: {
    x: number
    y: number
  } | null
  clientCalculatedPosition: {
    x: number
    y: number
  } | null
  mousePosition: {
    x: number
    y: number
  } | null
  clientDirection: {
    x: number
    y: number
  } | null
  newBullet: boolean
  bullet_sequence_number: number | null

  constructor(
    bullet_id: number | null,
    clientId: number,
    position: { x: number; y: number },
    direction: { x: number; y: number },
    initialPosition: { x: number; y: number } | null,
    mousePosition: { x: number; y: number } | null,
    newBullet: boolean,
    bullet_sequence_number: number | null
  ) {
    this.bullet_id = bullet_id !== null ? bullet_id : null
    this.clientId = clientId
    this.position = {
      x: position.x,
      y: position.y
    }
    this.direction = {
      x: direction.x,
      y: direction.y
    }
    this.speed = BULLET_SPEED
    this.initialPosition = initialPosition !== null ? initialPosition : null
    this.clientCalculatedPosition = null
    this.mousePosition = mousePosition
    this.clientDirection = null // New attribute for client-side direction
    this.newBullet = newBullet
    this.bullet_sequence_number = bullet_sequence_number !== null ? bullet_sequence_number : null
  }

  updatePosition() {
    this.position.x +=
      (this.direction.x / Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)) * this.speed
    this.position.y +=
      (this.direction.y / Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)) * this.speed
  }

  updateClientPosition() {
    const entity = gameState.entities.get(this.clientId)
    if (entity) {
      if (this.clientCalculatedPosition === null && entity.position !== null) {
        // Set the initial position of the bullet to match the entity's position on the screen
        if (this.newBullet) {
          this.clientCalculatedPosition = {
            x: entity.position.x,
            y: entity.position.y
          }
        } else {
          this.clientCalculatedPosition = {
            // x: entity.position.x,
            // y: entity.position.y
            x: this.position.x,
            y: this.position.y
          }
        }

        if (this.newBullet) {
          if (this.mousePosition) {
            const directionX = this.mousePosition.x - this.clientCalculatedPosition.x
            const directionY = this.mousePosition.y - this.clientCalculatedPosition.y
            const distance = Math.sqrt(directionX ** 2 + directionY ** 2)

            if (distance > 0) {
              this.clientDirection = {
                x: directionX / distance,
                y: directionY / distance
              }
            }
          }
        } else {
          const distance = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2)

          this.clientDirection = {
            x: this.direction.x / distance,
            y: this.direction.y / distance
          }
        }
      } else {
        if (this.clientDirection && this.clientCalculatedPosition) {
          this.clientCalculatedPosition.x += this.clientDirection.x * this.speed
          this.clientCalculatedPosition.y += this.clientDirection.y * this.speed
        }
      }
    }
  }
}

export default Bullet
