/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BackToTopButton } from "./components/BackToTopButton";
import { BookCallSection } from "./components/BookCallSection";
import { FaqAndContactSection } from "./components/FaqAndContactSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { PricingSection } from "./components/PricingSection";
import { QuoteSection } from "./components/QuoteSection";
import { ServicesAndProcess } from "./components/ServicesAndProcess";
import { TrackShipmentSection } from "./components/TrackShipmentSection";
import { SERVICE_TYPE_OPTIONS } from "./data/logisticsData";

export default function App() {
  const [selectedService, setSelectedService] = useState<string>(SERVICE_TYPE_OPTIONS[0]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesAndProcess onSelectService={setSelectedService} />
        <TrackShipmentSection />
        <QuoteSection preselectedService={selectedService} />
        <PricingSection />
        <BookCallSection />
        <FaqAndContactSection />
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
