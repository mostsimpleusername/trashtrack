import { useState, useEffect, useRef, useCallback } from 'react'
import { WS_URL, RESET_URL, NUM_GROUPS, CATEGORIES } from './constants.js'
import { Sidebar }     from './components/Sidebar.jsx'
import { Dashboard }   from './pages/Dashboard.jsx'
import { Groups }      from './pages/Groups.jsx'
import { Leaderboard } from './pages/Leaderboard.jsx'
import { InputSystem } from './pages/InputSystem.jsx'
import { About }       from './pages/About.jsx'

// ─── Default State ────────────────────────────────────────────────────────────
const DEFAULT_BINS = Object.fromEntries(
  ['organic', 'anorganic', 'residual'].map(c => [c, { 1: 0, 2: 0, 3: 0, total: 0 }])
)
const DEFAULT_GROUPS = Object.fromEntries(
  Array.from({ length: NUM_GROUPS }, (_, i) => [
    String(i + 1),
    { name: `Kelompok ${i + 1}`, organic: 0, anorganic: 0, residual: 0, total: 0 }
  ])
)

function normalizeBins(raw) {
  const result = {}
  for (const cat of CATEGORIES) {
    const src = raw?.[cat] ?? {}
    result[cat] = {
      1: src['1'] ?? src[1] ?? 0,
      2: src['2'] ?? src[2] ?? 0,
      3: src['3'] ?? src[3] ?? 0,
      total: src.total ?? 0,
    }
  }
  return result
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [wsReady,   setWsReady]   = useState(false)
  const [bins,      setBins]      = useState(DEFAULT_BINS)
  const [groups,    setGroups]    = useState(DEFAULT_GROUPS)
  const ws         = useRef(null)
  const reconnTimer = useRef(null)

  const grandTotal = Object.values(groups).reduce((a, g) => a + (g.total ?? 0), 0)

  const connect = useCallback(() => {
    const sock = new WebSocket(WS_URL)
    sock.onopen  = () => { setWsReady(true); clearTimeout(reconnTimer.current) }
    sock.onclose = () => { setWsReady(false); reconnTimer.current = setTimeout(connect, 3000) }
    sock.onerror = () => sock.close()
    sock.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.error) return
        if (d.bins && d.groups) {
          setBins(normalizeBins(d.bins))
          setGroups(d.groups)
        } else {
          setBins(normalizeBins(d))
        }
      } catch {}
    }
    ws.current = sock
  }, [])

  useEffect(() => {
    connect()
    return () => { clearTimeout(reconnTimer.current); ws.current?.close() }
  }, [connect])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a1628', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} grandTotal={grandTotal} wsReady={wsReady} />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0f2032' }}>
        {/* Topbar */}
        <div className="flex items-center justify-end px-5 py-2.5 border-b border-white/5 flex-shrink-0">
          <button
            onClick={async () => { if (confirm('Reset semua data ke 0?')) await fetch(RESET_URL, { method: 'POST' }) }}
            className="text-[11px] text-white/20 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-rose-500/10">
            ↺ Reset
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'dashboard'   && <Dashboard   bins={bins} />}
          {activeTab === 'groups'      && <Groups      groups={groups} />}
          {activeTab === 'leaderboard' && <Leaderboard groups={groups} />}
          {activeTab === 'input'       && <InputSystem ws={ws} wsReady={wsReady} />}
          {activeTab === 'about'       && <About />}
        </div>
      </div>
    </div>
  )
}
