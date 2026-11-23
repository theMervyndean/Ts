import heroHubImg from "../assets/images/hero_ts_logistics_1795419565877.webp";
import sameDayRiderImg from "../assets/images/service_sameday_rider_1795420191172.webp";
import interstateHaulageImg from "../assets/images/service_interstate_haulage_1795419548230.webp";
import warehousingHubImg from "../assets/images/service_warehousing_hub_1795419548387.webp";
import portClearingImg from "../assets/images/service_clearing_port_1795419546774.webp";
import lastMileParcelImg from "../assets/images/service_lastmile_parcel_1795420191433.webp";

export const IMAGES = {
  heroHub: heroHubImg,
  sameDayRider: sameDayRiderImg,
  interstateHaulage: interstateHaulageImg,
  warehousingHub: warehousingHubImg,
  portClearing: portClearingImg,
  lastMileParcel: lastMileParcelImg,
} as const;

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  summary: string;
  metric: string;
  corridor: string;
  image: string;
  imageAlt: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: "same-day-delivery",
    number: "01",
    title: "Same-Day Delivery",
    summary:
      "Dedicated dispatch riders and temperature-safe vans delivering documents, retail parcels, and urgent B2B stock within 4 to 6 hours.",
    metric: "4–6 hr intra-city SLA",
    corridor: "Lagos · Abuja · Port Harcourt",
    image: IMAGES.sameDayRider,
    imageAlt: "TS Logistics express courier in navy and orange gear loading sealed parcels into a delivery van in Lagos",
  },
  {
    id: "interstate-haulage",
    number: "02",
    title: "Interstate Haulage",
    summary:
      "GPS-tracked 10-ton to 30-ton box trucks and flatbed trailers operating scheduled full-truckload and consolidated routes nationwide.",
    metric: "36 states + FCT coverage",
    corridor: "Lagos ↔ Abuja · Kano · Onitsha · PH",
    image: IMAGES.interstateHaulage,
    imageAlt: "TS Logistics interstate freight trucks on a Nigerian expressway corridor",
  },
  {
    id: "warehousing",
    number: "03",
    title: "Warehousing",
    summary:
      "24/7 guarded pallet racking, barcode inventory management, and pick-and-pack staging near Ikeja Industrial Estate and Abuja Idu.",
    metric: "48,000 sq ft bonded & ambient bays",
    corridor: "Ikeja · Apapa · Idu Abuja",
    image: IMAGES.warehousingHub,
    imageAlt: "Organized pallet racking inside a modern TS Logistics fulfillment warehouse",
  },
  {
    id: "import-export-clearing",
    number: "04",
    title: "Import/Export Clearing",
    summary:
      "Licensed customs brokerage for Form M, PAAR processing, SONCAP compliance, and fast container release across Nigerian sea and air ports.",
    metric: "48–72 hr port release target",
    corridor: "Apapa · Tin Can · Onne · MMIA Cargo",
    image: IMAGES.portClearing,
    imageAlt: "West African maritime container port terminal with gantry cranes",
  },
  {
    id: "last-mile-ecommerce",
    number: "05",
    title: "Last-Mile Delivery for E-Commerce",
    summary:
      "Doorstep customer fulfillment with automated SMS/WhatsApp arrival alerts, digital proof of delivery, and 24-hour COD remittance.",
    metric: "98.6% first-attempt delivery rate",
    corridor: "Nationwide merchant fulfillment",
    image: IMAGES.lastMileParcel,
    imageAlt: "Barcoded kraft e-commerce delivery boxes staged in a last-mile dispatch tote at a customer doorstep",
  },
];

export const SERVICE_TYPE_OPTIONS = [
  "Same-Day Delivery",
  "Interstate Haulage",
  "Warehousing",
  "Import/Export Clearing",
  "Last-Mile Delivery for E-Commerce",
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Request a Quote",
    description:
      "Share your pickup point, destination, cargo weight, and preferred dispatch date. Our routing desk confirms availability within 15 minutes.",
  },
  {
    step: "02",
    title: "Confirm and Pay",
    description:
      "Review a locked-in Naira tariff with zero hidden terminal fees and settle via instant bank transfer, card, or corporate credit terms.",
  },
  {
    step: "03",
    title: "We Pick Up",
    description:
      "A verified TS Logistics rider or heavy-haul driver arrives on schedule, scans your manifest, and issues a live tracking reference.",
  },
  {
    step: "04",
    title: "Deliver and Confirm",
    description:
      "Monitor every hub checkpoint in real time until your recipient signs digitally with timestamped photo proof of delivery.",
  },
] as const;

export const TRACKING_STAGES = [
  "Order Received",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
] as const;

export type TrackingStage = (typeof TRACKING_STAGES)[number];

export interface TrackingRecord {
  trackingId: string;
  status: TrackingStage;
  origin: string;
  destination: string;
  currentHub: string;
  estimatedDelivery: string;
  updatedAt: string;
  carrierNote: string;
}

export const SAMPLE_TRACKING_RECORDS: Record<string, TrackingRecord> = {
  "TS-20261122-1042": {
    trackingId: "TS-20261122-1042",
    status: "In Transit",
    origin: "Ikeja Industrial Hub, Lagos",
    destination: "Wuse II, Abuja",
    currentHub: "Lokoja Highway Transit Checkpoint",
    estimatedDelivery: "Tomorrow, 11:30 WAT",
    updatedAt: "Today, 14:20 WAT",
    carrierNote: "Linehaul Truck #LG-409 departed Ibadan corridor on schedule.",
  },
  "TS-20261122-3891": {
    trackingId: "TS-20261122-3891",
    status: "Out for Delivery",
    origin: "Lekki Phase 1, Lagos",
    destination: "Victoria Island, Lagos",
    currentHub: "Lekki Express Dispatch Rider #R-18",
    estimatedDelivery: "Today, 16:45 WAT",
    updatedAt: "Today, 15:05 WAT",
    carrierNote: "Rider en route to recipient gate; OTP verification active.",
  },
  "TS-20261122-7720": {
    trackingId: "TS-20261122-7720",
    status: "Delivered",
    origin: "Tin Can Island Port, Lagos",
    destination: "Trans-Amadi, Port Harcourt",
    currentHub: "Port Harcourt Final Dock",
    estimatedDelivery: "Delivered · Signed by C. Nwosu",
    updatedAt: "Yesterday, 17:40 WAT",
    carrierNote: "Digital POD and customs release sheet archived.",
  },
};

export interface PricingTier {
  id: string;
  name: "Starter" | "Business" | "Enterprise";
  priceNaira: string;
  cadence: string;
  summary: string;
  features: string[];
  recommended?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    priceNaira: "₦25,000",
    cadence: "per month",
    summary: "For growing online stores and SMEs shipping regularly within city hubs.",
    features: [
      "Up to 15 same-day intra-city deliveries monthly",
      "Automated WhatsApp & SMS shipment alerts",
      "Standard goods-in-transit cover up to ₦250,000",
      "48-hour Pay-on-Delivery settlement",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceNaira: "₦120,000",
    cadence: "per month",
    summary: "Built for multi-city retailers, wholesalers, and high-volume brands.",
    recommended: true,
    features: [
      "Up to 80 deliveries + 12% off interstate haulage",
      "Dedicated dispatch coordinator & priority pickup",
      "Next-day COD bank remittance with zero holding fee",
      "Goods-in-transit cover up to ₦2,500,000",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceNaira: "₦450,000",
    cadence: "per month",
    summary: "Dedicated fleet capacity, warehouse storage, and port customs desk.",
    features: [
      "Dedicated branded vans & scheduled 15-ton haulage",
      "20 pallet bays in Ikeja or Abuja fulfillment hubs",
      "Priority Apapa, Tin Can & MMIA customs clearance",
      "Custom webhook/ERP integration & monthly invoicing",
    ],
  },
];

export const FAQ_ITEMS = [
  {
    question: "What is your cut-off time for same-day delivery in Lagos, Abuja, and Port Harcourt?",
    answer:
      "Bookings confirmed before 11:30 WAT are dispatched and delivered the same business day within 4 to 6 hours. Requests placed after 11:30 WAT are queued for our priority early-morning dispatch wave at 08:00 WAT the following day.",
  },
  {
    question: "How long does interstate haulage take between Lagos and Abuja, Kano, or Port Harcourt?",
    answer:
      "Express consolidated vans reach Abuja, Benin, and Ibadan within 24 hours. Heavy-duty 10-ton to 30-ton haulage arrives in Abuja and Port Harcourt within 24 to 48 hours, and Kano or Maiduguri corridors within 48 to 72 hours with live GPS tracking.",
  },
  {
    question: "Are shipments insured against loss or transit damage?",
    answer:
      "Yes. Every consignment includes baseline Goods-in-Transit (GIT) protection, with expandable full-value marine and inland cargo insurance available for high-value electronics, pharmaceuticals, and industrial equipment.",
  },
  {
    question: "What documents do you require for import/export clearing at Apapa, Tin Can, or MMIA?",
    answer:
      "Our licensed clearing desk handles end-to-end processing once you provide your Commercial Invoice, Packing List, Bill of Lading or Airway Bill, Form M, and PAAR/SONCAP certificates. We can also assist with pre-arrival regulatory filings.",
  },
  {
    question: "How fast do e-commerce merchants receive Cash-on-Delivery (COD) payouts?",
    answer:
      "Starter merchants receive verified bank payouts within 48 hours of delivery confirmation. Business and Enterprise accounts enjoy next-day automated settlement directly to any Nigerian commercial bank account with itemized reconciliation reports.",
  },
  {
    question: "Can I book recurring pickups or store inventory in your Lagos warehouse?",
    answer:
      "Yes. Our Ikeja and Apapa hubs offer short-term and long-term pallet storage with barcode inventory visibility. Orders received before 13:00 WAT are picked, packed, and handed directly to last-mile or interstate carriers the same afternoon.",
  },
] as const;

export const WHATSAPP_NUMBER = "2348008756447";
export const SUPPORT_PHONE_DISPLAY = "+234 800 875 6447";
export const SUPPORT_EMAIL = "dispatch@tslogistics.ng";
