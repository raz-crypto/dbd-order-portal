export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid place-items-center rounded-2xl shadow-sm ring-1 ring-white/40"
        style={{ width: size, height: size }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900">
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-[70%] w-[70%] rounded-full bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 shadow-inner" />
            <div className="absolute h-[32%] w-[32%] rounded-full bg-slate-900/90" />
          </div>
          <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-white/20 blur-md" />
        </div>
      </div>

      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          Doughboy Depot
        </div>
        <div className="text-xs text-slate-600">Order Placement Portal</div>
      </div>
    </div>
  );
}
