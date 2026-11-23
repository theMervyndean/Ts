import React from "react";
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Twitter } from "lucide-react";
import { getWhatsAppUrl, SUPPORT_EMAIL } from "../data/logisticsData";

export const Footer: React.FC = () => {
  const whatsappHref = getWhatsAppUrl("Hello TS Logistics, I need a delivery quote");

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Company Info */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="#top"
              className="text-xl font-bold tracking-tight text-white inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
            >
              TS Logistics
            </a>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Trusted Nigerian express delivery, interstate haulage, bonded warehousing, and import/export clearing connecting businesses across all 36 states and international trade corridors.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Plot 14, Oba Akran Avenue, Ikeja, Lagos, Nigeria</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-mono">{SUPPORT_EMAIL}</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
              {[
                { label: "Services", href: "#services" },
                { label: "Track Shipment", href: "#track" },
                { label: "Get a Quote", href: "#quote" },
                { label: "Pricing", href: "#pricing" },
                { label: "Book a Call", href: "#book-call" },
                { label: "FAQ", href: "#faq" },
                { label: "Contact Support", href: "#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center min-h-[36px] hover:text-white hover:underline underline-offset-4 decoration-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Direct Channels */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-semibold text-white">Connect With Us</h3>
            <div className="flex items-center gap-3">
              {[
                { href: "https://linkedin.com", label: "TS Logistics on LinkedIn", Icon: Linkedin },
                { href: "https://x.com", label: "TS Logistics on X", Icon: Twitter },
                { href: "https://instagram.com", label: "TS Logistics on Instagram", Icon: Instagram },
                { href: whatsappHref, label: "TS Logistics on WhatsApp", Icon: MessageCircle },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-lg bg-navy-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-orange-500 hover:-translate-y-0.5 transition-[transform,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Operations hours: Mon–Sat · 08:00 – 18:00 WAT (UTC+1)
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TS Logistics Nigeria Ltd. All rights reserved.</p>
          <p>RC 1849204 · Lagos · Abuja · Port Harcourt</p>
        </div>
      </div>
    </footer>
  );
};
