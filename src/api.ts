import type { AuditRecord, RandomEventStreamConfig, RandomEventStreamStatus, SimulationResult } from './types'

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${response.status} ${response.statusText}: ${body}`)
  }
  return response.json() as Promise<T>
}

export function fetchAudits(): Promise<AuditRecord[]> {
  return fetch('/audits').then(json<AuditRecord[]>)
}

export function publishCsv(): Promise<SimulationResult> {
  return fetch('/events/simulate', { method: 'POST' }).then(json<SimulationResult>)
}

export function fetchRandomStreamStatus(): Promise<RandomEventStreamStatus> {
  return fetch('/events/random-stream/status').then(json<RandomEventStreamStatus>)
}

export function startRandomStream(config: RandomEventStreamConfig): Promise<RandomEventStreamStatus> {
  return fetch('/events/random-stream/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  }).then(json<RandomEventStreamStatus>)
}

export function stopRandomStream(): Promise<RandomEventStreamStatus> {
  return fetch('/events/random-stream/stop', { method: 'POST' }).then(json<RandomEventStreamStatus>)
}
