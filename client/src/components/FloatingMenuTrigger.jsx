import React from "react";
import { Menu, Sparkles } from "lucide-react";
import { useConfig } from "../context/ConfigContext";

const FloatingMenuTrigger = ({ onOpenSidebar }) => {
  const { config } = useConfig();

  // If Admin disabled the floating trigger
  if (config?.sidebarSettings?.showFloatingTrigger === false) {
    return null;
  }

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden sm:block">
      <button
        onClick={onOpenSidebar}
        className="group flex items-center gap-2 bg-gradient-to-r from-maroon-900 via-maroon-850 to-amber-900 text-gold-200 hover:text-white px-3.5 py-3 rounded-r-2xl border-y-2 border-r-2 border-gold-400/90 shadow-2xl hover:shadow-gold-500/20 transition-all duration-300 transform hover:translate-x-1"
        title="उत्सव मेनू व विभाग उघडा (Open Festival Sidebar)"
        aria-label="Open Festival Sidebar Navigation"
      >
        <div className="relative">
          <Menu className="w-5 h-5 text-gold-300 group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </div>
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-300 group-hover:text-gold-200">
            मेनू
          </span>
          <span className="text-[9px] text-gold-100/70 font-medium">
            Menu
          </span>
        </div>
      </button>
    </div>
  );
};

export default FloatingMenuTrigger;
