type Author = {
  name: string;
  image: string;
  designation: string;
};

export type Project = {
  id: number;
  title: string;
  paragraph: string;
  image: string;
  href: string;
  author: Author;
  tags: string[];
  publishDate: string;
};
