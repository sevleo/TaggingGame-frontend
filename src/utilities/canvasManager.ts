import { type Ref } from 'vue'
import { getClientId } from '@/services/webSocket'
import { type AllPositions } from '@/types/allPositions'
import { ws } from '@/services/webSocket'

let context: CanvasRenderingContext2D | null = null
let mousePosition = { x: 0, y: 0 }

export function initializeCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>
): CanvasRenderingContext2D | null {
  if (canvasRef.value) {
    context = canvasRef.value.getContext('2d')
    canvasRef.value.addEventListener('mousemove', updateMousePosition)
  }
  return context
}

export function drawPositions(
  canvasRef: Ref<HTMLCanvasElement | null>,
  allPositions: AllPositions
) {
  if (context && canvasRef.value) {
    context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    Object.entries(allPositions).forEach(([, value]) => {
      // console.log(value)
      if (context) {
        context.fillStyle = value.clientId === getClientId() ? 'green' : 'white'
        context.beginPath() // Start a new path
        context.arc(value.position.x, value.position.y, value.radius, 0, Math.PI * 2) // Draw a circle with radius 10
        context.fill() // Fill the circle with the current fill style

        // Draw the direction line
        context.strokeStyle = 'red'
        context.beginPath()
        context.moveTo(value.position.x, value.position.y)

        let targetPosition
        let weaponPosition

        const lineLength = 30
        if (value.clientId === getClientId()) {
          // Calculate direction towards mouse position
          const directionX = mousePosition.x - value.position.x
          const directionY = mousePosition.y - value.position.y

          const magnitude = Math.sqrt(directionX * directionX + directionY * directionY)

          // console.log(magnitude)

          weaponPosition = {
            x: value.position.x + (directionX / magnitude) * lineLength,
            y: value.position.y + (directionY / magnitude) * lineLength
          }

          targetPosition = {
            x: value.position.x + directionX,
            y: value.position.y + directionY
          }

          sendDirectionUpdate({
            directionX: directionX,
            directionY: directionY
          })
        } else {
          // Use the provided direction
          const direction = value.direction || { directionX: 0, directionY: 0 }

          const magnitude = Math.sqrt(
            direction.directionX * direction.directionX +
              direction.directionY * direction.directionY
          )

          weaponPosition = {
            x: value.position.x + (direction.directionX / magnitude) * lineLength,
            y: value.position.y + (direction.directionY / magnitude) * lineLength
          }

          // targetPosition = {
          //   x: value.position.x + direction.directionX,
          //   y: value.position.y + direction.directionY
          // }
        }

        // Draw the target position line
        // context.strokeStyle = 'red'
        // context.beginPath()
        // context.moveTo(value.position.x, value.position.y)
        // context.lineTo(targetPosition.x, targetPosition.y)
        // context.stroke()

        // Draw the weapon position line
        context.strokeStyle = 'white'
        context.beginPath()
        context.moveTo(value.position.x, value.position.y)
        context.lineTo(weaponPosition.x, weaponPosition.y)
        context.stroke()
      }
    })
  }
}

function updateMousePosition(event: MouseEvent) {
  if (context) {
    const rect = context.canvas.getBoundingClientRect()
    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}

function sendDirectionUpdate(direction: { directionX: number; directionY: number }) {
  const message = {
    type: 'updateDirection',
    clientId: getClientId(),
    direction
  }
  ws.send(JSON.stringify(message))
}
