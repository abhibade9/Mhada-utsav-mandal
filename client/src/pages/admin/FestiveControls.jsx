import React from "react";
import { ChevronDown, Check, X, Sparkles } from "lucide-react";

/**
 * 1. FestiveToggle: Modern iOS-style festive switch with gold & maroon states.
 */
export const FestiveToggle = ({
  checked,
  onChange,
  label,
  sublabel,
  activeText = "सुरू (Active)",
  inactiveText = "बंद (Hidden)",
  size = "md",
  disabled = false
}) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        className={`relative flex-shrink-0 transition-all duration-300 rounded-full border-2 shadow-inner flex items-center ${
          size === "sm" ? "w-9 h-5 p-0.5" : "w-12 h-6 p-0.5"
        } ${
          checked
            ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-gold-400 shadow-gold-500/20"
            : "bg-stone-300 border-stone-400"
        }`}
      >
        <div
          className={`rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
            size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5"
          } ${
            checked
              ? size === "sm"
                ? "translate-x-4 bg-gradient-to-br from-amber-100 to-white text-maroon-900"
                : "translate-x-6 bg-gradient-to-br from-amber-100 to-white text-maroon-900"
              : "translate-x-0 text-stone-400"
          }`}
        >
          {checked ? (
            <Check className={size === "sm" ? "w-2.5 h-2.5 text-maroon-900" : "w-3 h-3 text-maroon-900 stroke-[3]"} />
          ) : (
            <X className={size === "sm" ? "w-2.5 h-2.5 text-stone-400" : "w-3 h-3 text-stone-400"} />
          )}
        </div>
      </div>

      {(label || activeText) && (
        <div className="flex flex-col min-w-0">
          {label && (
            <span className="text-xs font-bold text-maroon-950 group-hover:text-maroon-800 transition font-heading leading-snug">
              {label}
            </span>
          )}
          <span
            className={`text-[10px] font-extrabold tracking-wide whitespace-nowrap ${
              checked ? "text-amber-800" : "text-stone-500"
            }`}
          >
            {checked ? activeText : inactiveText}
          </span>
          {sublabel && <span className="text-[10px] text-stone-500 leading-tight">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};

/**
 * 2. FestiveInput: Styled text/number input with warm cream parchment background & gold focus ring.
 */
export const FestiveInput = ({
  label,
  icon: Icon,
  required,
  error,
  helperText,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-bold text-maroon-950 tracking-wide font-heading">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maroon-800 pointer-events-none flex items-center justify-center z-10">
            <Icon className="w-4 h-4 text-maroon-700/80" />
          </div>
        )}
        <input
          className={`w-full bg-[#FFFDF9] text-maroon-950 placeholder-stone-400 text-xs sm:text-sm font-semibold rounded-xl border-2 border-gold-300 hover:border-gold-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/25 outline-none transition-all shadow-xs ${
            Icon ? "pl-11" : "pl-3.5"
          } pr-3.5 py-2.5 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""} ${className}`}
          {...props}
        />
      </div>
      {helperText && !error && (
        <p className="text-[11px] text-stone-500 font-medium leading-tight">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-600 font-bold leading-tight">{error}</p>
      )}
    </div>
  );
};

/**
 * 3. FestiveSelect: Styled select box with gold chevron and matching festive borders.
 */
export const FestiveSelect = ({
  label,
  icon: Icon,
  required,
  children,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-bold text-maroon-950 tracking-wide font-heading">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maroon-800 pointer-events-none flex items-center justify-center z-10">
            <Icon className="w-4 h-4 text-maroon-700/80" />
          </div>
        )}
        <select
          className={`w-full appearance-none bg-[#FFFDF9] text-maroon-950 text-xs sm:text-sm font-bold rounded-xl border-2 border-gold-300 hover:border-gold-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/25 outline-none transition-all shadow-xs ${
            Icon ? "pl-11" : "pl-3.5"
          } pr-10 py-2.5 cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-600 pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4 text-gold-600" />
        </div>
      </div>
    </div>
  );
};

/**
 * 4. FestiveTextarea: Styled multiline text area.
 */
export const FestiveTextarea = ({
  label,
  required,
  error,
  helperText,
  rows = 3,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-bold text-maroon-950 tracking-wide font-heading">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full bg-[#FFFDF9] text-maroon-950 placeholder-stone-400 text-xs sm:text-sm font-medium rounded-xl border-2 border-gold-300 hover:border-gold-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-400/25 outline-none transition-all shadow-xs p-3 leading-relaxed ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-stone-500 font-medium leading-tight">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-600 font-bold leading-tight">{error}</p>
      )}
    </div>
  );
};

/**
 * 5. FestiveButton: Royal buttons with maroon-gold gradients, ample padding, and tactile feedback.
 */
export const FestiveButton = ({
  children,
  variant = "primary", // primary, secondary, emerald, danger, outline
  size = "md",
  icon: Icon,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold select-none transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 rounded-lg gap-1.5",
    md: "text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl gap-2",
    lg: "text-sm sm:text-base px-6 sm:px-7 py-3 rounded-2xl gap-2.5"
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-maroon-900 via-maroon-850 to-maroon-800 hover:from-maroon-850 hover:to-maroon-750 text-gold-200 border-2 border-gold-400/80 shadow-md hover:shadow-lg hover:border-gold-300",
    secondary:
      "bg-gold-200/90 hover:bg-gold-300 text-maroon-950 border-2 border-gold-400 shadow-xs",
    emerald:
      "bg-emerald-700 hover:bg-emerald-600 text-white border-2 border-emerald-500 shadow-md hover:shadow-lg",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 hover:border-rose-400 shadow-2xs",
    outline:
      "bg-white hover:bg-gold-50/80 text-maroon-900 border-2 border-gold-300 shadow-2xs hover:border-gold-400"
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === "sm" ? "w-3.5 h-3.5 flex-shrink-0" : "w-4 h-4 flex-shrink-0"} />}
      <span className="leading-none">{children}</span>
    </button>
  );
};

/**
 * 6. FestiveCard: Standardized royal card container matching website cards.
 */
export const FestiveCard = ({
  children,
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  className = ""
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-white via-[#FFFDF9] to-[#FAF5EB] rounded-3xl border-2 border-gold-300/90 shadow-md hover:shadow-lg transition-shadow overflow-hidden ${className}`}
    >
      {/* Top gold micro line */}
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

      {/* Card Header if title provided */}
      {title && (
        <div className="px-4 sm:px-7 py-3.5 sm:py-4.5 border-b border-gold-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white/70 backdrop-blur-xs">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-maroon-900 to-maroon-850 border-2 border-gold-400/70 flex items-center justify-center text-gold-300 shadow-inner flex-shrink-0">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-lg font-black text-maroon-950 font-heading leading-tight">
                  {title}
                </h3>
                {badge && (
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-gold-200/90 text-maroon-900 border border-gold-400 whitespace-nowrap flex-shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-maroon-800/80 font-medium mt-0.5 leading-relaxed">{subtitle}</p>
              )}
            </div>
          </div>

          {action && (
            <div className="w-full sm:w-auto flex-shrink-0 pt-1 sm:pt-0 flex [&>*]:w-full [&>*]:sm:w-auto">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="p-3.5 sm:p-6 md:p-7">{children}</div>
    </div>
  );
};

/**
 * 7. FestiveBadge: Styled badge component.
 */
export const FestiveBadge = ({
  children,
  variant = "gold", // gold, maroon, red, green, gray
  icon: Icon,
  className = ""
}) => {
  const variantStyles = {
    gold: "bg-gold-200/90 text-maroon-900 border-gold-400",
    maroon: "bg-maroon-800 text-gold-200 border-gold-500/40",
    red: "bg-red-600 text-white border-red-700 animate-pulse",
    green: "bg-emerald-100 text-emerald-900 border-emerald-300",
    gray: "bg-stone-100 text-stone-700 border-stone-300"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs whitespace-nowrap flex-shrink-0 ${variantStyles[variant]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
