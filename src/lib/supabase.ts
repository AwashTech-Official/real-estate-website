import { createClient } from '@supabase/supabase-js';
import type { CompanySettings, Property, PropertyMedia, InquiryInsert } from '../types/database';
import { DEMO_PROPERTIES, DEMO_MEDIA } from '../data/demoProperties';

// Read strictly from environment variables
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.SUPABASE_URL as string | undefined) ||
  '';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.SUPABASE_ANON_KEY as string | undefined) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Explicit list of safe, public columns for company_settings (NEVER select *)
// Excludes internal_notes and any private fields
export const PUBLIC_COMPANY_SETTINGS_COLUMNS =
  'id, company_name, company_name_am, tagline, tagline_am, description, description_am, phone, email, address, address_am, logo_url, whatsapp, whatsapp_number, telegram_url, facebook_url, instagram_url, linkedin_url, response_time_text, response_time_text_am, rent_listings_enabled';

export const TIER2_COMPANY_SETTINGS_COLUMNS =
  'id, company_name, company_name_am, tagline, tagline_am, description, description_am, phone, email, address, address_am, logo_url, whatsapp, rent_listings_enabled';

export const BASIC_COMPANY_SETTINGS_COLUMNS =
  'id, company_name, phone, email, address, logo_url';

// Explicit public columns for properties (NEVER select internal_notes or address_internal)
export const PUBLIC_PROPERTY_COLUMNS =
  'id, slug, title, title_am, description, description_am, listing_type, property_type, subcity, public_location_text, price, price_on_request, display_price, bedrooms, bathrooms, area, area_sqm, cover_image_url, is_published, is_featured, is_demo, sort_order, amenities, amenities_am, highlights, highlights_am, created_at';

export const PUBLIC_PROPERTY_MEDIA_COLUMNS =
  'id, property_id, media_url, media_type, sort_order, is_primary, caption, caption_am, created_at';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface CompanySettingsResult {
  data: Partial<CompanySettings> | null;
  error: string | null;
  isConfigured: boolean;
  status: 'idle' | 'loading' | 'connected' | 'unconfigured' | 'error';
}

/**
 * Fetch company settings for public display.
 */
export async function getCompanySettings(): Promise<CompanySettingsResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      data: null,
      error: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured yet in the environment.',
      isConfigured: false,
      status: 'unconfigured',
    };
  }

  try {
    let finalData: Partial<CompanySettings> | null = null;
    let queryError: { message: string } | null = null;

    const initialResult = await supabase
      .from('company_settings')
      .select(PUBLIC_COMPANY_SETTINGS_COLUMNS)
      .limit(1)
      .maybeSingle();

    finalData = initialResult.data as Partial<CompanySettings> | null;
    queryError = initialResult.error;

    if (queryError && queryError.message?.includes('column')) {
      const tier2Result = await supabase
        .from('company_settings')
        .select(TIER2_COMPANY_SETTINGS_COLUMNS)
        .limit(1)
        .maybeSingle();

      if (!tier2Result.error) {
        finalData = tier2Result.data as Partial<CompanySettings> | null;
        queryError = null;
      } else {
        const basicResult = await supabase
          .from('company_settings')
          .select(BASIC_COMPANY_SETTINGS_COLUMNS)
          .limit(1)
          .maybeSingle();

        finalData = basicResult.data as Partial<CompanySettings> | null;
        queryError = basicResult.error;
      }
    }

    if (queryError) {
      return {
        data: null,
        error: queryError.message,
        isConfigured: true,
        status: 'error',
      };
    }

    if (!finalData) {
      return {
        data: null,
        error: 'Connected to Supabase, but no records exist in company_settings table yet.',
        isConfigured: true,
        status: 'connected',
      };
    }

    return {
      data: finalData,
      error: null,
      isConfigured: true,
      status: 'connected',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      data: null,
      error: errorMsg,
      isConfigured: true,
      status: 'error',
    };
  }
}

/**
 * 1. Fetch featured published properties ordered by sort_order.
 * Explicitly excludes internal_notes and address_internal.
 */
export async function getFeaturedProperties(): Promise<Property[]> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(PUBLIC_PROPERTY_COLUMNS)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Property[];
      }
    } catch {
      // Fallback below
    }
  }

  // Return verified demo listings with is_demo = true
  return DEMO_PROPERTIES.filter((p) => p.is_featured);
}

export interface PropertyFilters {
  listingType?: 'all' | 'sale' | 'rent';
  propertyType?: string;
  subcity?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  rentListingsEnabled?: boolean;
}

/**
 * 2. Fetch all published properties with optional filter criteria.
 * Filters rent listings out if rentListingsEnabled is false.
 */
export async function getAllProperties(filters?: PropertyFilters): Promise<Property[]> {
  let properties: Property[] = [];

  if (supabase && isSupabaseConfigured) {
    try {
      let query = supabase
        .from('properties')
        .select(PUBLIC_PROPERTY_COLUMNS)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (filters?.listingType && filters.listingType !== 'all') {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters?.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.subcity && filters.subcity !== 'all') {
        query = query.eq('subcity', filters.subcity);
      }
      if (filters?.minPrice && filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice && filters.maxPrice > 0) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.minBedrooms && filters.minBedrooms > 0) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        properties = data as Property[];
      } else {
        properties = [...DEMO_PROPERTIES];
      }
    } catch {
      properties = [...DEMO_PROPERTIES];
    }
  } else {
    properties = [...DEMO_PROPERTIES];
  }

  // Apply in-memory filtering for local demo properties or fine adjustments
  return properties.filter((p) => {
    // Hide rent listings if not enabled
    if (p.listing_type === 'rent' && filters?.rentListingsEnabled === false) {
      return false;
    }
    if (filters?.listingType && filters.listingType !== 'all' && p.listing_type !== filters.listingType) {
      return false;
    }
    if (filters?.propertyType && filters.propertyType !== 'all' && p.property_type !== filters.propertyType) {
      return false;
    }
    if (filters?.subcity && filters.subcity !== 'all' && p.subcity !== filters.subcity) {
      return false;
    }
    if (filters?.minPrice && filters.minPrice > 0 && p.price < filters.minPrice && !p.price_on_request) {
      return false;
    }
    if (filters?.maxPrice && filters.maxPrice > 0 && p.price > filters.maxPrice && !p.price_on_request) {
      return false;
    }
    if (filters?.minBedrooms && filters.minBedrooms > 0 && (p.bedrooms || 0) < filters.minBedrooms) {
      return false;
    }
    return true;
  });
}

/**
 * 3. Fetch property details by slug and its associated media ordered by sort_order.
 * Excludes internal_notes and address_internal strictly.
 */
export async function getPropertyBySlug(slug: string): Promise<{
  property: Property | null;
  media: PropertyMedia[];
}> {
  if (supabase && isSupabaseConfigured) {
    try {
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .select(PUBLIC_PROPERTY_COLUMNS)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (!propError && propData) {
        const prop = propData as Property;
        // Fetch media
        const { data: mediaData } = await supabase
          .from('property_media')
          .select(PUBLIC_PROPERTY_MEDIA_COLUMNS)
          .eq('property_id', prop.id)
          .order('sort_order', { ascending: true });

        const mediaList = (mediaData as PropertyMedia[]) || [];
        return {
          property: prop,
          media: mediaList.length > 0 ? mediaList : (DEMO_MEDIA[prop.id] || []),
        };
      }
    } catch {
      // Fallback
    }
  }

  // Fallback demo matching
  const demoProp = DEMO_PROPERTIES.find((p) => p.slug === slug) || null;
  const demoMedia = demoProp ? (DEMO_MEDIA[demoProp.id] || []) : [];
  return {
    property: demoProp,
    media: demoMedia,
  };
}

/**
 * 4. Submit inquiry into Supabase `inquiries` table.
 * STRICT RULE: Public inquiry forms are insert-only.
 * NEVER call .select() after insert.
 */
export async function submitInquiry(inquiry: InquiryInsert): Promise<{ success: boolean; error: string | null }> {
  if (!supabase || !isSupabaseConfigured) {
    // Simulate real network delay for realistic experience
    await new Promise((res) => setTimeout(res, 600));
    return { success: true, error: null };
  }

  try {
    // Insert without calling .select()
    const { error } = await supabase
      .from('inquiries')
      .insert([
        {
          name: inquiry.name,
          phone: inquiry.phone,
          email: inquiry.email || null,
          preferred_contact_method: inquiry.preferred_contact_method,
          message: inquiry.message,
          property_id: inquiry.property_id || null,
          inquiry_type: inquiry.inquiry_type,
          status: 'new',
          source: 'website',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send inquiry. Please call or WhatsApp us directly.';
    return { success: false, error: errorMsg };
  }
}

/**
 * =========================================================================
 * ADMIN MODULES SUPABASE INTEGRATION
 * =========================================================================
 */

export interface AdminAuthResult {
  user: any | null;
  adminUser: any | null;
  error: string | null;
}

/**
 * 1. Admin Login & Authorization check
 * Verifies email/password via Supabase Auth, then strictly validates that the user
 * exists in the `admin_users` table. If not found, signs out immediately and returns "Not authorized".
 */
export async function signInAdmin(email: string, password: string): Promise<AdminAuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      user: null,
      adminUser: null,
      error: 'Supabase credentials are not configured in environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).',
    };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        user: null,
        adminUser: null,
        error: authError?.message || 'Invalid email or password.',
      };
    }

    const user = authData.user;

    // Check admin_users table for authorization (by user_id / id)
    const { data: adminRecord, error: adminError } = await queryAdminUser(user.id);

    if (adminError) {
      console.error('Error checking admin_users:', adminError);
    }

    if (!adminRecord) {
      // User is authenticated in Supabase Auth, but NOT in admin_users!
      await supabase.auth.signOut();
      return {
        user: null,
        adminUser: null,
        error: 'Not authorized: your account is not registered in the admin_users table.',
      };
    }

    return {
      user,
      adminUser: adminRecord,
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed.';
    return { user: null, adminUser: null, error: msg };
  }
}

/**
 * Check admin_users table strictly by user ID.
 * Tries `user_id` first (standard foreign key to auth.users.id).
 * If the column is named `id`, falls back cleanly.
 * Never queries nonexistent columns such as email.
 */
async function queryAdminUser(userId: string): Promise<{ data: any; error: any }> {
  if (!supabase) return { data: null, error: { message: 'Supabase client not initialized' } };

  // Primary check: user_id = userId
  const { data: recordByUserId, error: errorByUserId } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!errorByUserId) {
    return { data: recordByUserId, error: null };
  }

  // If column user_id does not exist in schema (code 42703), try column id = userId
  if (errorByUserId.code === '42703' || errorByUserId.message?.toLowerCase().includes('user_id')) {
    const { data: recordById, error: errorById } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return { data: recordById, error: errorById };
  }

  return { data: null, error: errorByUserId };
}

/**
 * Check current active admin session and verify membership in admin_users
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { user: null, adminUser: null, error: null };
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session?.user) {
      return { user: null, adminUser: null, error: null };
    }

    const user = sessionData.session.user;

    const { data: adminRecord, error: adminError } = await queryAdminUser(user.id);

    if (adminError) {
      console.warn('Error checking admin_users session:', adminError);
    }

    if (!adminRecord) {
      await supabase.auth.signOut();
      return {
        user: null,
        adminUser: null,
        error: 'Not authorized: your account is not registered in the admin_users table.',
      };
    }

    return {
      user,
      adminUser: adminRecord,
      error: null,
    };
  } catch {
    return { user: null, adminUser: null, error: null };
  }
}

/**
 * Sign out admin
 */
export async function signOutAdmin(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * 2. Properties Admin Operations
 */
export async function getAdminProperties(): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return DEMO_PROPERTIES;
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch admin properties, using demo:', error.message);
      return DEMO_PROPERTIES;
    }

    return data && data.length > 0 ? data : DEMO_PROPERTIES;
  } catch {
    return DEMO_PROPERTIES;
  }
}

export async function saveAdminProperty(property: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true, data: property };
  }

  try {
    if (property.id) {
      const { data, error } = await supabase
        .from('properties')
        .update({
          ...property,
          updated_at: new Date().toISOString(),
        })
        .eq('id', property.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            ...property,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Save failed' };
  }
}

export async function deleteAdminProperty(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

/**
 * 3. Property Media & Supabase Storage Operations
 */
export const PROPERTY_MEDIA_BUCKET = 'property-media';

export async function ensureMediaBucketExists(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true;

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === PROPERTY_MEDIA_BUCKET);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(PROPERTY_MEDIA_BUCKET, {
        public: true,
      });
      if (error && !error.message.includes('already exists')) {
        console.warn('Bucket creation notice:', error.message);
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function getAdminPropertyMedia(propertyId: string): Promise<PropertyMedia[]> {
  if (!supabase || !isSupabaseConfigured) {
    return DEMO_MEDIA[propertyId] || [];
  }

  try {
    const { data, error } = await supabase
      .from('property_media')
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return DEMO_MEDIA[propertyId] || [];
    }
    return data || [];
  } catch {
    return DEMO_MEDIA[propertyId] || [];
  }
}

export async function uploadPropertyMedia(
  propertyId: string,
  file: File,
  caption?: string
): Promise<{ success: boolean; data?: PropertyMedia; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    // Generate object URL for mock/preview mode
    const fakeUrl = URL.createObjectURL(file);
    const mockMedia: PropertyMedia = {
      id: `media-${Date.now()}`,
      property_id: propertyId,
      media_url: fakeUrl,
      media_type: 'image',
      sort_order: 99,
      is_primary: false,
      caption: caption || file.name,
      created_at: new Date().toISOString(),
    };
    return { success: true, data: mockMedia };
  }

  try {
    await ensureMediaBucketExists();

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(PROPERTY_MEDIA_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from(PROPERTY_MEDIA_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const { data: mediaRecord, error: insertError } = await supabase
      .from('property_media')
      .insert([
        {
          property_id: propertyId,
          media_url: publicUrl,
          media_type: 'image',
          sort_order: 10,
          is_primary: false,
          caption: caption || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true, data: mediaRecord };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Media upload failed' };
  }
}

export async function deletePropertyMedia(
  mediaId: string,
  mediaUrl?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('property_media').delete().eq('id', mediaId);
    if (error) return { success: false, error: error.message };

    // Try deleting from storage bucket if url contains bucket
    if (mediaUrl && mediaUrl.includes(PROPERTY_MEDIA_BUCKET)) {
      const parts = mediaUrl.split(`${PROPERTY_MEDIA_BUCKET}/`);
      if (parts[1]) {
        await supabase.storage.from(PROPERTY_MEDIA_BUCKET).remove([parts[1]]);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
  }
}

export async function setPrimaryPropertyMedia(
  propertyId: string,
  mediaId: string,
  mediaUrl: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    // 1. Reset all media for this property to not primary
    await supabase
      .from('property_media')
      .update({ is_primary: false })
      .eq('property_id', propertyId);

    // 2. Set this media as primary
    await supabase
      .from('property_media')
      .update({ is_primary: true })
      .eq('id', mediaId);

    // 3. Update cover_image_url on properties
    await supabase
      .from('properties')
      .update({ cover_image_url: mediaUrl })
      .eq('id', propertyId);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to set cover' };
  }
}

export async function updateMediaSortOrder(
  mediaId: string,
  sortOrder: number
): Promise<{ success: boolean }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };
  try {
    await supabase.from('property_media').update({ sort_order: sortOrder }).eq('id', mediaId);
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * 4. Inquiries Admin Operations
 */
export async function getAdminInquiries(): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [
      {
        id: 'inq-demo-1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        name: 'Abebe Bekele',
        phone: '+251 91 123 4567',
        email: 'abebe.b@example.com',
        preferred_contact_method: 'phone',
        inquiry_type: 'viewing_request',
        status: 'new',
        source: 'website',
        message: 'Interested in booking a private viewing for the Bole Rwanda luxury villa this Saturday.',
        internal_notes: 'Client prefers morning viewing around 10:00 AM.',
      },
      {
        id: 'inq-demo-2',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        name: 'Sara Hailu',
        phone: '+251 92 987 6543',
        email: 'sara.h@example.com',
        preferred_contact_method: 'whatsapp',
        inquiry_type: 'property_question',
        status: 'contacted',
        source: 'website',
        message: 'Can you provide the floor plan and title status for the Kazanchis penthouse?',
        internal_notes: 'Sent brochure on WhatsApp. Follow up on Tuesday.',
      },
    ];
  }

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching inquiries:', error.message);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: string,
  internalNotes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (internalNotes !== undefined) {
      updates.internal_notes = internalNotes;
    }

    const { error } = await supabase
      .from('inquiries')
      .update(updates)
      .eq('id', inquiryId);

    if (error) return { success: false, error: error.message };

    // Record status event if inquiry_status_events table exists
    try {
      await supabase.from('inquiry_status_events').insert([
        {
          inquiry_id: inquiryId,
          status,
          notes: internalNotes || null,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Non-blocking
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

/**
 * 5. Leads Admin Operations
 */
export async function getAdminLeads(): Promise<any[]> {
  if (!supabase || !isSupabaseConfigured) {
    return [
      {
        id: 'lead-1',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        name: 'Dawit Mengistu',
        phone: '+251 93 456 7890',
        email: 'dawit.m@example.com',
        status: 'qualified',
        source: 'valuation_request',
        notes: 'Requested valuation for a 450 sqm residence in Old Airport.',
      },
    ];
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };

  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    const { error } = await supabase.from('leads').update(updates).eq('id', leadId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update lead' };
  }
}

/**
 * 6. Company Settings Admin Operations
 */
export async function updateCompanySettingsAdmin(
  settings: Partial<CompanySettings>
): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) return { success: true };

  try {
    // If settings has an id, update that row, otherwise update the first record
    if (settings.id) {
      const { error } = await supabase
        .from('company_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const { data: firstRow } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (firstRow?.id) {
        const { error } = await supabase
          .from('company_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', firstRow.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert([
            {
              ...settings,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Settings update failed' };
  }
}
