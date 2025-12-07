// Observer Pattern - Event Service for system-wide notifications
// Allows decoupled communication between components

import type { POSEvent, POSNotification } from "../types/models"

type EventCallback = (notification: POSNotification) => void

class EventService {
  private static instance: EventService
  private listeners: Map<POSEvent, EventCallback[]> = new Map()

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService()
    }
    return EventService.instance
  }

  subscribe(event: POSEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) callbacks.splice(index, 1)
      }
    }
  }

  emit(event: POSEvent, message: string, data?: unknown): void {
    const notification: POSNotification = {
      event,
      message,
      data,
      timestamp: new Date(),
    }

    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(notification))
    }
  }
}

export const eventService = EventService.getInstance()
export default eventService
