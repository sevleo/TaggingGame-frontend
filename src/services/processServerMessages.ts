import Entity from '@/models/entity'
import { gameState, reconcile } from '@/services/gameState'
import Bullet from '@/models/bullet'

const messages: any = []

function processServerMessages() {
  while (messages.length > 0) {
    const message = getMessage()
    if (message) {
      // console.log(message)
      console.log(gameState.gameBullets)
      for (const ent of message.data.entities) {
        if (!gameState.entities[ent.entity_id]) {
          const entity = new Entity()
          entity.entity_id = ent.entity_id
          gameState.entities[ent.entity_id] = entity
        }
        const entity = gameState.entities[ent.entity_id]
        if (ent.entity_id == gameState.entity_id) {
          // Received the authoritative position of this client's entity.
          entity.position.x = ent.position.x
          entity.position.y = ent.position.y
          // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
          reconcile(entity, ent)
        } else {
          // Received the position of an entity other than this client's.
          // Add it to the position buffer for interpolation.
          const timestamp = Date.now()
          const timestampDifference = timestamp - message.ts
          entity.position_buffer.push([
            // message.ts + timestampDifference,
            message.ts,
            ent.position,
            ent.faceDirection
          ])
        }
      }

      for (const bull of message.data.bullets) {
        if (gameState.entity_id !== bull.entity_id) {
          // if (gameState.gameBullets[bull.bullet_id]) {
          //   console.log('this bullet exists')
          // } else {
          //   console.log('this bullet does not exist yet, so lets create it')
          //   gameState.gameBullets[bull.bullet_id] = bull
          // }
          // gameState.gameBullets[bull.bullet_id] = bull
          if (gameState.gameBullets[bull.bullet_id]) {
            continue
          } else {
            const bullet = new Bullet(
              bull.bullet_id,
              gameState.entity_id,
              bull.serverPosition,
              bull.direction,
              bull.initialPosition
            )
            gameState.gameBullets[bull.bullet_id] = bullet
          }
        }
      }

      // for (const )
    }
  }
}

export default { processServerMessages, messages }

function getMessage() {
  for (let i = 0; i < messages.length; i++) {
    // Access each message in the queue.
    const message = messages[i]
    // // Check if the message's designated reception time has passed or is equal to the current time.
    messages.splice(i, 1)
    return message.payload
  }
}
