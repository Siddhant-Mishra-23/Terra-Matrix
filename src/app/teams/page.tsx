import Breadcrumb from "@/components/Common/Breadcrumb";
import TeamSection from "@/components/Team/TeamSection"

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Terra Matrix",
  description: "This is Contact Page for Terra Matrix",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Team"
        description="TerraMatrix is powered by a multidisciplinary team of engineers, technologists, and researchers who combine engineering precision, advanced technologies, and domain expertise to deliver intelligent, sustainable, and future-ready solutions."
      />
      <TeamSection />
    </>
  );
};

export default ContactPage;
