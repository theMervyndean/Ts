import React, { useState } from "react";
import { ChevronDown, Loader2, MessageCircle, Send } from "lucide-react";
import {
  FAQ_ITEMS,
  getWhatsAppUrl,
  SUPPORT_EMAIL,
} from "../data/logisticsData";
import { BUTTON_PRIMARY_CLASSES, Reveal, useRippleFeedback } from "../lib/animations";
import { validateEmail } from "../lib/validation";
import { isWebhookConfigured, sendToWebhook } from "../lib/webhook";
import { EmailInput } from "./EmailInput";
import { HoneypotField } from "./HoneypotField";

interface ChatMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  referenceId?: string;
  timestamp: string;
}

function getFriendlyFallbackReply(question: string): string {
  const lower = question.toLowerCase();
  if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("much")) {
    return "Intra-Lagos same-day deliveries start from ₦3,500 depending on zone and weight. Interstate haulage and monthly plans are listed above, or you can use our Get a Quote form for an exact Naira tariff.";
  }
  if (lower.includes("track") || lower.includes("where") || lower.includes("parcel")) {
    return "You can check real-time hub milestones anytime in our Track Shipment section using your TS-YYYYMMDD-XXXX waybill number.";
  }
  if (lower.includes("port") || lower.includes("clear") || lower.includes("custom") || lower.includes("apapa")) {
    return "Our Apapa, Tin Can, and MMIA customs desk handles Form M, PAAR, and SONCAP clearance within 48–72 hours. Share your Bill of Lading details in the Quote form or message us on WhatsApp.";
  }
  return "Thanks for reaching out to TS Logistics Support. A Lagos dispatch coordinator has logged your message and can assist immediately via WhatsApp.";
}

export const FaqAndContactSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [email, setEmail] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submittedAttempt, setSubmittedAttempt] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "support",
      text: "Hello! Welcome to TS Logistics Nigeria. Ask about same-day Lagos pickup, interstate haulage rates, or customs clearing.",
      timestamp: "Dispatch Desk · WAT",
    },
  ]);
  const { triggerRipple, rippleElement } = useRippleFeedback();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim() !== "") return;

    setSubmittedAttempt(true);
    const emailResult = validateEmail(email);
    const trimmed = chatInput.trim();
    const messageInvalid = trimmed.length < 2;

    if (!emailResult.valid || messageInvalid) {
      if (messageInvalid) {
        setChatError("Please enter a short question before sending.");
      } else {
        setChatError(null);
      }
      setShakeCount((c) => c + 1);
      const firstInvalidId = !emailResult.valid ? "support-email" : "support-chat-input";
      const firstEl = document.getElementById(firstInvalidId);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: "smooth", block: "center" });
        firstEl.focus({ preventScroll: true });
      }
      return;
    }

    setChatError(null);
    const userMsgId = `u-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: trimmed,
        timestamp: "Just now",
      },
    ]);
    setChatInput("");
    setSending(true);

    try {
      const response = await sendToWebhook("support_message", {
        message: trimmed,
        email: email.trim(),
      });

      const serverReply =
        typeof response.reply === "string" && response.reply.trim()
          ? response.reply.trim()
          : null;

      const replyText =
        !response.testMode && isWebhookConfigured() && serverReply
          ? serverReply
          : getFriendlyFallbackReply(trimmed);

      setMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          sender: "support",
          text: replyText,
          referenceId: response.referenceId,
          timestamp: "Support Reply",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          sender: "support",
          text: getFriendlyFallbackReply(trimmed),
          timestamp: "Support Reply (Offline Fallback)",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const whatsappHref = getWhatsAppUrl("Hello TS Logistics, I have a question");

  return (
    <>
      {/* Smooth Height-Transition FAQ Accordion */}
      <section
        id="faq"
        className="scroll-mt-20 py-14 sm:py-16 lg:py-24 bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10">
              <p className="text-sm font-semibold text-orange-600 mb-2">Frequently Asked Questions</p>
              <h2
                className="font-bold tracking-tight text-navy-900 text-balance leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
              >
                Clear answers on cut-off times, insurance, and customs
              </h2>
            </div>
          </Reveal>

          <Reveal delayMs={80}>
            <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-xl overflow-hidden">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="cursor-pointer w-full min-h-[56px] px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
                    >
                      <span className="text-sm sm:text-base font-semibold text-navy-900">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ease-out ${
                          isOpen ? "rotate-180 text-orange-600" : "rotate-0"
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 leading-relaxed">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact / Support Chat Box */}
      <section id="contact" className="scroll-mt-20 py-14 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Support Info & WhatsApp CTA */}
            <Reveal className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-sm font-semibold text-orange-600 mb-2">Contact &amp; Support</p>
                <h2
                  className="font-bold tracking-tight text-navy-900 text-balance leading-tight"
                  style={{ fontSize: "clamp(1.75rem, 3vw, 2.35rem)" }}
                >
                  Speak directly with our Nigerian operations team
                </h2>
                <p className="mt-3 text-base text-slate-600 leading-relaxed">
                  Send a quick question in the support chat box for an immediate response, or open a direct thread with our Lagos dispatchers on WhatsApp.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Head Office &amp; Hub</span>
                  <span className="font-medium text-navy-900">
                    Plot 14, Oba Akran Avenue, Ikeja Industrial Estate, Lagos
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Apapa Clearing Desk</span>
                  <span className="font-medium text-navy-900">
                    22 Wharf Road, Apapa, Lagos State
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Email</span>
                    <span className="font-mono font-semibold text-navy-900">{SUPPORT_EMAIL}</span>
                  </div>
                </div>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] rounded-lg bg-[#128C7E] hover:bg-[#0e7367] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] text-white font-semibold text-sm sm:text-base transition-[transform,background-color,box-shadow] duration-200 ease-out whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>
            </Reveal>

            {/* Right Interactive Chat Box */}
            <Reveal delayMs={80} className="lg:col-span-7">
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">TS Logistics Support Desk</h3>
                    <p className="text-xs text-slate-300">Instant route, pricing &amp; tracking help</p>
                  </div>
                  <span className="text-xs font-mono text-orange-400">WAT (UTC+1)</span>
                </div>

                <div
                  aria-live="polite"
                  className="p-4 sm:p-5 space-y-4 h-72 sm:h-80 overflow-y-auto bg-white border-b border-slate-200"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-navy-900 text-white"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.referenceId && (
                          <p className="mt-1.5 text-[11px] font-mono text-slate-500 tabular-nums">
                            Ref: {msg.referenceId}
                          </p>
                        )}
                      </div>
                      <span className="mt-1 text-[11px] text-slate-400 px-1">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} noValidate className="p-4 bg-slate-50 space-y-3">
                  <HoneypotField id="support-hp" value={honeypot} onChange={setHoneypot} />

                  <EmailInput
                    id="support-email"
                    label={
                      <>
                        Your Email <span className="text-orange-600">*</span>
                      </>
                    }
                    value={email}
                    onChange={setEmail}
                    placeholder="you@company.com"
                    forceShowError={submittedAttempt}
                    shakeKey={shakeCount}
                  />

                  <div
                    key={chatError ? `chat-${shakeCount}` : "chat"}
                    className={`flex gap-2.5 ${chatError ? "animate-shake" : ""}`}
                  >
                    <label htmlFor="support-chat-input" className="sr-only">
                      Type your logistics question
                    </label>
                    <input
                      id="support-chat-input"
                      type="text"
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value);
                        if (chatError) setChatError(null);
                      }}
                      placeholder="Ask about Lagos delivery rates, Abuja transit, or clearing..."
                      className={`flex-1 min-w-0 h-11 min-h-[44px] px-3.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 ${
                        chatError ? "border-red-400" : "border-slate-300"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      onClick={triggerRipple}
                      className={`${BUTTON_PRIMARY_CLASSES} h-11 min-h-[44px] px-5 text-sm rounded-lg whitespace-nowrap shrink-0`}
                    >
                      {rippleElement}
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>

                  {chatError && (
                    <p role="alert" className="text-xs text-red-600">
                      {chatError}
                    </p>
                  )}
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
};
