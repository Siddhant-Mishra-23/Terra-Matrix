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
  <p className="text-body-color mb-5 flex items-start text-lg font-medium">
    <span className="bg-primary/10 text-primary mr-4 mt-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md">
      {checkIcon}
    </span>
    {text}
  </p>
);

const ServiceSectionThree = () => {
  return (
    <section id="geospatial-services" className="pt-16 md:pt-20 lg:pt-28">
      <div className="container">
        <div className="border-b border-body-color/[.15] pb-16 dark:border-white/[.15] md:pb-20 lg:pb-28">
          <div className="-mx-4 flex flex-wrap items-center">

            {/* LEFT CONTENT */}
            <div className="w-full px-4 lg:w-1/2">
              <SectionTitle
                title="Remote Sensing & Geospatial Services"
                paragraph="Our remote sensing and geospatial services leverage advanced satellite imagery and GIS technologies to provide accurate and actionable insights for environmental monitoring, urban planning, disaster management, and resource management."
                mb="44px"
              />

              <div className="mb-12 max-w-[570px] lg:mb-0">
                <div className="mx-[-12px] flex flex-wrap">

                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="Land-Use / Land-Cover Mapping & Change Detection" />
                    <List text="River Basin Delineation & Hydrological Analysis" />
                    <List text="Urban Flood Inundation & Drought Vulnerability Mapping" />
                  </div>

                  <div className="w-full px-3 sm:w-1/2 lg:w-full xl:w-1/2">
                    <List text="GIS-Based Infrastructure Inventory & Asset Management" />
                    <List text="High-Resolution DEM / Contour Generation" />
                    <List text="NDVI / NDWI Analysis for Agriculture & Water Resources" />
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="relative mx-auto aspect-25/24 max-w-[500px] lg:mr-0">
                <Image
                  src="/images/about/geospatial.svg"
                  alt="Remote sensing and geospatial services"
                  fill
                  className="mx-auto max-w-full drop-shadow-three dark:hidden dark:drop-shadow-none"
                />
                {/* IMAGE — the below Image is for Dark theme, currently its same for both Light and dark */}
                <Image
                  src="/images/about/geospatial.svg"
                  alt="Remote sensing and geospatial services dark"
                  fill
                  className="mx-auto hidden max-w-full drop-shadow-three dark:block dark:drop-shadow-none"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSectionThree;
