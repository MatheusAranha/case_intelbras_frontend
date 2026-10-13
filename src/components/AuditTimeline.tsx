import { useEffect, useRef, useState } from 'react'
import { fetchAudits } from '../api'
import type { AuditRecord, EventCategory } from '../types'
import './AuditTimeline.css'

const POLL_INTERVAL_MS = 3000
const MAX_PINS_SHOWN = 60

const CATEGORY_COLORS: Record<EventCategory, string> = {
  PROPERTY_CHANGE: '#3b82f6',
  STATUS_CHANGE: '#22c55e',
  MOTION_DETECTION: '#f97316',
  OTHER: '#6b7280',
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  PROPERTY_CHANGE: 'Property change',
  STATUS_CHANGE: 'Status change',
  MOTION_DETECTION: 'Motion detection',
  OTHER: 'Other',
}

export default function AuditTimeline() {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [selected, setSelected] = useState<AuditRecord | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const records = await fetchAudits()
        if (cancelled) return
        records.sort((a, b) => a.eventTimestamp.localeCompare(b.eventTimestamp))
        setAudits(records)
        setError(null)

        const stillPresent = records.find((record) => record.dedupKey === selectedKeyRef.current)
        if (stillPresent) setSelected(stillPresent)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setHasLoadedOnce(true)
      }
    }

    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  function selectPin(record: AuditRecord) {
    selectedKeyRef.current = record.dedupKey
    setSelected(record)
  }

  const pins = audits.slice(-MAX_PINS_SHOWN)

  return (
    <section className="audit-timeline">
      <header className="audit-timeline__header">
        <h2>Audit timeline</h2>
        <ul className="audit-timeline__legend">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <li key={category}>
              <span
                className="audit-timeline__swatch"
                style={{ background: CATEGORY_COLORS[category as EventCategory] }}
              />
              {label}
            </li>
          ))}
        </ul>
      </header>

      {error && <p className="audit-timeline__error">Failed to load audits: {error}</p>}
      {!hasLoadedOnce && !error && <p className="audit-timeline__hint">Loading audits…</p>}
      {hasLoadedOnce && pins.length === 0 && !error && (
        <p className="audit-timeline__hint">No audit records yet.</p>
      )}

      {pins.length > 0 && (
        <>
          <p className="audit-timeline__count">
            Showing latest {pins.length} of {audits.length} audited event(s)
          </p>
          <div className="audit-timeline__track">
            {pins.map((record) => (
              <button
                key={record.dedupKey}
                type="button"
                className={
                  'audit-timeline__pin' +
                  (selected?.dedupKey === record.dedupKey ? ' audit-timeline__pin--selected' : '')
                }
                style={{ background: CATEGORY_COLORS[record.eventCategory] }}
                title={`${record.deviceId} — ${record.eventType}`}
                onClick={() => selectPin(record)}
              />
            ))}
          </div>
        </>
      )}

      <div className="audit-timeline__detail">
        {selected ? (
          <dl>
            <dt>Device</dt>
            <dd>{selected.deviceId}</dd>
            <dt>Category</dt>
            <dd>{CATEGORY_LABELS[selected.eventCategory]}</dd>
            <dt>Event type</dt>
            <dd>{selected.eventType}</dd>
            <dt>Event timestamp</dt>
            <dd>{new Date(selected.eventTimestamp).toLocaleString()}</dd>
            <dt>General info</dt>
            <dd>{selected.generalInfo}</dd>
            <dt>Consumed at</dt>
            <dd>{new Date(selected.consumedAt).toLocaleString()}</dd>
            <dt>Dedup key</dt>
            <dd className="audit-timeline__mono">{selected.dedupKey}</dd>
          </dl>
        ) : (
          <p className="audit-timeline__hint">Click a pin to see its details.</p>
        )}
      </div>
    </section>
  )
}
