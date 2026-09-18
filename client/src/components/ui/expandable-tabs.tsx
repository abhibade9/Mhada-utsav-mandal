"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronDown } from "lucide-react";

export interface DropdownItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
}

export interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
  id?: string;
  activeColor?: string;
  iconColor?: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

export interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
  id?: string;
}

export type TabItem = Tab | Separator;

export interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-gold-200",
  onChange,
}: ExpandableTabsProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = (index: number, tab: Tab) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(index);
    if (tab.hasDropdown && tab.dropdownItems && tab.dropdownItems.length > 0) {
      setOpenDropdown(index);
    }
  };

  const handleMouseLeave = () => {
    setHovered(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 250);
  };

  const handleTabClick = (tab: Tab, index: number) => {
    if (tab.hasDropdown && tab.dropdownItems && tab.dropdownItems.length > 0) {
      setOpenDropdown((prev) => (prev === index ? null : index));
    }
    if (tab.onClick) {
      tab.onClick();
    }
    onChange?.(index);
  };

  return (
    <div
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex items-center gap-1 sm:gap-1.5 rounded-full border border-gold-500/40 bg-maroon-950/95 p-1 shadow-xl backdrop-blur-md",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return (
            <div
              key={`separator-${index}`}
              className="mx-1 h-[22px] w-[1px] bg-gold-500/40"
              aria-hidden="true"
            />
          );
        }

        const Icon = tab.icon;
        const isHovered = hovered === index;
        const isActive = tab.isActive;
        const isDropdownOpen = openDropdown === index;

        return (
          <div key={tab.id || tab.title || index} className="relative">
            <button
              type="button"
              onMouseEnter={() => handleMouseEnter(index, tab)}
              onClick={() => handleTabClick(tab, index)}
              className={cn(
                "relative flex items-center rounded-full px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer outline-none select-none",
                isHovered || isDropdownOpen
                  ? "bg-gradient-to-r from-amber-900/90 to-maroon-800 text-gold-200 shadow-md border border-gold-400/60"
                  : isActive
                  ? "bg-maroon-900/80 text-gold-200 border border-gold-500/30"
                  : "text-gold-300/80 hover:bg-maroon-900/60 hover:text-gold-100 border border-transparent",
                tab.className
              )}
              title={tab.title}
              aria-label={tab.title}
              aria-expanded={isDropdownOpen}
              aria-haspopup={tab.hasDropdown ? "true" : undefined}
            >
              <Icon
                size={18}
                className={cn("flex-shrink-0 transition-colors", tab.iconColor || "text-gold-300")}
              />
              <AnimatePresence initial={false}>
                {(isHovered || isDropdownOpen) && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: "inline-block" }}
                    className="overflow-hidden whitespace-nowrap font-bold text-xs sm:text-sm pl-1.5 text-gold-200 tracking-wide flex items-center gap-1"
                  >
                    <span>{tab.title}</span>
                    {tab.hasDropdown && (
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform duration-200 text-gold-400",
                          isDropdownOpen ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !isHovered && !isDropdownOpen && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
              )}
            </button>

            {/* Dropdown Menu */}
            {tab.hasDropdown && tab.dropdownItems && isDropdownOpen && (
              <div
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-80 sm:w-96 bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950 border-2 border-gold-400/90 rounded-2xl shadow-2xl backdrop-blur-md p-2.5 z-50 animate-fadeIn"
              >
                {/* Micro Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-maroon-950 border-t-2 border-l-2 border-gold-400/90" />

                <div className="relative z-10 space-y-1.5">
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gold-400/80 border-b border-gold-500/20 flex items-center justify-between">
                    <span>वेळापत्रक व कार्यक्रम पर्याय</span>
                    <span className="text-[9px] text-gold-300/70 font-semibold">(पॉप-अप खिडकी)</span>
                  </div>

                  {tab.dropdownItems.map((item) => {
                    const ItemIcon = item.icon || Icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(null);
                          item.onClick();
                        }}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-maroon-800/90 text-left transition border border-transparent hover:border-gold-500/40 group"
                      >
                        <div className="p-2.5 rounded-xl bg-maroon-850 text-gold-300 group-hover:bg-gold-400 group-hover:text-maroon-950 transition-colors flex-shrink-0 mt-0.5 border border-gold-500/30 shadow-2xs">
                          <ItemIcon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs sm:text-sm text-gold-200 group-hover:text-gold-100 font-heading">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span
                                className={cn(
                                  "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 shadow-xs",
                                  item.badgeColor || "bg-gold-400 text-maroon-950"
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-gold-200/70 group-hover:text-gold-100/90 font-medium line-clamp-1 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ExpandableTabs;
