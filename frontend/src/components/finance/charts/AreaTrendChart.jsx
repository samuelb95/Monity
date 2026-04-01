function getPointCoordinates(values, width, height, padding) {
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  return values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return [x, y];
  });
}

function buildLinePath(points) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function buildAreaPath(points, width, height, padding) {
  if (!points.length) return '';
  const linePath = buildLinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${linePath} L ${lastPoint[0]} ${height - padding} L ${firstPoint[0]} ${height - padding} Z`;
}

export function AreaTrendChart({ series, accent = '#0ea5e9', className = '' }) {
  const width = 640;
  const height = 260;
  const padding = 28;
  const values = series.map((item) => item.availableBalance);
  const points = getPointCoordinates(values, width, height, padding);
  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, width, height, padding);

  return (
    <div className={`w-full ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="monity-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.2, 0.45, 0.7].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={padding + (height - padding * 2) * ratio}
            y2={padding + (height - padding * 2) * ratio}
            stroke="rgba(148, 163, 184, 0.22)"
            strokeDasharray="5 5"
          />
        ))}

        <path d={areaPath} fill="url(#monity-area-fill)" />
        <path d={linePath} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />

        {points.map(([x, y], index) => (
          <g key={series[index].label}>
            <circle cx={x} cy={y} r="6" fill="white" stroke={accent} strokeWidth="3" />
          </g>
        ))}
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {series.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(item.availableBalance)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
