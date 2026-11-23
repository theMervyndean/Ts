import React from "react";
import { ArrowUp } from "lucide-react";
import { useScrollMetrics } from "../lib/animations";

export const BackToTopButton: React.FC = () => {
  const { showBackToTop } = useScrollMetrics();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={showBackToTop ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-navy-900 hover:bg-orange-500 text-white border border-white/20 shadow-lg shadow-navy-950/30 flex items-center justify-center transition-[opacity,transform,background-color] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 ${
        showBackToTop
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
