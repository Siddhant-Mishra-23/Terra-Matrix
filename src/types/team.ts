export type Team = {
  id: number | string;
  name: string;
  role: string;
  bio?: string;
  image: string;
};

export type TeamMember = {
  id: number | string;
  name: string;
  role: string;
  domain: string;
  categoryGroup?: string;
  image: string;
  summary: string;
  expertise: string[];
  experience: string[];
  Achievements: string[];  
  softwareSkills: string[];
  education: string[];
  ContactNumber: string;
  email: string;
  order_index?: number;
  linkedin?: string;
  twitter?: string;
};