import Breadcrumb from "@/components/Common/Breadcrumb";
import TeamSection from "@/components/Team/TeamSection"

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Terra Matrix",
  description: "Meet the multidisciplinary team of engineers, technologists, and researchers behind Terra Matrix.",
  // other metadata
};

const TeamPage = () => {
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

export default TeamPage;
