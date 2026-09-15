export type Conference = {
  id: string | number;
  title: string;
  description: string;
  venue: string;
  date: string;
  category: string;
  image: string;
  status: "upcoming" | "completed";
  registration_link?: string;
  highlights?: string[];
  is_paid?: boolean;
  price?: string;
  upi_id?: string;
  qr_image?: string;
  created_at?: string;
  updated_at?: string;
};
