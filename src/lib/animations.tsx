import React, { useEffect, useRef, useState } from "react";

export const TRACKED_SECTIONS = [
  "services",
  "track",
  "quote",
  "pricing",
  "book-call",
  "faq",
  "contact",
] as const;

export type TrackedSectionId = (typeof TRACKED_SECTIONS)[number];

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useScrollMetrics() {
  const [progress, setProgress] = useState(0);
  const [isCompactNav, setIsCompactNav] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const nextProgress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

      setProgress(nextProgress);
      setIsCompactNav(scrollTop > 420);
      setShowBackToTop(scrollTop > 520);

      // Determine active section based on viewport anchor point
      const viewportProbe = scrollTop + 140;
      let current = "";
      for (const id of TRACKED_SECTIONS) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (viewportProbe >= top && viewportProbe < bottom) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { progress, isCompactNav, showBackToTop, activeSection };
}

export function useInViewOnce(threshold = 0.14) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setInView(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, reducedMotion]);

  return { ref, inView: inView || reducedMotion };
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = "",
  delayMs = 0,
}) => {
  const { ref, inView } = useInViewOnce(0.12);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: inView ? `${delayMs}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`transition-[opacity,transform] duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface CountUpNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 580,
}) => {
  const { ref, inView } = useInViewOnce(0.2);
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState<number>(reducedMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [inView, value, durationMs, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

interface RippleState {
  key: number;
  x: number;
  y: number;
  size: number;
}

export function useRippleFeedback() {
  const [ripple, setRipple] = useState<RippleState | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const triggerRipple = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX ? e.clientX - rect.left - size / 2 : rect.width / 2 - size / 2;
    const y = e.clientY ? e.clientY - rect.top - size / 2 : rect.height / 2 - size / 2;
    setRipple({ key: Date.now(), x, y, size });
  };

  const rippleElement = ripple ? (
    <span
      key={ripple.key}
      aria-hidden="true"
      onAnimationEnd={() => setRipple(null)}
      style={{
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        height: ripple.size,
      }}
      className="pointer-events-none absolute rounded-full bg-white/35 animate-ripple"
    />
  ) : null;

  return { triggerRipple, rippleElement };
}

export const BUTTON_PRIMARY_CLASSES =
  "relative overflow-hidden cursor-pointer inline-flex items-center justify-center gap-2 font-semibold text-white bg-orange-500 hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-[transform,background-color,box-shadow,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2";

export const BUTTON_SECONDARY_CLASSES =
  "cursor-pointer inline-flex items-center justify-center gap-2 font-semibold text-white bg-navy-800 hover:bg-navy-700 border border-white/20 hover:border-orange-400/60 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-[transform,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900";
