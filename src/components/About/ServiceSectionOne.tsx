import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";

const checkIcon = (
  <svg width="16" height="13" viewBox="0 0 16 13" className="fill-current">
    <path d="M5.8535 12.6631C5.65824 12.8584 5.34166 12.8584 5.1464 12.6631L0.678505 8.1952C0.483242 7.99994 0.483242 7.68336 0.678505 7.4881L2.32921 5.83739C2.52467 5.64193 2.84166 5.64216 3.03684 5.83791L5.14622 7.95354C5.34147 8.14936 5.65859 8.14952 5.85403 7.95388L13.3797 0.420561C13.575 0.22513 13.8917 0.225051 14.087 0.420383L15.7381 2.07143C15.9333 2.26669 15.9333 2.58327 15.7381 2.77854L5.8535 12.6631Z" />
  </svg>
);

type ListProps = {
  text: string;
};

const List = ({ text }: ListProps) => (
  <p className="text-body-color mb-5 flex items-center text-lg font-medium">
    <span className="bg-primary/10 text-primary mr-4 flex h-[30px] w-[30px] items-center justify-center rounded-md">
      {checkIcon}
    </span>
    {text}
  </p>
);

const ServiceSectionOne = () => {
  return (
    <section id="civil-services" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 md:pb-20 lg:pb-28">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <SectionTitle title="Civil Engineering & Infrastructure Services" paragraph="Innovative engineering solutions powered by data, intelligence, and precision for Civil Engineering & Infrastructure Services." mb="44px" />
              <div className="mb-12 max-w-[570px] lg:mb-0">
                <div className="mx-[-12px] flex flex-wrap">
                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Structural Design & Analysis (RCC, Steel, Composite Structures)" />
                    <List text="Geotechnical Investigation & Foundation Design" />
                    <List text="Project Estimation, Costing & Valuation" />
                  </div>
                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Construction Management & Supervision" />
                    <List text="Infrastructure Planning (Roads, Bridges, Water Supply, Drainage)" />
                    <List text="Earthquake-Resistant Design & Retrofitting" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full px-4 lg:w-1/2">
              <div className="relative mx-auto aspect-25/24 max-w-[500px] lg:mr-0">
                <Image src="/images/about/civil-infra.svg" alt="Civil engineering and infrastructure services" fill className="mx-auto max-w-full drop-shadow-three lg:mr-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSectionOne;
