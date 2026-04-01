import { useState } from "react"
import { Info } from "lucide-react"
import InfoPopover from "./InfoPopover"

export default function StatCard({
  title,
  value,
  icon,

  // NEW API
  info, // { subtitle, badge, mode: "static" | "hover" | "click" }

  variant = "default", // default | success | danger | info | warning
  size = "md", // sm | md | lg

  className = "",
}) {
  const [open, setOpen] = useState(false)

  const subtitle = info?.subtitle
  const badge = info?.badge
  const mode = info?.mode ?? "static"

  const hasInfo = Boolean(subtitle || badge)
  const isHover = mode === "hover"
  const isClick = mode === "click"

  const showPopover = open && (isHover || isClick)

  // 🎨 Variants
  const variants = {
    default: {
      surface: "bg-slate-100 border-slate-200/90",
      title: "text-slate-700",
      value: "text-slate-950",
      subtitle: "text-slate-600",
      badge: "text-slate-500",
      iconWrap: "bg-white/70",
      infoButton: "bg-slate-200 hover:bg-slate-300",
      infoIcon: "text-slate-700",
    },
    success: {
      surface: "bg-emerald-50 border-emerald-200/80",
      title: "text-emerald-900/70",
      value: "text-emerald-950",
      subtitle: "text-emerald-900/70",
      badge: "text-emerald-700/70",
      iconWrap: "bg-white/70",
      infoButton: "bg-emerald-100 hover:bg-emerald-200",
      infoIcon: "text-emerald-700",
    },
    danger: {
      surface: "bg-rose-50 border-rose-200/80",
      title: "text-rose-900/70",
      value: "text-rose-950",
      subtitle: "text-rose-900/70",
      badge: "text-rose-700/70",
      iconWrap: "bg-white/70",
      infoButton: "bg-rose-100 hover:bg-rose-200",
      infoIcon: "text-rose-700",
    },
    info: {
      surface: "bg-sky-50 border-sky-200/80",
      title: "text-sky-900/70",
      value: "text-sky-950",
      subtitle: "text-sky-900/70",
      badge: "text-sky-700/70",
      iconWrap: "bg-white/70",
      infoButton: "bg-sky-100 hover:bg-sky-200",
      infoIcon: "text-sky-700",
    },
    warning: {
      surface: "bg-amber-50 border-amber-200/80",
      title: "text-amber-900/70",
      value: "text-amber-950",
      subtitle: "text-amber-900/70",
      badge: "text-amber-700/70",
      iconWrap: "bg-white/70",
      infoButton: "bg-amber-100 hover:bg-amber-200",
      infoIcon: "text-amber-700",
    },
  }
  const theme = variants[variant] ?? variants.default

  // 📏 Sizes
  const sizes = {
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-8",
  }

  return (
    <div
      className={`
        relative flex min-h-[132px] h-full flex-col sm:min-h-[156px]
        rounded-[26px] border shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]
        ${theme.surface}
        ${sizes[size]}
        ${className}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium text-sm sm:text-base ${theme.title}`}>
          {title}
        </h3>

        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconWrap}`}>
            {icon}
          </div>
        )}
      </div>

      {/* VALUE */}
      <div className="flex-1 flex items-center">
        <span className={`text-lg sm:text-3xl font-bold ${theme.value}`}>
          {value}
        </span>
      </div>

      {/* STATIC INFO (desktop) */}
      {mode === "static" && hasInfo && (
        <div className="mt-2 hidden sm:block min-h-[40px]">
          {subtitle && (
            <p className={`text-sm ${theme.subtitle}`}>{subtitle}</p>
          )}
          {badge && (
            <p className={`text-xs ${theme.badge}`}>{badge}</p>
          )}
        </div>
      )}

      {/* MOBILE INFO */}
      {showPopover && (
        <div className="absolute bottom-2 right-12 z-20 sm:hidden">
          <InfoPopover subtitle={subtitle} badge={badge} />
        </div>
      )}

      {/* POPOVER DESKTOP */}
      {showPopover && (
        <div className="absolute bottom-4 right-12 z-20 hidden transition-all duration-200 sm:block">
          <InfoPopover subtitle={subtitle} badge={badge} />
        </div>
      )}

      {/* INFO BUTTON */}
      {hasInfo && mode !== "static" && (
        <>
          {/* MOBILE */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full sm:hidden ${theme.infoButton}`}
          >
            <Info className={`h-3.5 w-3.5 ${theme.infoIcon}`} />
          </button>

          {/* DESKTOP */}
          <button
            onClick={() => isClick && setOpen((prev) => !prev)}
            onMouseEnter={() => isHover && setOpen(true)}
            onMouseLeave={() => isHover && setOpen(false)}
            className={`absolute bottom-3 right-3 hidden h-7 w-7 items-center justify-center rounded-full sm:flex ${theme.infoButton}`}
          >
            <Info className={`h-3.5 w-3.5 ${theme.infoIcon}`} />
          </button>
        </>
      )}
    </div>
  )
}
