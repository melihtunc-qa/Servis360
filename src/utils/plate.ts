/**
 * Plaka normalizasyonu ve arama yardımcı fonksiyonları
 */

/**
 * Plakayı boşluklardan arındırıp standart formata (büyük harf) dönüştürür.
 * Türkçe karakterleri de normalize eder.
 */
export function normalizePlate(plate: string | null | undefined): string {
  if (!plate) return '';
  return plate
    .trim()
    .replace(/\s+/g, '')
    .toLocaleUpperCase('tr-TR')
    .toUpperCase();
}

/**
 * Plakayı standart Türk plaka formatına (örn: 34 ABC 123) uygun görsel formata dönüştürür.
 */
export function formatPlateDisplay(plate: string | null | undefined): string {
  const clean = normalizePlate(plate);
  if (!clean) return '';
  
  // Örn: 34VR4821 -> 34 VR 4821, 06FS5522 -> 06 FS 5522
  const match = clean.match(/^(\d{2})([A-Z]{1,3})(\d{2,4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return clean;
}

/**
 * Arama sorgusunun plaka ile eşleşip eşleşmediğini kontrol eder.
 * Boşluk, küçük/büyük harf ve kısmi aramalara karşı dayanıklıdır.
 */
export function matchPlateSearch(plate: string | null | undefined, query: string | null | undefined): boolean {
  if (!plate || query === null || query === undefined) return false;
  if (query.trim() === '') return true;
  
  const normPlate = normalizePlate(plate);
  const normQuery = normalizePlate(query);
  
  if (!normQuery) return true;
  return normPlate.includes(normQuery);
}
