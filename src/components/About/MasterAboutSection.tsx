import SectionTitle from "../Common/SectionTitle";

const MasterAboutSection = () => {
  return (
    <section id="master-about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 md:pb-20 lg:pb-28">
          <div>
            <SectionTitle title="Engineering the Future with Intelligence & Precision" paragraph="Terra Matrix Engineering Consultant is a multidisciplinary engineering and analytics firm that bridges engineering domain expertise with advanced data intelligence and digital platforms." mb="36px" />
            <div className="text-body-color text-lg leading-relaxed space-y-6 text-justify">
              <p>
                Our strength lies in combining <strong>deep technical knowledge</strong>, <strong>research-driven solutions</strong>, and <strong>modern IT development</strong> to solve complex real-world problems for government bodies, industries, and academic institutions.
              </p>

              <p>
                What sets us apart is our <strong>team composition</strong>—a rare blend of <strong>doctoral researchers</strong>, <strong>domain engineers</strong>, <strong>AI/ML specialists</strong>, <strong>GIS experts</strong>, and <strong>full-stack developers</strong> working together under one roof. This allows us to deliver solutions that are <strong>scientifically robust</strong>, <strong>technically sound</strong>, and <strong>practically implementable</strong>.
              </p>

              <p className="font-medium text-green">
                We don&apos;t just provide consultancy—we <strong>design</strong>, <strong>develop</strong>, <strong>analyze</strong>, <strong>deploy</strong>, and <strong>support</strong> end-to-end solutions.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterAboutSection;
