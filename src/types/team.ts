export type Team = {
  id: number;
  name: string;
  role: string;
  bio?: string;
  image: string;
};
export type TeamMember = {
  id: number;
  name: string;
  role: string;
  domain: string;
  image: string;
  summary: string;
  expertise: string[];
  experience: string[];
  Achievements: string[];  
  softwareSkills: string[];
  education: string[];
  ContactNumber: Int16Array;
  email: string;
};