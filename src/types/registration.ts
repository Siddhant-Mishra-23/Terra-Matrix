export type RegistrationType =
  | "corporate_training"
  | "public_training"
  | "module_request"
  | "conference"
  | "consultation"
  | "support_ticket"
  | "newsletter";

export type RegistrationStatus =
  | "new"
  | "contacted"
  | "proposal_sent"
  | "enrolled"
  | "closed";

export interface Registration {
  id: string;
  reference_id: string;
  type: RegistrationType;
  target_item_title?: string;
  full_name: string;
  email: string;
  phone: string;
  organization?: string;
  designation?: string;
  batch_size?: string;
  preferred_mode?: "Online" | "In-Person" | "Hybrid";
  preferred_date?: string;
  message?: string;
  transaction_id?: string;
  is_verified?: boolean;
  payment_status?: "free" | "pending_verification" | "verified" | "rejected";
  price_paid?: string;
  calendar_synced?: boolean;
  google_sheet_synced?: boolean;
  status: RegistrationStatus;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
}
