/**
 * Utility to generate WhatsApp Click-to-Chat (wa.me) links
 */

export const getWhatsAppLink = (phone: string, message: string): string => {
  // Remove any non-numeric characters from the phone number
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Ensure the phone number starts with the country code (defaulting to +91 for India)
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
};

export const shareOnWhatsApp = (phone: string, message: string): void => {
  const link = getWhatsAppLink(phone, message);
  window.open(link, '_blank');
};
