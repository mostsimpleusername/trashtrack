import { NAV } from '../constants.js'
import { AnimatedNumber } from './AnimatedNumber.jsx'

export function Sidebar({ activeTab, onTabChange, grandTotal, wsReady }) {
  const now = new Date().toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-white/5" style={{ background: '#0d1b2e' }}>
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <img src="/assets/logo.png" alt="Bank Sampah Amal" className="w-full object-contain" style={{ maxHeight: 72 }} />
        <div className="text-[9px] text-white/30 text-center mt-1">Runmadhan 2026</div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-3">
        {NAV.map(item => {
          const active = activeTab === item.id
          return (
            <button key={item.id} onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left w-full transition-all duration-200
                ${active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'text-white/45 hover:text-white/75 hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-white/8 text-white/40'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Total Widget */}
      <div className="mx-3 mt-4 p-4 rounded-xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-2">TOTAL SAMPAH ↻</div>
        <div className="text-4xl font-black text-amber-400 font-mono mb-1">
          <AnimatedNumber value={grandTotal} /> kg
        </div>
        <div className="text-[10px] text-white/30 mb-3">🕐 {now}</div>
        <p className="text-white/30 text-[10px] leading-relaxed text-center">
          Terima kasih telah bertanggung jawab memilah sampah dan menjaga bumi 🌿
        </p>
      </div>

      <div className="flex-1" />

      {/* Connection status */}
      <div className="px-4 py-3 flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full ${wsReady ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
        <span className={`text-[10px] ${wsReady ? 'text-emerald-400' : 'text-rose-400'}`}>
          {wsReady ? 'Terhubung' : 'Terputus'}
        </span>
      </div>
    </aside>
  )
}
