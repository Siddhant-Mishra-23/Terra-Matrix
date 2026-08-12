import { Project } from "@/types/project";

const projectData: Project[] = [
  {
    id: 1,
    title: "Deep Learning Framework To Forecast Groundwater Storage",
    paragraph:
      "The paper develops an ensemble deep learning framework to forecast groundwater storage (GWS) under hydrological variability.",
    image: "/images/project/Project-01.png",
    href: "/project-details/groundwater-forecast",
    author: {
      name: "Dr. Sovan Sankalp",
      image: "/images/team/Dr. Sovan Sankalp.jpeg",
      designation: "AI and Geospatial Applications Specialist",
    },
    tags: ["Deep Learning"],
    publishDate: "2025",
  },
  {
    id: 2,
    title: "9 simple ways to improve your design skills",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet dictum neque, laoreet dolor.",
    image: "/images/project/Project-02.jpg",
    href: "/project-details/groundwater-forecast",
    author: {
      name: "Dr. Asit Kumar Dandapat",
      image: "/images/team/Dr. Asit Kumar Dandapat.jpeg",
      designation: "Hydrology and GIS Specialist",
    },
    tags: ["Hydrology"],
    publishDate: "2025",
  },
  {
    id: 3,
    title: "Fluvial Hydraulics and Flood Modelling Systems",
    paragraph:
      "Advanced flood modeling and fluvial hydraulic simulations for river basin management and disaster mitigation.",
    image: "/images/project/Project-03.jpg",
    href: "/project-details/groundwater-forecast",
    author: {
      name: "Dr. Arpan Pradhan",
      image: "/images/team/Dr. Arpan Pradhan.jpeg",
      designation: "Fluvial Hydraulics Specialist",
    },
    tags: ["Hydraulics"],
    publishDate: "2025",
  },
];
export default projectData;
