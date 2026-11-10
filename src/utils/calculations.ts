/**
 * Servis hesaplama matematiği ve bakiye fonksiyonları
 */

export interface ServiceItemCalc {
  itemType: 'PARCA' | 'ISCILIK';
  quantity: number;
  unitPrice: number;
}

export interface ServiceTotalsResult {
  partsTotal: number;
  laborTotal: number;
  subTotal: number;
  discount: number;
  grandTotal: number;
}

/**
 * İş emrindeki parça, işçilik, iskonto ve genel toplamı hesaplar.
 * Negatif iskonto, geçersiz sayı ve negatif toplam durumlarına karşı korumalıdır.
 */
export function calculateServiceTotals(
  items: ServiceItemCalc[],
  discount: number = 0
): ServiceTotalsResult {
  const safeDiscount = Math.max(0, Number(discount) || 0);

  const partsTotal = items
    .filter(i => i.itemType === 'PARCA')
    .reduce((sum, i) => {
      const q = Math.max(0, Number(i.quantity) || 0);
      const p = Math.max(0, Number(i.unitPrice) || 0);
      return sum + q * p;
    }, 0);

  const laborTotal = items
    .filter(i => i.itemType === 'ISCILIK')
    .reduce((sum, i) => {
      const q = Math.max(0, Number(i.quantity) || 0);
      const p = Math.max(0, Number(i.unitPrice) || 0);
      return sum + q * p;
    }, 0);

  const subTotal = partsTotal + laborTotal;
  const grandTotal = Math.max(0, subTotal - safeDiscount);

  return {
    partsTotal: Math.round(partsTotal * 100) / 100,
    laborTotal: Math.round(laborTotal * 100) / 100,
    subTotal: Math.round(subTotal * 100) / 100,
    discount: Math.round(safeDiscount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Müşterinin toplam borç/alacak bakiyesini hesaplar.
 * (grandTotal - paidAmount) farklarının toplamı. Negatif borç oluşmaz.
 */
export function calculateCustomerBalance(
  records: Array<{ customerId: string; grandTotal: number; paidAmount: number }>,
  customerId: string
): number {
  const customerRecords = records.filter(r => r.customerId === customerId);
  const totalDebt = customerRecords.reduce((sum, r) => {
    const grand = Math.max(0, Number(r.grandTotal) || 0);
    const paid = Math.max(0, Number(r.paidAmount) || 0);
    return sum + Math.max(0, grand - paid);
  }, 0);

  return Math.round(totalDebt * 100) / 100;
}

/**
 * Kasa hareketlerinin toplam gelir, gider ve net bakiyesini hesaplar.
 */
export function calculateCashFlow(
  transactions: Array<{ type: 'GELIR' | 'GIDER'; amount: number }>
) {
  const totalIncome = transactions
    .filter(t => t.type === 'GELIR')
    .reduce((s, t) => s + (Math.max(0, Number(t.amount)) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'GIDER')
    .reduce((s, t) => s + (Math.max(0, Number(t.amount)) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netBalance: Math.round(netBalance * 100) / 100,
  };
}

/**
 * Otomatik periyodik bakım hedef KM ve hedef tarihini hesaplar.
 */
export function calculateNextMaintenance(
  entryKm: number,
  entryDate: string | Date,
  periodKm: number = 10000,
  periodDays: number = 365
) {
  const safeKm = Math.max(0, Number(entryKm) || 0);
  const targetKm = safeKm + Math.max(0, Number(periodKm) || 10000);

  const dateObj = typeof entryDate === 'string' ? new Date(entryDate) : entryDate;
  const targetDateObj = new Date(dateObj.getTime() + (Number(periodDays) || 365) * 24 * 60 * 60 * 1000);
  const targetDateStr = targetDateObj.toISOString().split('T')[0];

  return {
    targetKm,
    targetDate: targetDateStr,
  };
}
