import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { getWhatsAppUrl, IMAGES } from "../data/logisticsData";
import {
  BUTTON_PRIMARY_CLASSES,
  BUTTON_SECONDARY_CLASSES,
  CountUpNumber,
  usePrefersReducedMotion,
  useRippleFeedback,
} from "../lib/animations";

export const HeroSection: React.FC = () => {
  const [imgFailed, setImgFailed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const { triggerRipple, rippleElement } = useRippleFeedback();

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-navy-900 text-white border-b border-white/10"
    >
      {/* Full-Width Background Logistics Image with Deep Navy Scrim */}
      <div className="absolute inset-0 bg-navy-900">
        {!imgFailed && (
          <img
            src={IMAGES.heroHub}
            alt="TS Logistics navy and orange express cargo truck docked at our Lagos dispatch hub"
            width={1376}
            height={768}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover object-center opacity-55"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/85 to-navy-900/55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-transparent to-navy-950/40"
        />
      </div>

      {/* Subtle Animated Route-Line & Gradient Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-orange-500/15 blur-3xl animate-hero-glow"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 500"
        fill="none"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-20"
        preserveAspectRatio="none"
      >
        <path
          d="M-40 390 C 260 330, 420 140, 740 190 C 940 220, 1080 120, 1240 80"
          stroke="#F97316"
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />
        <path
          d="M-40 440 C 310 380, 520 260, 820 290 C 1010 310, 1110 230, 1240 200"
          stroke="#94A3B8"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
        <div className="max-w-3xl">
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm font-medium text-orange-400 tracking-wide mb-4"
          >
            Lagos · Abuja · Port Harcourt · Kano · International Cargo
          </motion.p>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold tracking-tight text-white leading-[1.08] mb-5 text-balance"
            style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.75rem)" }}
          >
            Fast, Reliable Delivery Across Nigeria and Beyond
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mb-8"
          >
            From 4-hour Lagos same-day dispatch and nationwide interstate haulage to bonded warehousing and Apapa port clearing, TS Logistics keeps your supply chain moving on schedule.
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
          >
            <a
              href="#quote"
              onClick={triggerRipple}
              className={`${BUTTON_PRIMARY_CLASSES} px-6 py-3.5 min-h-[48px] text-sm sm:text-base rounded-lg whitespace-nowrap shrink-0 focus-visible:ring-offset-navy-900`}
            >
              {rippleElement}
              <span>Get a Quote</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#track"
              className={`${BUTTON_SECONDARY_CLASSES} px-6 py-3.5 min-h-[48px] text-sm sm:text-base rounded-lg whitespace-nowrap shrink-0`}
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Track Shipment</span>
            </a>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5"
          >
            <a
              href={getWhatsAppUrl("Hello TS Logistics, I need a delivery quote")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white underline-offset-4 hover:underline decoration-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Need urgent dispatch? Chat on WhatsApp</span>
            </a>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Animated Count-Up Proof Strip */}
        <div className="mt-12 pt-8 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
              <CountUpNumber value={36} suffix=" States + FCT" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-snug">
              Nationwide haulage &amp; express routes
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
              <CountUpNumber value={99.2} decimals={1} suffix="%" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-snug">
              On-time intra-Lagos same-day rate
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
              <CountUpNumber value={4} />–<CountUpNumber value={6} suffix=" hrs" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-snug">
              Metropolitan express dispatch SLA
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
              <CountUpNumber value={24} suffix="/7" />
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-snug">
              Port clearing &amp; fleet control desk
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
