type Author = {
  name: string;
  image: string;
  designation: string;
};

export type Project = {
  id: number | string;
  title: string;
  paragraph: string;
  image: string;
  href: string;
  author: Author;
  tags: string[];
  publishDate: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
};

