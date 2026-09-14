import { Project } from "@/types/project";
import Image from "next/image";
import Link from "next/link";

const SingleProject = ({ project }: { project: Project }) => {
  const { id, title, image, paragraph, author, tags, publishDate, href } = project;
  const projectLink = href && href !== "/project" ? href : `/project-details/${id}`;

  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1">
      {/* Top Media Image */}
      <div>
        <Link href={projectLink} className="relative block aspect-16/10 w-full overflow-hidden bg-gray-100">
          <span className="bg-primary/90 backdrop-blur-xs absolute top-4 right-4 z-20 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold text-white capitalize shadow">
            {tags[0]}
          </span>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Card Content Area */}
        <div className="p-6 sm:p-7 flex flex-col">
          <h3>
            <Link
              href={projectLink}
              className="hover:text-primary mb-3 block text-lg font-bold text-dark sm:text-xl line-clamp-2 min-h-[54px] leading-snug transition-colors"
            >
              {title}
            </Link>
          </h3>
          <p className="border-body-color/10 text-body-color mb-4 border-b pb-4 text-xs sm:text-sm font-medium leading-relaxed line-clamp-3 min-h-[60px]">
            {paragraph}
          </p>
        </div>
      </div>

      {/* Pinned Bottom Footer: Author & Date */}
      <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
            <Image src={author.image} alt={author.name} fill className="object-cover" />
          </div>
          <div>
            <h4 className="text-dark text-xs font-bold leading-tight">
              {author.name}
            </h4>
            <p className="text-body-color text-[11px] font-medium leading-tight mt-0.5">
              {author.designation}
            </p>
          </div>
        </div>

        <div className="text-right border-l border-gray-100 pl-3">
          <span className="block text-[10px] uppercase font-bold text-gray-400">Date</span>
          <span className="text-dark font-semibold text-xs">{publishDate}</span>
        </div>
      </div>
    </div>
  );
};

export default SingleProject;
