import Breadcrumb from "@/components/Common/Breadcrumb";
import ConferencesSection from "@/components/Conferences";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conferences | Terra Matrix",
  description: "Stay updated on upcoming conferences, technical symposiums, paper presentations, and keynote sessions from Terra Matrix.",
};

const ConferencesPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Conferences & Symposiums"
        description="Connect with industry leaders, researchers, and engineers at our global and national conferences, technical seminars, and innovation forums."
      />
      <ConferencesSection />
    </>
  );
};

export default ConferencesPage;
