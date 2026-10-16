import AuditTimeline from './components/AuditTimeline'
import PublishCsv from './components/PublishCsv'
import RandomStreamControls from './components/RandomStreamControls'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <h1>Intelbras IoT events</h1>
      <PublishCsv />
      <AuditTimeline />
      <RandomStreamControls />
    </div>
  )
}
