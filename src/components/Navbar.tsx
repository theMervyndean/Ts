import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { BUTTON_PRIMARY_CLASSES, useRippleFeedback, useScrollMetrics } from "../lib/animations";

const NAV_LINKS = [
  { label: "Services", href: "#services", id: "services" },
  { label: "Track", href: "#track", id: "track" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "FAQ", href: "#faq", id: "faq" },
  { label: "Contact", href: "#contact", id: "contact" },
] as const;

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { progress, isCompactNav, activeSection } = useScrollMetrics();
  const { triggerRipple, rippleElement } = useRippleFeedback();

  return (
    <>
      {/* Fixed Top Orange Scroll Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none"
      >
        <div
          className="h-full w-full bg-orange-500 origin-left transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ease-out border-b ${
          isCompactNav
            ? "bg-navy-900/90 backdrop-blur-md border-white/15 shadow-lg shadow-navy-950/30"
            : "bg-navy-900/95 backdrop-blur-xs border-white/10"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 transition-[height] duration-300 ease-out ${
            isCompactNav ? "h-14" : "h-[68px]"
          }`}
        >
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
          >
            TS Logistics
          </a>

          {/* Zone 2: Clean Single-Line Navigation Links (Collapses below 1024px) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm ${
                    isActive ? "text-white font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 bottom-0.5 h-0.5 bg-orange-500 rounded-full origin-left transition-transform duration-200 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action + Mobile/Tablet Menu Trigger (< 1024px) */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#quote"
              onClick={triggerRipple}
              className={`${BUTTON_PRIMARY_CLASSES} hidden sm:inline-flex px-4 py-2 min-h-[40px] text-sm rounded-lg whitespace-nowrap shrink-0 focus-visible:ring-offset-navy-900`}
            >
              {rippleElement}
              <span>Get a Quote</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition-[transform,background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Smooth Sliding Mobile Navigation Drawer (< 1024px) */}
        <div
          id="mobile-nav-drawer"
          aria-hidden={!mobileOpen}
          className={`lg:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            mobileOpen
              ? "grid-rows-[1fr] opacity-100 border-t border-white/10"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden bg-navy-900">
            <div
              className={`px-4 py-4 space-y-1 transition-transform duration-300 ease-out ${
                mobileOpen ? "translate-y-0" : "-translate-y-2"
              }`}
            >
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    tabIndex={mobileOpen ? 0 : -1}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 min-h-[44px] text-base font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-orange-500/15 text-orange-300 font-semibold"
                        : "text-slate-200 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                  </a>
                );
              })}
              <div className="pt-2">
                <a
                  href="#quote"
                  tabIndex={mobileOpen ? 0 : -1}
                  onClick={() => setMobileOpen(false)}
                  className={`${BUTTON_PRIMARY_CLASSES} w-full min-h-[46px] px-4 py-3 text-base rounded-lg focus-visible:ring-offset-navy-900`}
                >
                  Get a Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
