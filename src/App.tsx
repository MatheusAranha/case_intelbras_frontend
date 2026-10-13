import AuditTimeline from './components/AuditTimeline'
import RandomStreamControls from './components/RandomStreamControls'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <h1>Intelbras IoT events</h1>
      <AuditTimeline />
      <RandomStreamControls />
    </div>
  )
}
