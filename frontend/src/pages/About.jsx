export function About() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-10">
      <div className="text-5xl">🌿</div>
      <h1 className="text-2xl font-black text-white">Bank Sampah Amal Haqiqi</h1>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">
        Sistem pencatatan sampah real-time untuk acara Runmadhan 2026.
        Dikelola oleh Bank Sampah Amal Haqiqi.
      </p>
      <div className="mt-4 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
        Versi 1.0 · 2026
      </div>
    </div>
  )
}
