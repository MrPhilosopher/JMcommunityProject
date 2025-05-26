export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Jamaican phone number (10 digits starting with 876 or 7 digits local)
  if (cleaned.length === 10 && cleaned.startsWith('876')) {
    // Format as (876) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 10 && cleaned.startsWith('1876')) {
    // Handle 1-876 format
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1876')) {
    // Format as +1 (876) XXX-XXXX
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 7) {
    // Local number format XXX-XXXX
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  
  // Return original if it doesn't match expected formats
  return phone;
}

export function validateJamaicanPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Valid formats:
  // - 7 digits (local)
  // - 10 digits starting with 876
  // - 11 digits starting with 1876
  return (
    cleaned.length === 7 ||
    (cleaned.length === 10 && cleaned.startsWith('876')) ||
    (cleaned.length === 11 && cleaned.startsWith('1876'))
  );
}

export function cleanPhoneNumber(phone: string): string {
  // Remove all non-digit characters for storage
  return phone.replace(/\D/g, '');
}