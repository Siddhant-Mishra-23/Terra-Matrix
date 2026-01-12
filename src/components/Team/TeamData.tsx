import { Team, TeamMember} from "@/types/team"

export const TeamData: Team[] = [
  {
    id: 1,
    name: "Dr. Sovan Sankalp",
    role: "Partner",
    bio: "AI and Geospatial Applications Specialist.",
    image: "/images/team/Dr. Sovan Sankalp.jpeg",
  },
  {
    id: 2,
    name: "Dr. Asit Kumar Dandapat",
    role: "Partner",
    bio: "Expert in GIS-based infrastructure and asset mapping.",
    image: "/images/team/Dr. Asit Kumar Dandapat.jpeg",
  },
  {
    id: 3,
    name: "Dr. Arpan Pradhan",
    role: "Partner",
    bio: "Specialist in Hydraulic and Hydrologic modelling.",
    image: "/images/team/Dr. Arpan Pradhan.jpeg",
  },
  {
    id: 4,
    name: "Chiranjeeb Kumar Sahoo",
    role: "Urban Planner",
    bio: "Works on IoT systems and full-stack software development.",
    image: "/images/team/Chiranjeeb Kumar Sahoo.jpeg",
  },
  {
    id: 5,
    name: "Kunal Mehta",
    role: "Remote Sensing Scientist",
    bio: "Handles DEM generation and satellite-based change detection.",
    image: "/images/team/team-05.jpeg",
  },
];

export const Team_Member: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Sovan Sankalp",
    role: "Partner",
    domain: "AI and Geospatial Applications Specialist",
    image: "/images/team/Dr. Sovan Sankalp.jpeg",
    summary:
      "Experienced civil engineer specializing in infrastructure planning, structural systems, and sustainable design solutions.",
    expertise: [
      "Structural Design",
      "Infrastructure Planning",
      "Project Management",
      "Sustainable Engineering",
    ],
    experience: [
      "15+ years in large-scale infrastructure projects",
      "Led highway and urban development projects",
      "Consultant for government and private agencies",
    ],
    education: [
      "Ph.D – Civil Engineering",
      "M.Tech – Structural Engineering",
      "B.Tech – Civil Engineering",
    ],
  },
  {
    id: 2,
    name: "Ananya Verma",
    role: "Geospatial Analyst",
    domain: "Remote Sensing & GIS",
    image: "/images/team/ananya.jpg",
    summary:
      "Geospatial expert working on satellite data analysis, GIS modeling, and environmental assessments.",
    expertise: [
      "Remote Sensing",
      "GIS Mapping",
      "Flood & Drought Analysis",
      "Spatial Data Modeling",
    ],
    experience: [
      "Urban flood inundation studies",
      "Land-use & land-cover change analysis",
      "GIS-based asset management systems",
    ],
    education: [
      "M.Sc – Geoinformatics",
      "Certified GIS Professional",
    ],
  },
];
