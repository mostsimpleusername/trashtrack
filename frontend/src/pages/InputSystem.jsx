import { useState, useRef } from 'react'
import { CATEGORIES, CAT, NUM_GROUPS } from '../constants.js'

export function InputSystem({ ws, wsReady }) {
  const [group,    setGroup]    = useState('1')
  const [category, setCategory] = useState('anorganic')
  const [binNum,   setBinNum]   = useState('1')
  const [amount,   setAmount]   = useState('')
  const [status,   setStatus]   = useState(null)
  const inputRef = useRef(null)

  const showStatus = (type, msg) => {
    setStatus({ type, msg }); setTimeout(() => setStatus(null), 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (!amount || isNaN(val) || val <= 0) { showStatus('error', 'Masukkan angka yang valid'); return }
    if (!wsReady) { showStatus('error', 'Tidak terhubung ke server'); return }
    ws.current.send(JSON.stringify({ group, category, bin: binNum, amount: val }))
    setAmount('')
    showStatus('success', `+${val} kg → ${CAT[category].label} Bin ${binNum} (Kelompok ${group})`)
    inputRef.current?.focus()
  }

  const cfg = CAT[category]

  return (
    <div className="flex-1 flex items-start justify-center pt-8 px-6 overflow-auto">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-black text-white mb-1">Input Sampah</h1>
        <p className="text-white/40 text-sm mb-6">Tambah berat sampah per kelompok</p>

        <div className="rounded-2xl p-6 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Group selector */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Pilih Kelompok</label>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: NUM_GROUPS }, (_, i) => (i + 1).toString()).map(g => (
                  <button key={g} type="button" onClick={() => setGroup(g)}
                    className={`py-2.5 rounded-xl text-sm font-black transition-all
                      ${group === g
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                        : 'bg-white/5 text-white/40 border border-white/8 hover:text-white/70 hover:bg-white/8'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Kategori</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => {
                  const c = CAT[cat]; const active = category === cat
                  return (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`py-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all
                        ${active ? `${c.bg} border ${c.border} ${c.color} ring-1 ring-current` : 'bg-white/5 border border-white/8 text-white/35 hover:text-white/60'}`}>
                      <span className="text-xl">{c.icon}</span>
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bin */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Nomor Bin</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => {
                  const active = binNum === n.toString()
                  return (
                    <button key={n} type="button" onClick={() => setBinNum(n.toString())}
                      className={`flex-1 py-3.5 text-xl font-black rounded-xl transition-all
                        ${active ? `${cfg.bg} border ${cfg.border} ${cfg.color} ring-1 ring-current` : 'bg-white/5 border border-white/8 text-white/35 hover:text-white/60'}`}>
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Berat (kg)</label>
              <div className="relative">
                <input ref={inputRef} type="number" step="0.01" min="0.01"
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus
                  className={`w-full bg-white/6 border border-white/10 text-4xl font-black font-mono text-center py-4 rounded-xl outline-none transition-all focus:border-current focus:bg-white/9 ${cfg.color}`} />
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
                ${wsReady ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95' : 'bg-white/8 text-white/30 cursor-not-allowed'}`}>
              {wsReady ? `KIRIM → Kelompok ${group} · ${CAT[category].label} Bin ${binNum}` : 'MENGHUBUNGKAN...'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
