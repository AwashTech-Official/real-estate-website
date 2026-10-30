/**
 * Formatting and Validation Utilities for Ethiopian Real Estate
 */

export function formatPrice(
  price: number | null | undefined,
  priceOnRequest: boolean | undefined,
  displayPrice: boolean | undefined,
  language: 'en' | 'am'
): string {
  if (priceOnRequest || displayPrice === false || !price || price <= 0) {
    return language === 'am' ? 'ዋጋ በስምምነት' : 'Price on request';
  }

  const formattedNum = new Intl.NumberFormat('en-US').format(price);
  return language === 'am' ? `${formattedNum} ብር` : `ETB ${formattedNum}`;
}

export function formatArea(area: number | null | undefined, language: 'en' | 'am'): string {
  if (!area) return '';
  return language === 'am' ? `${area} ካ.ሜ` : `${area} m²`;
}

/**
 * Validate phone number (supports Ethiopian +251, 09, 07, or international formats)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim().length < 8) return false;
  // Strip spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Matches +251..., 09..., 07..., or international numbers 8 to 15 digits
  const ethiopianRegex = /^(\+251|251|0)?(9|7)[0-9]{8}$/;
  const generalPhoneRegex = /^\+?[0-9]{8,15}$/;
  return ethiopianRegex.test(cleaned) || generalPhoneRegex.test(cleaned);
}

/**
 * Validate email address (if provided)
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return true; // Optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
