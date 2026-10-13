import { useEffect, useState, type FormEvent } from 'react'
import { fetchRandomStreamStatus, startRandomStream, stopRandomStream } from '../api'
import { EVENT_CATEGORIES, type EventCategory, type RandomEventStreamStatus } from '../types'
import './RandomStreamControls.css'

const POLL_INTERVAL_MS = 3000

export default function RandomStreamControls() {
  const [status, setStatus] = useState<RandomEventStreamStatus | null>(null)
  const [eventsPerMinute, setEventsPerMinute] = useState(600)
  const [dlqRate, setDlqRate] = useState(0.05)
  const [duplicateRate, setDuplicateRate] = useState(0.1)
  const [categories, setCategories] = useState<EventCategory[]>([...EVENT_CATEGORIES])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const current = await fetchRandomStreamStatus()
        if (!cancelled) setStatus(current)
      } catch {
        // Status polling failures are silent — the form's own start/stop errors are enough signal.
      }
    }

    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  function toggleCategory(category: EventCategory) {
    setCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const next = await startRandomStream({ eventsPerMinute, dlqRate, duplicateRate, categories })
      setStatus(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStop() {
    setSubmitting(true)
    setError(null)
    try {
      const next = await stopRandomStream()
      setStatus(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="stream-controls">
      <h2>Random event stream</h2>

      <form className="stream-controls__form" onSubmit={handleSubmit}>
        <label>
          Events per minute
          <input
            type="number"
            min={1}
            step={1}
            value={eventsPerMinute}
            onChange={(e) => setEventsPerMinute(Number(e.target.value))}
            required
          />
        </label>

        <label>
          DLQ rate (0–1)
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={dlqRate}
            onChange={(e) => setDlqRate(Number(e.target.value))}
          />
        </label>

        <label>
          Duplicate rate (0–1)
          <input
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={duplicateRate}
            onChange={(e) => setDuplicateRate(Number(e.target.value))}
          />
        </label>

        <fieldset className="stream-controls__categories">
          <legend>Categories</legend>
          {EVENT_CATEGORIES.map((category) => (
            <label key={category} className="stream-controls__checkbox">
              <input
                type="checkbox"
                checked={categories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              {category}
            </label>
          ))}
        </fieldset>

        <div className="stream-controls__actions">
          <button type="submit" disabled={submitting || categories.length === 0}>
            Start
          </button>
          <button type="button" onClick={handleStop} disabled={submitting || !status?.running}>
            Stop
          </button>
        </div>
      </form>

      {error && <p className="stream-controls__error">{error}</p>}

      <div className="stream-controls__status">
        {status ? (
          <dl>
            <dt>Running</dt>
            <dd>{status.running ? 'yes' : 'no'}</dd>
            <dt>Requested</dt>
            <dd>{status.requestedCount}</dd>
            <dt>Published</dt>
            <dd>{status.publishedCount}</dd>
            {status.startedAt && (
              <>
                <dt>Started at</dt>
                <dd>{new Date(status.startedAt).toLocaleString()}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="stream-controls__hint">Loading status…</p>
        )}
      </div>
    </section>
  )
}
