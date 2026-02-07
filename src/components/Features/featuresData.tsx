import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        {/* Building/Infrastructure Icon */}
        <path d="M8 36V12l12-8 12 8v24H8z" opacity="0.3" />
        <path d="M20 4l14 9.33V38H6V13.33L20 4zm0 4L10 13.33V34h20V13.33L20 8z" />
        <rect x="14" y="16" width="4" height="4" />
        <rect x="22" y="16" width="4" height="4" />
        <rect x="14" y="24" width="4" height="4" />
        <rect x="22" y="24" width="4" height="4" />
        <path d="M17 30h6v8h-6z" />
      </svg>
    ),
    title: "Civil & Infrastructure Engineering",
    paragraph:
      "Structural design and analysis (RCC, steel, composite), geotechnical investigation, foundation design, and infrastructure planning for roads, bridges, water supply, and drainage systems.",
  },
  {
    id: 2,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        {/* Construction/Crane Icon */}
        <path d="M6 36V8l4-4h4l-4 4v28H6z" opacity="0.3" />
        <path d="M10 4l4 4v28H6V8l4-4zm0 4L8 10v24h4V10l-2-2z" />
        <path d="M14 10h20l-6 6H14v-6z" opacity="0.5" />
        <path d="M14 8h22l-8 8H14V8zm2 2v4h12l4-4H16z" />
        <rect x="26" y="16" width="4" height="20" />
        <path d="M24 20h8v4h-8z" opacity="0.3" />
        <circle cx="28" cy="32" r="4" opacity="0.5" />
      </svg>
    ),
    title: "Construction Management & Estimation",
    paragraph:
      "Comprehensive project estimation, costing, valuation, construction management, supervision, and execution support to ensure quality, efficiency, and cost control.",
  },
  {
    id: 3,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        {/* AI Brain/Neural Network Icon */}
        <circle cx="20" cy="20" r="16" opacity="0.2" />
        <circle cx="20" cy="12" r="3" />
        <circle cx="12" cy="20" r="3" />
        <circle cx="28" cy="20" r="3" />
        <circle cx="14" cy="28" r="3" />
        <circle cx="26" cy="28" r="3" />
        <circle cx="20" cy="20" r="4" />
        <path d="M20 15v2M17 18l-2 1M23 18l2 1M16 25l-1-1M24 25l1-1" strokeWidth="1.5" stroke="currentColor" opacity="0.6" />
        <path d="M20 8V4M32 20h4M8 20H4M10 10L6 6M30 10l4-4M10 30l-4 4M30 30l4 4" strokeWidth="2" stroke="currentColor" opacity="0.4" />
      </svg>
    ),
    title: "AI / ML & Data Analytics",
    paragraph:
      "Predictive maintenance for infrastructure, flood forecasting, rainfall-runoff modeling, time-series forecasting, and custom AI solutions for urban planning and disaster management.",
  },
  {
    id: 4,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        {/* Satellite/Globe Icon */}
        <circle cx="20" cy="20" r="14" opacity="0.2" />
        <ellipse cx="20" cy="20" rx="14" ry="6" opacity="0.3" />
        <ellipse cx="20" cy="20" rx="6" ry="14" opacity="0.3" />
        <path d="M6 20c0-1.5 6.3-3 14-3s14 1.5 14 3-6.3 3-14 3-14-1.5-14-3z" />
        <circle cx="20" cy="20" r="3" />
        <path d="M32 8l4-4M34 10l2-2M30 6l2-2" strokeWidth="2" stroke="currentColor" opacity="0.6" />
        <rect x="32" y="4" width="6" height="4" rx="1" opacity="0.5" />
      </svg>
    ),
    title: "Remote Sensing & Geospatial Services",
    paragraph:
      "Land-use/land-cover mapping, change detection, river basin delineation, flood inundation mapping, GIS-based asset management, DEM generation, and NDVI/NDWI analysis.",
  },
  {
    id: 5,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        {/* IoT/Connected Devices Icon */}
        <rect x="14" y="14" width="12" height="12" rx="2" />
        <circle cx="20" cy="20" r="3" opacity="0.5" />
        <path d="M10 20H6M30 20h4M20 10V6M20 30v4" strokeWidth="2" stroke="currentColor" />
        <circle cx="6" cy="20" r="2" />
        <circle cx="34" cy="20" r="2" />
        <circle cx="20" cy="6" r="2" />
        <circle cx="20" cy="34" r="2" />
        <path d="M12 12L8 8M28 12l4-4M12 28l-4 4M28 28l4 4" strokeWidth="1.5" stroke="currentColor" opacity="0.4" />
        <circle cx="8" cy="8" r="2" opacity="0.5" />
        <circle cx="32" cy="8" r="2" opacity="0.5" />
        <circle cx="8" cy="32" r="2" opacity="0.5" />
        <circle cx="32" cy="32" r="2" opacity="0.5" />
      </svg>
    ),
    title: "Smart Systems & IoT Solutions",
    paragraph:
      "IoT-enabled monitoring systems for structures and water quality, smart irrigation solutions, real-time sensing, and intelligent infrastructure health monitoring.",
  },
  {
    id: 6,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        {/* Innovation/Lightbulb + Gear Icon */}
        <path d="M20 4c-6 0-10 4.5-10 10 0 4 2 7 5 9v5h10v-5c3-2 5-5 5-9 0-5.5-4-10-10-10z" opacity="0.3" />
        <path d="M20 6c5 0 8 3.5 8 8 0 3.5-2 6-4 7.5V26h-8v-4.5c-2-1.5-4-4-4-7.5 0-4.5 3-8 8-8z" />
        <rect x="14" y="28" width="12" height="2" rx="1" />
        <rect x="16" y="32" width="8" height="2" rx="1" />
        <circle cx="20" cy="14" r="2" opacity="0.6" />
        <path d="M20 16v4" strokeWidth="2" stroke="currentColor" opacity="0.6" />
        <path d="M32 20l4 2-4 2v-4zM36 20h-4" strokeWidth="1.5" stroke="currentColor" opacity="0.4" />
        <circle cx="34" cy="14" r="3" opacity="0.3" />
        <path d="M33 12l2 2M33 16l2-2" strokeWidth="1" stroke="currentColor" opacity="0.5" />
      </svg>
    ),
    title: "Advanced Technology & Innovation",
    paragraph:
      "BIM implementation, earthquake-resistant design and retrofitting, climate resilience and sustainable design consulting, patent development, and technology transfer support.",
  },
];

export default featuresData;
