/**
 * WhatsApp entegrasyonu ve telefon numarası formatlama yardımcı fonksiyonları
 */

/**
 * Telefon numarasını WhatsApp URL formatına (905xxxxxxxxx) dönüştürür.
 * Boşluk, parantez, tire ve artı işaretlerini temizler.
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return '';

  if (cleanPhone.startsWith('90')) {
    return cleanPhone;
  }
  if (cleanPhone.startsWith('0')) {
    return '90' + cleanPhone.substring(1);
  }
  return '90' + cleanPhone;
}

/**
 * Belirtilen telefon ve mesaj için wa.me bağlantı linki üretir.
 * Türkçe karakterlerin UTF-8 URL encoding'e uygun kodlanmasını sağlar.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Periyodik bakım hatırlatması için hazır WhatsApp mesaj metni oluşturur.
 */
export function createMaintenanceReminderMessage(options: {
  shopName: string;
  customerName?: string;
  plate: string;
  title: string;
  targetKm?: number;
}): string {
  const greeting = options.customerName ? `Sayın ${options.customerName},\n` : 'Merhaba,\n';
  const kmText = options.targetKm ? ` (${options.targetKm.toLocaleString('tr-TR')} KM)` : '';
  
  return `${greeting}${options.shopName} servisimizden hatırlatmadır: ${options.plate} plakalı aracınızın ${options.title}${kmText} bakım zamanı yaklaşmıştır. Detaylı bilgi ve randevu için lütfen bizimle iletişime geçiniz.`;
}
