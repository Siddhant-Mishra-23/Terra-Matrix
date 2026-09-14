import Breadcrumb from "@/components/Common/Breadcrumb";
import TrainingsSection from "@/components/Trainings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainings | Terra Matrix",
  description: "Explore upcoming and completed professional training programs, workshops, and technical capacity-building sessions offered by Terra Matrix.",
};

const TrainingsPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Trainings & Workshops"
        description="Comprehensive technical training programs, hands-on workshops, and skill-building modules in civil engineering, GIS, geospatial intelligence, and AI applications."
      />
      <TrainingsSection />
    </>
  );
};

export default TrainingsPage;
