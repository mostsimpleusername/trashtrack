export const WS_URL    = 'ws://localhost:8000/ws'
export const RESET_URL = 'http://localhost:8000/reset'

export const CATEGORIES = ['anorganic', 'residual']
export const NUM_GROUPS = 10

export const CAT = {
  organic:   { label: 'ORGANIK',   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400', icon: '🌿' },
  anorganic: { label: 'ANORGANIK', color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'border-sky-500/25',     dot: 'bg-sky-400',     icon: '♻️' },
  residual:  { label: 'RESIDU',    color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    dot: 'bg-rose-400',    icon: '🗑️' },
}

export const MEDAL = ['🥇', '🥈', '🥉']

export const NAV = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '📊', badge: null   },
  { id: 'groups',      label: 'Kelompok',     icon: '👥', badge: '10'   },
  { id: 'leaderboard', label: 'Leaderboard',  icon: '🏆', badge: 'Live' },
  { id: 'input',       label: 'Input Sampah', icon: '➕', badge: null   },
  { id: 'about',       label: 'Tentang Kami', icon: '🕐', badge: null   },
]
