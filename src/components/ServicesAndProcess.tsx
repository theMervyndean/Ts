import React, { useState } from "react";
import { ArrowUpRight, Bike, Boxes, Package, Ship, Truck } from "lucide-react";
import { HOW_IT_WORKS_STEPS, SERVICES, type ServiceItem } from "../data/logisticsData";
import { Reveal, useInViewOnce } from "../lib/animations";

interface ServicesAndProcessProps {
  onSelectService: (serviceTitle: string) => void;
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "same-day-delivery": Bike,
  "interstate-haulage": Truck,
  warehousing: Boxes,
  "import-export-clearing": Ship,
  "last-mile-ecommerce": Package,
};

const ServiceMedia: React.FC<{ service: ServiceItem }> = ({ service }) => {
  const [failed, setFailed] = useState(false);
  const Icon = SERVICE_ICONS[service.id] || Package;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-navy-900 border border-slate-200 mb-5">
      {!failed ? (
        <img
          src={service.image}
          alt={service.imageAlt}
          width={960}
          height={717}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-navy-900 text-white">
          <Icon className="w-8 h-8 text-orange-400 mb-2" />
          <span className="text-sm font-medium">{service.title}</span>
        </div>
      )}
    </div>
  );
};

export const ServicesAndProcess: React.FC<ServicesAndProcessProps> = ({ onSelectService }) => {
  const { ref: stepsRef, inView: stepsInView } = useInViewOnce(0.2);

  const handleChooseService = (serviceTitle: string) => {
    onSelectService(serviceTitle);
    const quoteEl = document.getElementById("quote");
    if (quoteEl) {
      quoteEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Services Grid: 1 col mobile, 2 cols tablet, 3-col rhythm desktop */}
      <section
        id="services"
        className="scroll-mt-20 py-14 sm:py-16 lg:py-24 bg-white border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl mb-10 sm:mb-12">
              <p className="text-sm font-semibold text-orange-600 mb-2">Core Logistics Capabilities</p>
              <h2
                className="font-bold tracking-tight text-navy-900 text-balance leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
              >
                Freight, fulfillment, and customs services built for Nigerian trade
              </h2>
              <p className="mt-3 text-base text-slate-600 leading-relaxed">
                Every service operates on verified transit schedules, live hub scanning, and transparent Naira billing.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = SERVICE_ICONS[service.id] || Package;
              const spanClass =
                index < 2
                  ? "md:col-span-1 lg:col-span-3"
                  : index === 4
                    ? "md:col-span-2 lg:col-span-2"
                    : "md:col-span-1 lg:col-span-2";

              return (
                <Reveal key={service.id} delayMs={index * 80} className={`${spanClass} flex`}>
                  <article
                    onClick={() => handleChooseService(service.title)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleChooseService(service.title);
                      }
                    }}
                    className="group cursor-pointer w-full flex flex-col justify-between bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-[0_14px_30px_-12px_rgba(249,115,22,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <div>
                      <ServiceMedia service={service} />

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono tabular-nums text-orange-600 font-semibold">
                            {service.number}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{service.corridor}</span>
                        </div>
                        <Icon className="w-4 h-4 text-navy-800 group-hover:text-orange-600 transition-colors shrink-0" />
                      </div>

                      <h3 className="text-xl font-bold text-navy-900 tracking-tight mb-2.5">
                        {service.title}
                      </h3>

                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
                        {service.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                      <span className="text-xs font-mono tabular-nums font-medium text-slate-700">
                        {service.metric}
                      </span>

                      <span className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-navy-900 group-hover:text-orange-600 transition-colors whitespace-nowrap shrink-0">
                        <span>Quote this service</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps with animated connecting line) */}
      <section
        aria-labelledby="how-it-works-heading"
        className="py-14 sm:py-16 lg:py-20 bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-orange-600 mb-2">How It Works</p>
                <h2
                  id="how-it-works-heading"
                  className="font-bold tracking-tight text-navy-900 text-balance leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
                >
                  Four predictable steps from booking to proof of delivery
                </h2>
              </div>
              <p className="text-sm text-slate-600 max-w-sm">
                Zero guesswork at dispatch or destination. Every handover is logged with a timestamp and reference ID.
              </p>
            </div>
          </Reveal>

          <div ref={stepsRef} className="relative">
            {/* Animated horizontal connecting line across the 4 steps on desktop */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-[2px] bg-slate-200 overflow-hidden pointer-events-none"
            >
              <div
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                className={`h-full w-full bg-orange-500 origin-left transition-transform duration-600 ${
                  stepsInView ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </div>

            <ol className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS_STEPS.map((item, idx) => (
                <Reveal key={item.step} delayMs={idx * 80} className="flex">
                  <li className="w-full bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-orange-500/40 hover:shadow-md">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-navy-900 text-white font-mono tabular-nums text-sm font-bold">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
};
