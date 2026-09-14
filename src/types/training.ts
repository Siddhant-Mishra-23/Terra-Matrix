export type Training = {
  id: number | string;
  title: string;
  description: string;
  category: string;
  date: string;
  duration: string;
  mode: "Online" | "In-Person" | "Hybrid";
  status: "upcoming" | "completed";
  image: string;
  highlights: string[];
  attendees?: string;
  link?: string;
  is_paid?: boolean;
  price?: string;
  upi_id?: string;
  qr_image?: string;
  created_at?: string;
  updated_at?: string;
};

