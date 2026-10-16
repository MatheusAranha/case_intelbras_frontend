export type EventCategory = 'PROPERTY_CHANGE' | 'STATUS_CHANGE' | 'MOTION_DETECTION' | 'OTHER'

export const EVENT_CATEGORIES: EventCategory[] = [
  'PROPERTY_CHANGE',
  'STATUS_CHANGE',
  'MOTION_DETECTION',
  'OTHER',
]

export interface AuditRecord {
  dedupKey: string
  deviceId: string
  eventCategory: EventCategory
  eventType: string
  eventTimestamp: string
  generalInfo: string
  consumedAt: string
  createdAt: string
}

export interface RandomEventStreamConfig {
  eventsPerMinute: number
  dlqRate: number
  duplicateRate: number
  categories: EventCategory[]
}

export interface RandomEventStreamStatus {
  running: boolean
  config: RandomEventStreamConfig | null
  startedAt: string | null
  requestedCount: number
  publishedCount: number
}

export interface SimulationResult {
  publishedCount: number
}
