import MasterAboutSection from "@/components/About/MasterAboutSection";
import ServiceSectionOne from "@/components/About/ServiceSectionOne";
import ServiceSectionTwo from "@/components/About/ServiceSectionTwo";
import ServiceSectionThree from "@/components/About/ServiceSectionThree";
import ServiceSectionFour from "@/components/About/ServiceSectionFour";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Page | Terra Matrix",
  description: "This is About Page for Terra Matrix",
  // other metadata
};

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="About Page"
        description="Terra Matrix Engineering Consultants is a dynamic partnership firm integrating civil engineering, geospatial intelligence, and artificial intelligence to address India’s evolving infrastructure challenges."
      />
      <MasterAboutSection/>
      <ServiceSectionOne/>
      <ServiceSectionTwo/>
      <ServiceSectionThree/>
      <ServiceSectionFour/>
    </>
  );
};

export default AboutPage;
