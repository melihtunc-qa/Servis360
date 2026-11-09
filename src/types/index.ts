export type FuelType = 'Benzin' | 'Dizel' | 'LPG' | 'Hibrit' | 'Elektrik';

export type ServiceStatus = 'KABUL_EDILDI' | 'ISLEMDE' | 'PARCA_BEKLENIYOR' | 'TAMAMLANDI' | 'TESLIM_EDILDI';

export type PaymentStatus = 'ODENDI' | 'KISMI_ODENDI' | 'BEKLIYOR' | 'VERESIYE';

export type ItemType = 'PARCA' | 'ISCILIK';

export type ReminderType = 'YAG_BAKIMI' | 'MUAYENE' | 'TRIGER' | 'FREN_BALATA' | 'OZEL';

export type ReminderStatus = 'YAKLASAN' | 'GECIKMIS' | 'BILDIRILDI' | 'TAMAMLANDI';

export type FuelGaugeLevel = 'RESERV' | '1/4' | '1/2' | '3/4' | 'FULL';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // Borç/Alacak bakiyesi (Pozitif: Müşteri borçlu)
  notes?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  currentKm: number;
  vin?: string;
  engineNo?: string;
  fuelType: FuelType;
  color?: string;
  notes?: string;
  createdAt: string;
}

export interface StockItem {
  id: string;
  code: string; // Parça Kodu (örn: HU711/51X)
  name: string; // Parça Adı (örn: Yağ Filtresi)
  category: string; // Filtre, Motor Yağı, Fren, Süspansiyon, vb.
  brand: string; // Mann, Bosch, Castrol, Motul, vb.
  quantity: number; // Mevcut stok adedi
  minQuantity: number; // Kritik stok sınırı
  unitCost: number; // Alış / Maliyet Fiyatı (TL)
  unitPrice: number; // Satış Fiyatı (TL)
  shelfLocation?: string; // Raf / Kutu no (örn: Raf B-3)
  updatedAt: string;
}

export interface MaintenancePackageItem {
  itemType: ItemType;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface MaintenancePackage {
  id: string;
  name: string;
  description: string;
  category: string;
  items: MaintenancePackageItem[];
}

export interface VehicleIntakeChecklist {
  fuelLevel: FuelGaugeLevel;
  hasSpareTire: boolean;
  hasJackAndTools: boolean;
  existingDamages?: string; // Mevcut çizik/ezik notları
  valuableItems?: string; // Araçta bırakılan özel eşya
}

export interface Technician {
  id: string;
  name: string;
  phone?: string;
  specialty: string; // Motor Mekanik, Ön Takım, Elektrik, vb.
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  serviceRecordId: string;
  stockItemId?: string; // Eğer stoktan seçildiyse ilişkisi
  itemType: ItemType;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalPrice: number;
  warrantyMonths?: number;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  customerId: string;
  technicianId?: string; // Görevli usta
  entryDate: string;
  exitDate?: string;
  entryKm: number;
  complaint: string;
  diagnosis?: string;
  intakeChecklist?: VehicleIntakeChecklist;
  status: ServiceStatus;
  items: ServiceItem[];
  partsTotal: number;
  laborTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'ACIK_HESAP';
  technicianNotes?: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'GELIR' | 'GIDER';
  category: 'SERVIS_TAHSILAT' | 'PARCA_ALIMI' | 'KIRA_VE_AIDAT' | 'MAAS_VE_AVANS' | 'FATURALAR' | 'DIGER';
  amount: number;
  paymentMethod: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE';
  description: string;
  relatedServiceId?: string;
  relatedCustomerId?: string;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  customerId: string;
  type: ReminderType;
  title: string;
  targetDate: string;
  targetKm?: number;
  lastServiceKm?: number;
  status: ReminderStatus;
  notes?: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  taxOffice?: string;
  taxNumber?: string;
  defaultOilPeriodKm: number;
  defaultOilPeriodDays: number;
  footerNote: string;
}
