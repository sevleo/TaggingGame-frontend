import Entity from '@/models/entity'
import { gameState, reconcile } from '@/services/gameState'
import Bullet from '@/models/bullet'
import { type Ref } from 'vue'

const messages: any = []

function processServerMessages(playerHealth: Ref<number | null>, countEntities: Ref<number>) {
  while (messages.length > 0) {
    const message = getMessage()
    if (message) {
      // console.log(message)
      countEntities.value = message.data.entities.length
      for (const ent of message.data.entities) {
        if (!gameState.entities.has(ent.clientId)) {
          const entity = new Entity()
          entity.clientId = ent.clientId
          entity.entityId = ent.entityId
          gameState.entities.set(ent.clientId, entity)
        }
        const entity = gameState.entities.get(ent.clientId)

        // This client's entity
        if (ent.clientId == gameState.clientId) {
          // Received the authoritative position of this client's entity.
          entity.position = { x: ent.position.x, y: ent.position.y }
          playerHealth.value = ent.health

          // Server Reconciliation. Re-apply all the inputs not yet processed by the server.
          reconcile(entity, ent)
        } else {
          // Other entities
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
          entity.mousePosition = ent.mousePosition
        }
      }

      for (const deadEnt of message.data.deadEntities) {
        if (!gameState.deadEntities.has(deadEnt.entityId)) {
          const deadEntity = {
            clientId: deadEnt.clientId,
            entityId: deadEnt.entityId,
            position: deadEnt.position,
            faceDirection: deadEnt.faceDirection
          }
          gameState.deadEntities.set(deadEntity.entityId, deadEntity)
          // Check if the map size exceeds 15
          if (gameState.deadEntities.size > 15) {
            const oldestKey = gameState.deadEntities.keys().next().value // Get the first (oldest) key
            gameState.deadEntities.delete(oldestKey) // Remove the oldest entry
          }
        }
        if (gameState.entities.has(deadEnt.clientId)) {
          // gameState.entities.delete(deadEnt.clientId)
        }
      }

      for (const bull of message.data.bullets) {
        if (bull.clientId === gameState.clientId) {
          const bullet = gameState.clientBullets.get('client-' + bull.bullet_sequence_number)
          if (bullet) {
            if (bullet.bullet_sequence_number !== null && bullet.bullet_id === null) {
              // Remove the entry with the local bullet_sequence_number

              gameState.clientBullets.delete('client-' + bullet.bullet_sequence_number)

              // Assign the correct bullet_id
              bullet.bullet_id = bull.bullet_id

              // Now store the bullet in the Map using bullet_id as the key
              gameState.clientBullets.set(bull.bullet_id, bullet)
            }
          }
        }

        if (gameState.gameBullets.has(bull.bullet_id)) {
          continue
        } else {
          const entity = gameState.entities.get(bull.clientId)

          const bullet = new Bullet(
            bull.bullet_id,
            bull.clientId,
            bull.serverPosition,
            bull.direction,
            entity?.position,
            bull.mousePosition,
            bull.newBullet,
            bull.bullet_sequence_number
          )
          gameState.gameBullets.set(bull.bullet_id, bullet)
        }
      }
      for (const bull of message.data.removedBullets) {
        // Remove from gameBullets map
        if (gameState.gameBullets.has(bull.bullet_id)) {
          gameState.gameBullets.delete(bull.bullet_id)
        }
        // Remove from clientBullets map
        if (gameState.clientBullets.has(bull.bullet_id)) {
          // console.log('Removing bullet with bullet_id')
          gameState.clientBullets.delete(bull.bullet_id)
        }
        if (gameState.clientBullets.has('client-' + (bull.bullet_sequence_number - 1))) {
          // console.log('Removing bullet with bullet_sequence_number minus one')
          gameState.clientBullets.delete('client-' + (bull.bullet_sequence_number - 1))
        }
      }
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
