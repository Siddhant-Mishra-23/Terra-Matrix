import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import Forms from "@/components/Forms";

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
        pageName="Contact Page"
        description="Contact the Terra Matrix team for details, Get Innovative solutions. At Terra Matrix, we are dedicated to providing top-notch services tailored to your needs.Terra Matrix, Your Trusted Partner in Innovation."
      />

      <Contact />
      <Forms />
    </>
  );
};

export default ContactPage;
