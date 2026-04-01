export function AllocationChart({ rows }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Réel</p>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          {rows.map((row) => (
            <div
              key={`actual-${row.key}`}
              style={{ width: `${Math.max(row.actualRatio, 0)}%`, backgroundColor: row.color }}
              title={`${row.label}: ${row.actualRatio.toFixed(0)}%`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cible</p>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          {rows.map((row) => (
            <div
              key={`target-${row.key}`}
              style={{ width: `${Math.max(row.targetValue, 0)}%`, backgroundColor: row.color }}
              title={`${row.label}: ${row.targetValue}%`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color }} />
            <div>
              <p className="text-sm font-semibold text-slate-900">{row.label}</p>
              <p className="text-xs text-slate-500">
                {row.actualRatio.toFixed(0)}% réel vs {row.targetValue}% cible
              </p>
            </div>
            <p className={`text-xs font-semibold ${row.delta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {row.delta > 0 ? '+' : ''}
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(row.delta)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
