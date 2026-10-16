import { useState } from 'react'
import { publishCsv } from '../api'
import './PublishCsv.css'

type Status = { kind: 'idle' } | { kind: 'success'; publishedCount: number } | { kind: 'error'; message: string }

export default function PublishCsv() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [submitting, setSubmitting] = useState(false)

  async function handleClick() {
    setSubmitting(true)
    try {
      const result = await publishCsv()
      setStatus({ kind: 'success', publishedCount: result.publishedCount })
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : String(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="publish-csv">
      <div>
        <h2>Sample dataset</h2>
        <p className="publish-csv__hint">
          Publishes the bundled CSV (100 real events + 4 synthetic DLQ demo rows) to Kafka.
          The audit timeline below picks up the results automatically.
        </p>
      </div>
      <div className="publish-csv__action">
        <button type="button" onClick={handleClick} disabled={submitting}>
          {submitting ? 'Publishing…' : 'Publish CSV'}
        </button>
        {status.kind === 'success' && (
          <p className="publish-csv__success">Published {status.publishedCount} events.</p>
        )}
        {status.kind === 'error' && <p className="publish-csv__error">Failed: {status.message}</p>}
      </div>
    </section>
  )
}
