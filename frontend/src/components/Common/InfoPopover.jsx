import React from "react"

export default function InfoPopover({ subtitle, badge }) {
  if (!subtitle && !badge) return null

  return (
    <div className="max-w-[220px] rounded-2xl border border-slate-200 bg-white/95 px-3.5 py-3 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] backdrop-blur-md">
      {subtitle && (
        <p className="text-sm text-slate-700 whitespace-normal">
          {subtitle}
        </p>
      )}
      {badge && (
        <p className="text-xs text-slate-500 whitespace-normal mt-1">
          {badge}
        </p>
      )}
    </div>
  )
}
