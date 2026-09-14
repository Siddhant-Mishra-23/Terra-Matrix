import { Training } from "@/types/training";

export const upcomingTrainings: Training[] = [
  {
    id: 1,
    title: "Advanced GIS & Remote Sensing for Infrastructure Planning",
    description:
      "A comprehensive, hands-on workshop covering spatial data modeling, satellite imagery analysis, raster analytics, and urban infrastructure mapping with QGIS & ArcGIS.",
    category: "Geospatial Intelligence",
    date: "Upcoming (Batch Starting Soon)",
    duration: "4 Weeks (Weekend Sessions)",
    mode: "Hybrid",
    status: "upcoming",
    image: "/images/about/geospatial.svg",
    highlights: [
      "Satellite Imagery Processing & LULC Analysis",
      "Digital Elevation Models (DEM) & Topography",
      "Spatial Network & Route Optimization",
      "Industry-standard Certificate of Completion",
    ],
    link: "/contact",
  },
  {
    id: 2,
    title: "AI & Machine Learning for Hydrological & Groundwater Modeling",
    description:
      "Learn predictive machine learning techniques applied to hydrological datasets, flood inundation mapping, and groundwater level forecasting.",
    category: "AI & Data Science",
    date: "Upcoming (Registrations Open)",
    duration: "3 Weeks (Live Interactive)",
    mode: "Online",
    status: "upcoming",
    image: "/images/about/ai-analytics.svg",
    highlights: [
      "Python for Spatial Data & Hydrology",
      "Time-Series Forecasting with Machine Learning",
      "Groundwater Flow Simulation Integration",
      "Real-World Watershed Case Studies",
    ],
    link: "/contact",
  },
  {
    id: 3,
    title: "Drone Photogrammetry & LiDAR Point Cloud Processing",
    description:
      "Practical training on UAV flight planning, RTK/PPK GNSS processing, orthomosaic creation, and high-density 3D LiDAR point cloud classification.",
    category: "Surveying & UAV",
    date: "Upcoming (Limited Seats)",
    duration: "2 Weeks (Intensive)",
    mode: "In-Person",
    status: "upcoming",
    image: "/images/about/innovation.svg",
    highlights: [
      "Flight Planning & Ground Control Points (GCPs)",
      "Orthomosaic & Contour Generation",
      "LiDAR Feature Extraction & Volumetric Analysis",
      "Field Demo & Software Walkthrough",
    ],
    link: "/contact",
  },
];

export const completedTrainings: Training[] = [
  {
    id: 4,
    title: "Mastering Civil 3D for Highway & Geometric Road Design",
    description:
      "Industry-oriented training on alignment creation, profile design, corridor modeling, cross-sections, and quantity estimation following IRC guidelines.",
    category: "Civil Engineering",
    date: "Completed (November 2025)",
    duration: "4 Weeks",
    mode: "Online",
    status: "completed",
    image: "/images/about/civil-infra.svg",
    highlights: [
      "Horizontal & Vertical Alignment Design",
      "Corridor Modeling & Earthwork Quantities",
      "Intersection & Roundabout Layouts",
      "IRC Standards & DPR Documentation",
    ],
    attendees: "65+ Engineers & Students Trained",
    link: "/contact",
  },
  {
    id: 5,
    title: "Introduction to Open-Source Geospatial Big Data with Python",
    description:
      "A fast-paced program covering GeoPandas, Rasterio, GDAL, and Google Earth Engine (GEE) for processing large-scale spatial environmental datasets.",
    category: "Geospatial & Coding",
    date: "Completed (August 2025)",
    duration: "2 Weeks",
    mode: "Online",
    status: "completed",
    image: "/images/about/geospatial.svg",
    highlights: [
      "Vector & Raster Processing in Python",
      "Google Earth Engine API Workflows",
      "Automated Map Generation & Web Dashboards",
      "Hands-on Coding Notebooks Provided",
    ],
    attendees: "90+ Participants Certified",
    link: "/contact",
  },
  {
    id: 6,
    title: "Groundwater Exploration & Geophysical Survey Techniques",
    description:
      "Focused module on Electrical Resistivity Tomography (ERT), Vertical Electrical Sounding (VES), and geochemical assessment for water resource management.",
    category: "Water Resources",
    date: "Completed (May 2025)",
    duration: "3 Weeks",
    mode: "In-Person",
    status: "completed",
    image: "/images/project/Project-01.png",
    highlights: [
      "VES & 2D ERT Data Acquisition",
      "Aquifer Delineation & Recharge Zones",
      "Water Quality Testing & Contamination Mapping",
      "Practical Field Case Studies",
    ],
    attendees: "45+ Professionals Trained",
    link: "/contact",
  },
];
