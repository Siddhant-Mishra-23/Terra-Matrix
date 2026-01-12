import SectionTitle from "../Common/SectionTitle";

const MasterAboutSection = () => {
  return (
    <section id="master-about" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div>
            <SectionTitle title="Engineering the Future with Intelligence & Precision" mb="36px"/>
            <div className="text-body-color text-lg leading-relaxed space-y-6 text-justify">
              <p>
                Terra Matrix Engineering Consultants offers end-to-end services
                including <strong>structural design</strong>,{" "}
                <strong>estimation</strong>, and{" "}
                <strong>project management</strong> for buildings, roads, and
                water infrastructure. Our advanced AI/ML solutions enable{" "}
                <strong>predictive maintenance</strong>,{" "}
                <strong>flood forecasting</strong>, and{" "}
                <strong>smart irrigation</strong>, enhancing resilience and
                operational efficiency across infrastructure systems.
              </p>

              <p>
                Our expertise in <strong>remote sensing and GIS</strong> supports
                comprehensive land-use mapping, river basin analysis, and urban
                planning. In parallel, our <strong>deep learning models</strong>{" "}
                interpret satellite imagery to deliver accurate risk assessment
                and data-driven insights for strategic decision-making.
              </p>

              <p>
                With a multidisciplinary team of{" "}
                <strong>PhD researchers and industry experts from IITs and NITs</strong>,
                we deliver innovative solutions that optimise costs, improve
                infrastructure resilience, and accelerate sustainable
                development across India.
              </p>

              {/* <p className="font-medium text-dark dark:text-white"> */}
              <p className="font-medium text-green dark:text-yellow">
                From concept to commissioning, Terra Matrix Engineering
                Consultants is your trusted partner for the future of
                engineering.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterAboutSection;
