import { useState, useEffect } from 'react'
import { CATEGORIES, CAT, MEDAL } from '../constants.js'
import { AnimatedNumber } from '../components/AnimatedNumber.jsx'

function LeaderboardRow({ group, rank, prevRank, maxTotal }) {
  const pct = maxTotal > 0 ? (group.total / maxTotal) * 100 : 0
  const moved   = prevRank !== null && prevRank !== rank
  const movedUp = prevRank !== null && prevRank > rank

  const rowBg =
    rank === 1 ? 'bg-gradient-to-r from-amber-500/15 to-transparent border-amber-500/30' :
    rank === 2 ? 'bg-gradient-to-r from-slate-400/10 to-transparent border-slate-400/20' :
    rank === 3 ? 'bg-gradient-to-r from-orange-600/10 to-transparent border-orange-500/20' :
    'border-white/6'

  return (
    <div className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-500 ${rowBg}`}
      style={{ background: rank <= 3 ? undefined : 'rgba(255,255,255,0.025)' }}>
      {/* Rank */}
      <div className="w-10 text-center flex-shrink-0">
        {rank <= 3
          ? <span className="text-2xl">{MEDAL[rank - 1]}</span>
          : <span className="text-lg font-black text-white/30">#{rank}</span>
        }
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-bold text-white text-sm">{group.name}</span>
          {moved && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${movedUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {movedUp ? '▲' : '▼'}
            </span>
          )}
        </div>
        <div className="w-full h-2 rounded-full bg-white/6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              rank === 1 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
              rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
              rank === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              'bg-gradient-to-r from-emerald-500 to-sky-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-3 mt-1.5">
          {CATEGORIES.map(cat => (
            <span key={cat} className={`text-[10px] font-mono ${CAT[cat].color}`}>
              {CAT[cat].icon} <AnimatedNumber value={group[cat] ?? 0} />
            </span>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="text-right flex-shrink-0">
        <div className={`text-2xl font-black font-mono ${rank === 1 ? 'text-amber-400' : 'text-white'}`}>
          <AnimatedNumber value={group.total} />
        </div>
        <div className="text-[10px] text-white/40 font-bold">kg</div>
      </div>
    </div>
  )
}

export function Leaderboard({ groups }) {
  const [prevRanks, setPrevRanks] = useState({})
  const sorted   = [...Object.values(groups)].sort((a, b) => b.total - a.total)
  const maxTotal = sorted[0]?.total ?? 1

  useEffect(() => {
    setPrevRanks(prev => {
      const updated = { ...prev }
      sorted.forEach((g, i) => { if (!(g.name in updated)) updated[g.name] = i + 1 })
      return updated
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sorted.map(g => g.name))])

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            🏆 Leaderboard
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30 animate-pulse">
              LIVE
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Ranking diperbarui secara real-time</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30">Total seluruh kelompok</div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            <AnimatedNumber value={sorted.reduce((a, g) => a + g.total, 0)} /> kg
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((group, i) => (
          <LeaderboardRow
            key={group.name}
            group={group}
            rank={i + 1}
            prevRank={prevRanks[group.name] ?? null}
            maxTotal={maxTotal}
          />
        ))}
      </div>
    </div>
  )
}
