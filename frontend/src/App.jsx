import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws'
const RESET_URL = 'http://localhost:8000/reset'

// ─── Config ──────────────────────────────────────────────────────────────────
const CATEGORIES = ['organic', 'anorganic', 'residual']

const CAT = {
  organic: {
    label: 'ORGANIK',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6 4-3 10-3 13-3-2 5-7 7-12 7-1.5 0-3-.5-4-1.5L3 14C4.5 11 5 8 17 8z"/>
      </svg>
    ),
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    badge: null,
  },
  anorganic: {
    label: 'ANORGANIK',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
    color: 'text-sky-400',
    border: 'border-sky-500/20',
    badge: null,
  },
  residual: {
    label: 'RESIDU',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    color: 'text-rose-400',
    border: 'border-rose-500/20',
    badge: 'Kurangi',
  },
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const start = prev.current
    const end = value
    prev.current = value
    if (start === end) return
    const dur = 500
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(start + (end - start) * e)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  // Show integer if whole number, else 1 decimal
  const fmt = display === Math.floor(display) ? display.toFixed(0) : display.toFixed(1)
  return <span>{fmt}</span>
}

// ─── Bin Card ─────────────────────────────────────────────────────────────────
function BinCard({ cat, binNum, value, isTotal = false }) {
  const cfg = CAT[cat]
  return (
    <div
      className={`rounded-xl p-4 flex flex-col gap-2 border ${cfg.border} transition-all duration-300 hover:border-opacity-60`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-xs font-bold tracking-widest ${cfg.color}`}>
          <span className={cfg.color}>{cfg.icon}</span>
          {isTotal ? `TOTAL ${cfg.label}` : `${cfg.label} ${binNum}`}
        </div>
        <div className="flex items-center gap-2">
          {!isTotal && cfg.badge && (
            <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
              {cfg.badge}
            </span>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-white/20">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </div>
      </div>

      {/* Value */}
      <div className={`text-4xl font-black font-mono ${cfg.color} mt-1 mb-1`}>
        <AnimatedNumber value={value} /> kg
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ trashData, activeTab, onTabChange }) {
  const grandTotal = CATEGORIES.reduce((a, c) => a + (trashData[c]?.total || 0), 0)
  const now = new Date()
  const timeStr = now.toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(',', '')

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', badge: 'Hot', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    )},
    { id: 'input', label: 'Input Sampah', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    )},
    { id: 'about', label: 'Tentang Kami', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
      </svg>
    )},
  ]

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#0d1b2e' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* House icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-black text-white leading-tight">Bank</div>
            <div className="text-sm font-black text-amber-400 leading-tight">Sampah Amal</div>
            <div className="text-[9px] text-white/30 leading-tight mt-0.5">Supported by community</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 pt-4">
        {navItems.map(item => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-200 w-full
                ${active
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
            >
              <span className={active ? 'text-white' : 'text-white/40'}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && active && (
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Total Sampah widget */}
      <div className="mx-3 mt-6 p-4 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.035)' }}>
        <div className="flex items-center gap-2 text-white/50 text-xs font-bold tracking-widest mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          TOTAL SAMPAH
        </div>
        <div className="text-4xl font-black text-amber-400 font-mono mb-2">
          <AnimatedNumber value={grandTotal} /> kg
        </div>
        <div className="flex items-center gap-1.5 text-white/30 text-[10px] mb-4">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
          </svg>
          Updated: {timeStr}
        </div>
        <p className="text-white/35 text-xs leading-relaxed text-center">
          Terima kasih telah bertanggung jawab memilah sampah dan menjaga bumi 🌿
        </p>
      </div>

      <div className="flex-1" />

      {/* Bottom version */}
      <div className="px-5 py-4 text-[10px] text-white/20 text-center">
        TrashTrack v1.0
      </div>
    </aside>
  )
}

// ─── Dashboard Grid ───────────────────────────────────────────────────────────
function Dashboard({ trashData }) {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {/* Header */}
      <div className="text-center pt-8 pb-6 px-6">
        <h1 className="text-3xl font-black text-white">
          Waste Management Event{' '}
          <span className="text-emerald-400">Runmadhan 2026</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Dikelola oleh Bank Sampah Amal Haqiqi</p>
      </div>

      {/* Grid: 4 rows × 3 cols */}
      <div className="px-6 pb-8 grid grid-cols-3 gap-4">
        {/* Rows 1–3: individual bins */}
        {[1, 2, 3].map(bin =>
          CATEGORIES.map(cat => (
            <BinCard
              key={`${cat}-${bin}`}
              cat={cat}
              binNum={bin}
              value={trashData[cat]?.[bin] ?? 0}
            />
          ))
        )}

        {/* Row 4: totals */}
        {CATEGORIES.map(cat => (
          <BinCard
            key={`${cat}-total`}
            cat={cat}
            binNum={null}
            value={trashData[cat]?.total ?? 0}
            isTotal
          />
        ))}
      </div>
    </div>
  )
}

// ─── Input Tab ────────────────────────────────────────────────────────────────
function InputSystem({ ws, wsReady }) {
  const [category, setCategory] = useState('organic')
  const [binNum, setBinNum] = useState('1')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState(null)
  const inputRef = useRef(null)

  const showStatus = (type, msg) => {
    setStatus({ type, msg })
    setTimeout(() => setStatus(null), 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!amount || isNaN(val) || val <= 0) {
      showStatus('error', 'Masukkan angka yang valid')
      return
    }
    if (!wsReady) {
      showStatus('error', 'Tidak terhubung ke server')
      return
    }
    ws.current.send(JSON.stringify({ category, bin: binNum, amount: val }))
    setAmount('')
    showStatus('success', `+${val} kg ditambahkan ke ${CAT[category].label} Bin ${binNum}`)
    inputRef.current?.focus()
  }

  const cfg = CAT[category]

  return (
    <div className="flex-1 flex items-start justify-center pt-12 px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black text-white mb-1 text-center">Tambah Berat Sampah</h1>
        <p className="text-white/40 text-sm text-center mb-8">Input data ke bank sampah</p>

        <div className="rounded-2xl p-6 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Kategori</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => {
                  const c = CAT[cat]
                  const active = category === cat
                  return (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all
                        ${active ? `${c.color} border ${c.border} bg-white/5 ring-1 ring-current` : 'text-white/30 border border-white/8 hover:text-white/50'}`}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bin */}
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Nomor Bin</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => {
                  const active = binNum === n.toString()
                  return (
                    <button key={n} type="button" onClick={() => setBinNum(n.toString())}
                      className={`flex-1 py-3.5 text-xl font-black rounded-xl transition-all
                        ${active ? `${cfg.color} border ${cfg.border} bg-white/5 ring-1 ring-current` : 'text-white/30 border border-white/8 hover:text-white/50'}`}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Berat (kg)</label>
              <div className="relative">
                <input ref={inputRef} type="number" step="0.01" min="0.01"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0" autoFocus
                  className={`w-full bg-white/5 border border-white/10 text-white text-4xl font-black font-mono text-center py-4 rounded-xl outline-none transition-all focus:border-current focus:bg-white/8 ${cfg.color}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">kg</span>
              </div>
            </div>

            {status && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center
                ${status.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'}`}>
                {status.msg}
              </div>
            )}

            <button type="submit"
              className={`w-full py-4 rounded-xl text-lg font-black tracking-wide transition-all
                ${wsReady ? `bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95` : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
            >
              {wsReady ? 'KIRIM DATA' : 'MENGHUBUNGKAN...'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [wsReady, setWsReady] = useState(false)
  const [trashData, setTrashData] = useState({
    organic:  { 1: 0, 2: 0, 3: 0, total: 0 },
    anorganic:{ 1: 0, 2: 0, 3: 0, total: 0 },
    residual: { 1: 0, 2: 0, 3: 0, total: 0 },
  })
  const ws = useRef(null)
  const reconnTimer = useRef(null)

  const connect = useCallback(() => {
    const sock = new WebSocket(WS_URL)
    sock.onopen = () => { setWsReady(true); clearTimeout(reconnTimer.current) }
    sock.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.error) return
        const norm = {}
        for (const cat of CATEGORIES) {
          norm[cat] = {
            1: d[cat]?.['1'] ?? d[cat]?.[1] ?? 0,
            2: d[cat]?.['2'] ?? d[cat]?.[2] ?? 0,
            3: d[cat]?.['3'] ?? d[cat]?.[3] ?? 0,
            total: d[cat]?.total ?? 0,
          }
        }
        setTrashData(norm)
      } catch {}
    }
    sock.onclose = () => { setWsReady(false); reconnTimer.current = setTimeout(connect, 3000) }
    sock.onerror = () => sock.close()
    ws.current = sock
  }, [])

  useEffect(() => { connect(); return () => { clearTimeout(reconnTimer.current); ws.current?.close() } }, [connect])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a1628', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar trashData={trashData} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0f2032' }}>
        {/* Top bar */}
        <div className="flex items-center justify-end px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${wsReady ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className={wsReady ? 'text-emerald-400' : 'text-rose-400'}>
              {wsReady ? 'Terhubung' : 'Terputus'}
            </span>
            <button onClick={async () => { if (confirm('Reset semua data?')) await fetch(RESET_URL, { method: 'POST' }) }}
              className="ml-3 text-white/20 hover:text-rose-400 transition-colors text-xs">
              Reset
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'dashboard'
            ? <Dashboard trashData={trashData} />
            : activeTab === 'input'
              ? <InputSystem ws={ws} wsReady={wsReady} />
              : (
                <div className="flex-1 flex items-center justify-center h-full text-white/30 text-lg">
                  Halaman Tentang Kami — Coming soon
                </div>
              )
          }
        </div>
      </div>
    </div>
  )
}
