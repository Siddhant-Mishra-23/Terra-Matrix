import SingleProject from "@/components/Project/SingleProject";
import projectData from "@/components/Project/projectData";
import Breadcrumb from "@/components/Common/Breadcrumb";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "project Page | Terra Matrix",
  description: "This is project Page for Terra Matrix",
  // other metadata
};

const Project = () => {
  return (
    <>
      <Breadcrumb
        pageName="Project Grid"
        description="Explore the Projects by our team. We take pride in delivering exceptional solutions that drive success and innovation for our clients. Get a small overview of the diverse range of projects we have successfully completed, showcasing our expertise and commitment to excellence."
      />

      <section className="pt-[120px] pb-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            {projectData.map((project) => (
              <div
                key={project.id}
                className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
              >
                <SingleProject project={project} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Project;
