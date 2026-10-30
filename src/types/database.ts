/**
 * Database schema definitions for Addis Ababa Luxury Real Estate
 * Aligned with existing Supabase tables:
 * - company_settings
 * - properties
 * - property_media
 * - inquiries
 * - leads
 * - admin_users
 * - inquiry_status_events
 *
 * CRITICAL SECURITY & PRIVACY RULES:
 * - Public queries must NEVER select `internal_notes` or `address_internal`.
 * - Public queries must explicitly list public columns (never use `select *`).
 * - Inquiries insert must NEVER call `.select()` after insert.
 */

export interface CompanySettings {
  id: string;
  company_name: string;
  company_name_am?: string | null;
  tagline?: string | null;
  tagline_am?: string | null;
  description?: string | null;
  description_am?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  address_am?: string | null;
  logo_url?: string | null;
  whatsapp?: string | null;
  whatsapp_number?: string | null;
  telegram_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  response_time_text?: string | null;
  response_time_text_am?: string | null;
  rent_listings_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  title_am?: string | null;
  description: string;
  description_am?: string | null;
  listing_type: 'sale' | 'rent' | string;
  property_type: 'villa' | 'apartment' | 'penthouse' | 'townhouse' | 'commercial' | 'land' | string;
  subcity?: string | null;
  public_location_text?: string | null;
  price: number;
  price_on_request?: boolean;
  display_price?: boolean;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  area_sqm?: number | null;
  cover_image_url?: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_demo: boolean;
  sort_order?: number;
  amenities?: string[] | null;
  amenities_am?: string[] | null;
  highlights?: string[] | null;
  highlights_am?: string[] | null;
  created_at?: string;
  updated_at?: string;
  // NOTE: address_internal and internal_notes are strictly excluded from public queries!
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'floorplan' | string;
  sort_order: number;
  is_primary?: boolean;
  caption?: string | null;
  caption_am?: string | null;
  created_at?: string;
}

export type InquiryType =
  | 'property_question'
  | 'viewing_request'
  | 'callback'
  | 'valuation_request'
  | 'list_property';

export type ContactMethod = 'phone' | 'whatsapp' | 'email';

export interface InquiryInsert {
  name: string;
  phone: string;
  email?: string | null;
  preferred_contact_method: ContactMethod;
  message: string;
  property_id?: string | null;
  inquiry_type: InquiryType;
  status: 'new';
  source: 'website';
}

export interface ValuationFormInsert extends InquiryInsert {
  property_type?: string;
  location?: string;
  area?: number;
  expected_price?: number;
}

export interface AdminUser {
  id: string;
  user_id?: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export type PublicationStatus = 'draft' | 'published' | 'archived';
export type SaleStatus = 'available' | 'reserved' | 'sold';

export interface AdminProperty extends Property {
  publication_status?: PublicationStatus | string;
  sale_status?: SaleStatus | string;
  address_internal?: string | null;
  internal_notes?: string | null;
}

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'viewing_requested'
  | 'viewing_confirmed'
  | 'viewing_completed'
  | 'offer_made'
  | 'won'
  | 'lost'
  | 'spam';

export interface InquiryRecord {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email?: string | null;
  preferred_contact_method?: ContactMethod | string;
  message: string;
  property_id?: string | null;
  inquiry_type: InquiryType | string;
  status: InquiryStatus | string;
  source?: string;
  internal_notes?: string | null;
  updated_at?: string;
}

export interface LeadRecord {
  id: string;
  created_at: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
  source?: string | null;
  notes?: string | null;
  updated_at?: string | null;
}
