import { CATEGORIES, CAT } from '../constants.js'
import { AnimatedNumber } from '../components/AnimatedNumber.jsx'

function BinCard({ cat, binNum, value, isTotal = false }) {
  const cfg = CAT[cat]
  const label = isTotal ? `TOTAL ${cfg.label}` : `${cfg.label} ${binNum}`
  return (
    <div className={`rounded-2xl border ${cfg.border} flex flex-col p-4 transition-all hover:brightness-125`}
      style={{ background: 'rgba(255,255,255,0.04)' }}>
      {/* Top row: label + icons */}
      <div className="flex items-center justify-between mb-auto">
        <div className={`flex items-center gap-1.5 text-[11px] font-bold tracking-widest ${cfg.color}`}>
          <span>{cfg.icon}</span>
          {label}
        </div>
        <div className="flex items-center gap-1.5">
          {cat === 'residual' && !isTotal && (
            <span className="text-[9px] font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-500/30">
              Kurangi
            </span>
          )}
          <span className="text-white/15 text-xs">↻</span>
        </div>
      </div>
      {/* Big number */}
      <div className={`text-5xl font-black font-mono ${cfg.color} mt-3`}>
        <AnimatedNumber value={value} /> kg
      </div>
    </div>
  )
}

export function Dashboard({ bins }) {
  return (
    <div className="flex-1 flex flex-col p-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-6 flex-shrink-0">
        <h1 className="text-3xl font-black text-white">
          Waste Management Event <span className="text-emerald-400">Runmadhan 2026</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Dikelola oleh Bank Sampah Amal Haqiqi</p>
      </div>

      {/* Grid: rows = bins (1–3 + total), cols = categories */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3].map(bin =>
          CATEGORIES.map(cat => (
            <BinCard key={`${cat}-${bin}`} cat={cat} binNum={bin} value={bins[cat]?.[bin] ?? 0} />
          ))
        )}
        {CATEGORIES.map(cat => (
          <BinCard key={`${cat}-total`} cat={cat} value={bins[cat]?.total ?? 0} isTotal />
        ))}
      </div>
    </div>
  )
}
