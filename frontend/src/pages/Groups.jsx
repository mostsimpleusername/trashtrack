import { CATEGORIES, CAT } from '../constants.js'
import { AnimatedNumber } from '../components/AnimatedNumber.jsx'

export function Groups({ groups }) {
  const list = Object.values(groups)
  return (
    <div className="flex-1 flex flex-col p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="text-xl font-black text-white">👥 Progress Kelompok</h1>
        <p className="text-white/40 text-xs">Runmadhan 2026 · 10 kelompok</p>
      </div>

      {/* 5×2 grid — no scroll */}
      <div className="flex-1 grid grid-cols-5 grid-rows-2 gap-3 overflow-hidden">
        {list.map((group) => (
          <div key={group.name}
            className="rounded-2xl border border-amber-500/25 flex flex-col overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)' }}>

            {/* TOP: group name + big total — centered, 50% */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-3 pt-3 pb-2">
              <div className="text-[20px] font-bold text-white/40 uppercase tracking-widest mb-1">
                {group.name}
              </div>
              <div className="text-6xl font-black font-mono text-amber-400 leading-none">
                <AnimatedNumber value={group.total} />
                <span className="text-xl ml-1 text-amber-400/60">kg</span>
              </div>
            </div>

            {/* BOTTOM: two sub-boxes side by side — 50% */}
            <div className="flex-1 flex gap-2 p-2">
              {CATEGORIES.map(cat => {
                const cfg = CAT[cat]
                return (
                  <div key={cat}
                    className={`flex-1 rounded-xl border ${cfg.border} px-2 py-2 flex flex-col justify-between items-center`}
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className={`text-[11px] font-bold uppercase tracking-wider ${cfg.color}`}>
                      {cfg.icon} {cfg.label.toLowerCase()}
                    </div>
                    <div className={`text-5xl font-black font-mono ${cfg.color} leading-none`}>
                      <AnimatedNumber value={group[cat] ?? 0} />
                      <span className="text-sm ml-0.5">kg</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
