<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { setup } from '@/utilities/setup'
import { updateDirections, updateBoost, fireBullet } from '../services/webSocket'

// List of active directions
const activeDirections = ref<Set<string>>(new Set())

// Variable for requesting frame animation update
let animationFrameId: number | null = null

// CanvasRef for canvas drawing
const canvasRef = ref<HTMLCanvasElement | null>(null)

const health = ref<number>(0)

// Frame update loop
const animateMovement = () => {
  animationFrameId = requestAnimationFrame(animateMovement)
}

const handleKeyDown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase() // Convert key to lowercase
  // Start moving
  if (
    key === 'arrowleft' ||
    key === 'arrowright' ||
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'a' ||
    key === 'd' ||
    key === 'w' ||
    key === 's'
  ) {
    if (!activeDirections.value.has(key)) {
      activeDirections.value.add(key)
      updateDirections(activeDirections)
    }
  }

  // Start boosting
  if (event.key === 'Shift') {
    updateBoost(true)
  }

  if (event.key === ' ') {
    fireBullet()
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase() // Convert key to lowercase

  // Stop moving
  if (
    key === 'arrowleft' ||
    key === 'arrowright' ||
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'a' ||
    key === 'd' ||
    key === 'w' ||
    key === 's'
  ) {
    if (activeDirections.value.has(key)) {
      activeDirections.value.delete(key)
      updateDirections(activeDirections)
    }
  }

  // Stop boosting
  if (event.key === 'Shift') {
    updateBoost(false)
  }
}

onMounted(() => {
  setup(canvasRef, health)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  animateMovement()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div>
    <canvas ref="canvasRef" width="800" height="800" style="border: 0.5px solid wheat"
      ><p>addaa</p>
    </canvas>
    <div>
      <p>Health: {{ health }}</p>
    </div>
  </div>
</template>

<style scoped></style>
