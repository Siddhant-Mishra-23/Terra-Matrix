import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path d="M4 36h32v-4H4v4ZM8 32V6h10v26H8Zm14 0V12h10v20H22ZM12 10h2v2h-2v-2Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Zm14 6h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
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
        <path d="M20 2l7 14h-4v10h-6V16h-4L20 2Z" />
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
        <circle cx="20" cy="20" r="18" opacity="0.5" />
        <path d="M12 22l5-6 4 4 7-8 2 2-9 10-4-4-3 4Z" />
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
        <circle cx="20" cy="20" r="16" opacity="0.4" />
        <path d="M4 20h32M20 4c4 5 4 27 0 32M20 4c-4 5-4 27 0 32" />
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
        <rect x="10" y="10" width="20" height="20" rx="2" />
        <path
          opacity="0.5"
          d="M4 18h6v4H4v-4Zm26 0h6v4h-6v-4ZM18 4h4v6h-4V4Zm0 26h4v6h-4v-6Z"
        />
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
        <rect x="10" y="12" width="20" height="18" rx="3" />
        <circle cx="16" cy="20" r="2" />
        <circle cx="24" cy="20" r="2" />
        <path d="M18 26h4M20 6v6" opacity="0.5" />
      </svg>
    ),
    title: "Advanced Technology & Innovation",
    paragraph:
      "BIM implementation, earthquake-resistant design and retrofitting, climate resilience and sustainable design consulting, patent development, and technology transfer support.",
  },
];

export default featuresData;
