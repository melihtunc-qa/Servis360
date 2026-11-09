import { 
  Customer, 
  Vehicle, 
  ServiceRecord, 
  Reminder, 
  ShopSettings, 
  ServiceItem,
  StockItem,
  MaintenancePackage,
  Technician,
  CashTransaction 
} from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'servis360_customers',
  VEHICLES: 'servis360_vehicles',
  SERVICE_RECORDS: 'servis360_service_records',
  REMINDERS: 'servis360_reminders',
  SETTINGS: 'servis360_settings',
  STOCK_ITEMS: 'servis360_stock_items',
  PACKAGES: 'servis360_packages',
  TECHNICIANS: 'servis360_technicians',
  CASH_TRANSACTIONS: 'servis360_cash_transactions',
};

export const defaultSettings: ShopSettings = {
  shopName: 'GÜVEN OTO BAKIM VE SERVİS',
  ownerName: 'Usta Ali Güven',
  phone: '0532 555 12 34',
  address: 'Oto Sanayi Sitesi 4. Blok No: 28',
  city: 'İstanbul',
  taxOffice: 'Maslak V.D.',
  taxNumber: '1234567890',
  defaultOilPeriodKm: 10000,
  defaultOilPeriodDays: 365,
  footerNote: 'Tüm parça ve işçiliklerimiz 6 ay / 10.000 KM Güven Oto garantisindedir. Bizi tercih ettiğiniz için teşekkür ederiz.',
};

// Initial Technicians
const initialTechnicians: Technician[] = [
  { id: 'tech-1', name: 'Ali Usta', phone: '0532 555 01 01', specialty: 'Motor & Mekanik', isActive: true },
  { id: 'tech-2', name: 'Murat Usta', phone: '0533 555 02 02', specialty: 'Ön Takım & Fren', isActive: true },
  { id: 'tech-3', name: 'Serkan Usta', phone: '0535 555 03 03', specialty: 'Oto Elektrik & Arıza Teşhis', isActive: true },
];

// Initial Spare Parts Inventory
const initialStockItems: StockItem[] = [
  {
    id: 'stk-1',
    code: 'CAST-5W30-4L',
    name: 'Castrol Edge 5W-30 LL Motor Yağı 4L',
    category: 'Motor Yağı',
    brand: 'Castrol',
    quantity: 14,
    minQuantity: 4,
    unitCost: 1350,
    unitPrice: 1850,
    shelfLocation: 'Raf A-1',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stk-2',
    code: 'MOTUL-5W30-5L',
    name: 'Motul 8100 X-clean EFE 5W-30 5L',
    category: 'Motor Yağı',
    brand: 'Motul',
    quantity: 8,
    minQuantity: 3,
    unitCost: 1600,
    unitPrice: 2200,
    shelfLocation: 'Raf A-2',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stk-3',
    code: 'MANN-HU71151X',
    name: 'Mann Yağ Filtresi (VAG Grubu)',
    category: 'Filtre',
    brand: 'Mann',
    quantity: 6,
    minQuantity: 5,
    unitCost: 280,
    unitPrice: 480,
    shelfLocation: 'Kutu F-12',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stk-4',
    code: 'MANN-C35154',
    name: 'Mann Hava Filtresi (VAG Grubu)',
    category: 'Filtre',
    brand: 'Mann',
    quantity: 2, // Kritik seviyede
    minQuantity: 4,
    unitCost: 350,
    unitPrice: 580,
    shelfLocation: 'Kutu F-14',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stk-5',
    code: 'BOSCH-0986494004',
    name: 'Bosch Ön Fren Balata Takımı (Megane/Clio)',
    category: 'Fren Sistemi',
    brand: 'Bosch',
    quantity: 5,
    minQuantity: 2,
    unitCost: 1250,
    unitPrice: 1800,
    shelfLocation: 'Raf B-4',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'stk-6',
    code: 'TOTAL-GLACELF-3L',
    name: 'Total Glacelf Kırmızı Organik Antifriz 3L',
    category: 'Sıvı & Katkı',
    brand: 'Total',
    quantity: 12,
    minQuantity: 4,
    unitCost: 320,
    unitPrice: 550,
    shelfLocation: 'Raf C-1',
    updatedAt: new Date().toISOString(),
  },
];

// Pre-defined Maintenance Packages
const initialPackages: MaintenancePackage[] = [
  {
    id: 'pkg-1',
    name: '10.000 KM Standart Periyodik Bakım',
    description: 'Motor yağı değişimi, 4 filtre yenileme ve 30 nokta genel emniyet kontrolü.',
    category: 'Periyodik Bakım',
    items: [
      { itemType: 'PARCA', name: 'Castrol Edge 5W-30 LL Motor Yağı 5L', quantity: 1, unitPrice: 1950, costPrice: 1400 },
      { itemType: 'PARCA', name: 'Orijinal Tipi Yağ Filtresi', quantity: 1, unitPrice: 480, costPrice: 280 },
      { itemType: 'PARCA', name: 'Hava Filtresi', quantity: 1, unitPrice: 550, costPrice: 320 },
      { itemType: 'PARCA', name: 'Karbonlu Polen Filtresi', quantity: 1, unitPrice: 650, costPrice: 380 },
      { itemType: 'ISCILIK', name: 'Periyodik Bakım ve Genel Emniyet Kontrolü İşçiliği', quantity: 1, unitPrice: 1500, costPrice: 0 },
    ],
  },
  {
    id: 'pkg-2',
    name: 'Ön Takım & Fren Sistemi Yenileme',
    description: 'Ön fren balata ve disk değişimi, fren hidrolik sıvısı ve kaliper temizliği.',
    category: 'Fren Sistemi',
    items: [
      { itemType: 'PARCA', name: 'Bosch Ön Fren Balata Takımı', quantity: 1, unitPrice: 1900, costPrice: 1300 },
      { itemType: 'PARCA', name: 'Ön Fren Disk Takımı (Hava Soğutmalı)', quantity: 1, unitPrice: 3400, costPrice: 2400 },
      { itemType: 'PARCA', name: 'DOT-4 Fren Hidrolik Sıvısı 1L', quantity: 1, unitPrice: 450, costPrice: 250 },
      { itemType: 'ISCILIK', name: 'Fren Balata, Disk Montajı ve Hidrolik Havası Alma', quantity: 1, unitPrice: 1400, costPrice: 0 },
    ],
  },
  {
    id: 'pkg-3',
    name: 'Ağır Bakım (Triger Seti & Devridaim)',
    description: 'Triger kayışı, gergi rulmanları, devridaim su pompası ve kırmızı organik antifriz değişimi.',
    category: 'Motor Mekanik',
    items: [
      { itemType: 'PARCA', name: 'Gates / Dayco Triger Kayış & Gergi Seti', quantity: 1, unitPrice: 4800, costPrice: 3500 },
      { itemType: 'PARCA', name: 'Devridaim Su Pompası', quantity: 1, unitPrice: 2600, costPrice: 1800 },
      { itemType: 'PARCA', name: 'Organik Kırmızı Antifriz 3L', quantity: 1, unitPrice: 550, costPrice: 320 },
      { itemType: 'ISCILIK', name: 'Triger ve Devridaim Değişim İşçiliği', quantity: 1, unitPrice: 3500, costPrice: 0 },
    ],
  },
];

// Initial Customers
const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'Ahmet Yılmaz',
    phone: '0532 111 22 33',
    email: 'ahmet.yilmaz@email.com',
    address: 'Kadıköy, İstanbul',
    balance: 1500,
    notes: 'Devamlı müşteri, filo araçları da var.',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'cust-2',
    fullName: 'Burak Demir',
    phone: '0544 222 33 44',
    email: 'burak.demir@email.com',
    address: 'Ümraniye, İstanbul',
    balance: 0,
    notes: 'Hassas müşteri, orijinal parça tercih ediyor.',
    createdAt: '2026-02-01T11:30:00Z',
  },
  {
    id: 'cust-3',
    fullName: 'Fatma Şahin',
    phone: '0555 333 44 55',
    email: 'fatma.sahin@email.com',
    address: 'Beşiktaş, İstanbul',
    balance: 0,
    notes: 'Periyodik bakım hatırlatması WhatsApp ile iletilsin.',
    createdAt: '2026-02-20T14:15:00Z',
  },
];

// Initial Vehicles
const initialVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    customerId: 'cust-1',
    plate: '34VR4821',
    brand: 'Volkswagen',
    model: 'Passat 1.6 TDI B8',
    year: 2018,
    currentKm: 148500,
    vin: 'WVWZZZ3CZJE123456',
    engineNo: 'DCX12345',
    fuelType: 'Dizel',
    color: 'Füme',
    notes: 'DSG kavrama 110.000 kmde değişti.',
    createdAt: '2026-01-15T10:05:00Z',
  },
  {
    id: 'veh-2',
    customerId: 'cust-2',
    plate: '34ABC789',
    brand: 'Renault',
    model: 'Megane 4 1.5 dCi',
    year: 2020,
    currentKm: 89000,
    vin: 'VF1RFB00123456789',
    fuelType: 'Dizel',
    color: 'Beyaz',
    notes: 'Triger seti kontrol edilecek.',
    createdAt: '2026-02-01T11:35:00Z',
  },
  {
    id: 'veh-3',
    customerId: 'cust-3',
    plate: '06FS5522',
    brand: 'Toyota',
    model: 'Corolla 1.8 Hybrid',
    year: 2021,
    currentKm: 54000,
    vin: 'NMTBZ3BE123456789',
    fuelType: 'Hibrit',
    color: 'Gümüş Gri',
    notes: 'Bakım zamanı yaklaşıyor.',
    createdAt: '2026-02-20T14:20:00Z',
  },
];

// Initial Service Records
const initialRecords: ServiceRecord[] = [
  {
    id: 'srv-1',
    vehicleId: 'veh-1',
    customerId: 'cust-1',
    technicianId: 'tech-1',
    entryDate: '2026-02-10T09:00:00Z',
    exitDate: '2026-02-10T16:00:00Z',
    entryKm: 145000,
    complaint: '145.000 km periyodik yağ ve filtre bakımı, ön takım kontrolü.',
    diagnosis: 'Yağ ve tüm filtreler değiştirildi. Ön sağ salıncak burcunda hafif boşluk var.',
    intakeChecklist: {
      fuelLevel: '1/2',
      hasSpareTire: true,
      hasJackAndTools: true,
      existingDamages: 'Ön tampon sağ altta hafif sürtme izi mevcut.',
    },
    status: 'TESLIM_EDILDI',
    partsTotal: 4800,
    laborTotal: 1500,
    discount: 300,
    grandTotal: 6000,
    paidAmount: 4500,
    paymentStatus: 'KISMI_ODENDI',
    paymentMethod: 'KREDI_KARTI',
    technicianNotes: 'Kalan 1500 TL sonraki ay başında ödenecek.',
    createdAt: '2026-02-10T09:15:00Z',
    items: [
      {
        id: 'itm-1',
        serviceRecordId: 'srv-1',
        itemType: 'PARCA',
        name: 'Castrol Edge 5W-30 LL Motor Yağı 5L',
        quantity: 1,
        unitPrice: 1850,
        costPrice: 1350,
        totalPrice: 1850,
        warrantyMonths: 12,
      },
      {
        id: 'itm-2',
        serviceRecordId: 'srv-1',
        itemType: 'PARCA',
        name: 'Mann Filtre Seti (Yağ, Hava, Polen, Yakıt)',
        quantity: 1,
        unitPrice: 2950,
        costPrice: 2100,
        totalPrice: 2950,
        warrantyMonths: 12,
      },
      {
        id: 'itm-3',
        serviceRecordId: 'srv-1',
        itemType: 'ISCILIK',
        name: 'Periyodik Bakım ve Genel Kontrol İşçiliği',
        quantity: 1,
        unitPrice: 1500,
        costPrice: 0,
        totalPrice: 1500,
        warrantyMonths: 6,
      },
    ],
  },
  {
    id: 'srv-2',
    vehicleId: 'veh-2',
    customerId: 'cust-2',
    technicianId: 'tech-2',
    entryDate: '2026-11-08T08:30:00Z',
    entryKm: 89000,
    complaint: 'Frenlerden ötme sesi geliyor, vites geçişlerinde titreme.',
    diagnosis: 'Ön ve arka fren balataları bitmiş, diskler taşlandı.',
    intakeChecklist: {
      fuelLevel: '3/4',
      hasSpareTire: true,
      hasJackAndTools: true,
      existingDamages: 'Sağ arka çamurlukta göçük düzeltme izi var.',
    },
    status: 'ISLEMDE',
    partsTotal: 3400,
    laborTotal: 1200,
    discount: 0,
    grandTotal: 4600,
    paidAmount: 0,
    paymentStatus: 'BEKLIYOR',
    technicianNotes: 'Diskler torna tezgahında düzeltildi, montaj devam ediyor.',
    createdAt: '2026-11-08T08:45:00Z',
    items: [
      {
        id: 'itm-4',
        serviceRecordId: 'srv-2',
        itemType: 'PARCA',
        name: 'Bosch Ön Fren Balata Takımı',
        quantity: 1,
        unitPrice: 1900,
        costPrice: 1400,
        totalPrice: 1900,
        warrantyMonths: 6,
      },
      {
        id: 'itm-5',
        serviceRecordId: 'srv-2',
        itemType: 'PARCA',
        name: 'Bosch Arka Fren Balata Takımı',
        quantity: 1,
        unitPrice: 1500,
        costPrice: 1050,
        totalPrice: 1500,
        warrantyMonths: 6,
      },
      {
        id: 'itm-6',
        serviceRecordId: 'srv-2',
        itemType: 'ISCILIK',
        name: 'Ön-Arka Fren Balata Değişimi & Disk Taşlama İşçiliği',
        quantity: 1,
        unitPrice: 1200,
        costPrice: 0,
        totalPrice: 1200,
        warrantyMonths: 6,
      },
    ],
  },
];

// Initial Reminders
const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    vehicleId: 'veh-1',
    customerId: 'cust-1',
    type: 'YAG_BAKIMI',
    title: 'Periyodik Bakım (155.000 KM / 1 Yıl)',
    targetDate: '2026-11-15',
    targetKm: 155000,
    lastServiceKm: 145000,
    status: 'YAKLASAN',
    notes: 'Tahmini bakım zamanı geldi, WhatsApp ile hatırlatma yapılabilir.',
    createdAt: '2026-02-10T16:00:00Z',
  },
  {
    id: 'rem-2',
    vehicleId: 'veh-3',
    customerId: 'cust-3',
    type: 'MUAYENE',
    title: 'TÜVTÜRK Araç Muayenesi',
    targetDate: '2026-11-20',
    status: 'YAKLASAN',
    notes: 'Muayene öncesi far ayarı ve fren testi yapılmalı.',
    createdAt: '2026-02-20T14:20:00Z',
  },
];

// Initial Cash Transactions
const initialCashTransactions: CashTransaction[] = [
  {
    id: 'csh-1',
    date: '2026-02-10T16:05:00Z',
    type: 'GELIR',
    category: 'SERVIS_TAHSILAT',
    amount: 4500,
    paymentMethod: 'KREDI_KARTI',
    description: '34VR4821 - Periyodik Bakım Tahsilatı (Ahmet Yılmaz)',
    relatedServiceId: 'srv-1',
    relatedCustomerId: 'cust-1',
  },
  {
    id: 'csh-2',
    date: '2026-11-05T10:00:00Z',
    type: 'GIDER',
    category: 'PARCA_ALIMI',
    amount: 8500,
    paymentMethod: 'HAVALE',
    description: 'Öztürk Oto Parça - 10 Teneke Castrol Yağ ve Filtre Alımı',
  },
  {
    id: 'csh-3',
    date: '2026-11-01T09:00:00Z',
    type: 'GIDER',
    category: 'KIRA_VE_AIDAT',
    amount: 15000,
    paymentMethod: 'HAVALE',
    description: 'Kasım Ayı Atölye Kirası',
  },
];

class StorageService {
  private initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(initialVehicles));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(initialRecords));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(initialStockItems));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(initialPackages));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(initialTechnicians));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(initialCashTransactions));
    }
  }

  constructor() {
    this.initStorage();
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  }

  getCustomer(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  saveCustomer(customer: Customer): Customer {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    return customer;
  }

  deleteCustomer(id: string): boolean {
    const list = this.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    return true;
  }

  // --- Vehicles ---
  getVehicles(): Vehicle[] {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  }

  getVehicle(id: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.id === id);
  }

  getVehicleByPlate(plate: string): Vehicle | undefined {
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    return this.getVehicles().find(v => v.plate.replace(/\s+/g, '').toUpperCase() === clean);
  }

  getVehiclesByCustomer(customerId: string): Vehicle[] {
    return this.getVehicles().filter(v => v.customerId === customerId);
  }

  saveVehicle(vehicle: Vehicle): Vehicle {
    const list = this.getVehicles();
    vehicle.plate = vehicle.plate.replace(/\s+/g, '').toUpperCase();
    const index = list.findIndex(v => v.id === vehicle.id);
    if (index >= 0) {
      list[index] = vehicle;
    } else {
      list.unshift(vehicle);
    }
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    return vehicle;
  }

  deleteVehicle(id: string): boolean {
    const list = this.getVehicles().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    return true;
  }

  // --- Technicians ---
  getTechnicians(): Technician[] {
    const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return data ? JSON.parse(data) : [];
  }

  saveTechnician(tech: Technician): Technician {
    const list = this.getTechnicians();
    const index = list.findIndex(t => t.id === tech.id);
    if (index >= 0) list[index] = tech;
    else list.push(tech);
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(list));
    return tech;
  }

  // --- Maintenance Packages ---
  getPackages(): MaintenancePackage[] {
    const data = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    return data ? JSON.parse(data) : [];
  }

  savePackage(pkg: MaintenancePackage): MaintenancePackage {
    const list = this.getPackages();
    const index = list.findIndex(p => p.id === pkg.id);
    if (index >= 0) list[index] = pkg;
    else list.push(pkg);
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(list));
    return pkg;
  }

  // --- Spare Parts Stock ---
  getStockItems(): StockItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
    return data ? JSON.parse(data) : [];
  }

  getStockItem(id: string): StockItem | undefined {
    return this.getStockItems().find(s => s.id === id);
  }

  saveStockItem(item: StockItem): StockItem {
    const list = this.getStockItems();
    item.updatedAt = new Date().toISOString();
    const index = list.findIndex(s => s.id === item.id);
    if (index >= 0) list[index] = item;
    else list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
    return item;
  }

  deleteStockItem(id: string): boolean {
    const list = this.getStockItems().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
    return true;
  }

  getLowStockItems(): StockItem[] {
    return this.getStockItems().filter(s => s.quantity <= s.minQuantity);
  }

  deductStock(stockId: string, quantityToDeduct: number) {
    const list = this.getStockItems();
    const item = list.find(s => s.id === stockId);
    if (item) {
      item.quantity = Math.max(0, item.quantity - quantityToDeduct);
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
    }
  }

  // --- Cash & Register Transactions ---
  getCashTransactions(): CashTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  saveCashTransaction(tx: CashTransaction): CashTransaction {
    const list = this.getCashTransactions();
    const index = list.findIndex(t => t.id === tx.id);
    if (index >= 0) list[index] = tx;
    else list.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(list));
    return tx;
  }

  deleteCashTransaction(id: string): boolean {
    const list = this.getCashTransactions().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(list));
    return true;
  }

  // --- Service Records ---
  getServiceRecords(): ServiceRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS);
    return data ? JSON.parse(data) : [];
  }

  getServiceRecord(id: string): ServiceRecord | undefined {
    return this.getServiceRecords().find(r => r.id === id);
  }

  getRecordsByVehicle(vehicleId: string): ServiceRecord[] {
    return this.getServiceRecords()
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }

  saveServiceRecord(record: ServiceRecord): ServiceRecord {
    const list = this.getServiceRecords();
    const isNew = !list.some(r => r.id === record.id);
    const index = list.findIndex(r => r.id === record.id);
    
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(list));

    // Update vehicle's current KM
    const vehicle = this.getVehicle(record.vehicleId);
    if (vehicle && record.entryKm > vehicle.currentKm) {
      vehicle.currentKm = record.entryKm;
      this.saveVehicle(vehicle);
    }

    // Auto calculate customer balance
    const customer = this.getCustomer(record.customerId);
    if (customer) {
      const customerRecords = list.filter(r => r.customerId === customer.id);
      const totalDebt = customerRecords.reduce((sum, r) => {
        return sum + Math.max(0, r.grandTotal - (r.paidAmount || 0));
      }, 0);
      customer.balance = totalDebt;
      this.saveCustomer(customer);
    }

    // Deduct stock for parts selected from inventory
    if (isNew && record.items) {
      record.items.forEach(it => {
        if (it.stockItemId) {
          this.deductStock(it.stockItemId, it.quantity);
        }
      });
    }

    // If paid amount > 0, log into cashbook if new
    if (isNew && record.paidAmount > 0) {
      const plate = vehicle?.plate || '';
      const custName = customer?.fullName || '';
      this.saveCashTransaction({
        id: `csh-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'GELIR',
        category: 'SERVIS_TAHSILAT',
        amount: record.paidAmount,
        paymentMethod: record.paymentMethod === 'KREDI_KARTI' ? 'KREDI_KARTI' : record.paymentMethod === 'HAVALE' ? 'HAVALE' : 'NAKIT',
        description: `${plate} Servis Tahsilatı - ${custName}`,
        relatedServiceId: record.id,
        relatedCustomerId: record.customerId,
      });
    }

    // Generate automatic maintenance reminder
    this.createAutomaticReminderForRecord(record);

    return record;
  }

  private createAutomaticReminderForRecord(record: ServiceRecord) {
    const settings = this.getSettings();
    const targetKm = record.entryKm + (settings.defaultOilPeriodKm || 10000);
    
    const entryDate = new Date(record.entryDate);
    const targetDate = new Date(entryDate.getTime() + (settings.defaultOilPeriodDays || 365) * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const reminder: Reminder = {
      id: `rem-auto-${Date.now()}`,
      vehicleId: record.vehicleId,
      customerId: record.customerId,
      type: 'YAG_BAKIMI',
      title: `Periyodik Bakım (${targetKm.toLocaleString('tr-TR')} KM / 1 Yıl)`,
      targetDate: targetDateStr,
      targetKm: targetKm,
      lastServiceKm: record.entryKm,
      status: 'YAKLASAN',
      notes: `Son bakım ${record.entryKm.toLocaleString('tr-TR')} km'de yapıldı.`,
      createdAt: new Date().toISOString(),
    };

    this.saveReminder(reminder);
  }

  // --- Reminders ---
  getReminders(): Reminder[] {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return data ? JSON.parse(data) : [];
  }

  saveReminder(reminder: Reminder): Reminder {
    const list = this.getReminders();
    const index = list.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      list[index] = reminder;
    } else {
      list.unshift(reminder);
    }
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    return reminder;
  }

  deleteReminder(id: string): boolean {
    const list = this.getReminders().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    return true;
  }

  // --- Settings ---
  getSettings(): ShopSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : defaultSettings;
  }

  saveSettings(settings: ShopSettings): ShopSettings {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  // --- WhatsApp URL Helper ---
  generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('90')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '90' + cleanPhone.substring(1)
      : '90' + cleanPhone;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  // --- Backup & Restore ---
  exportBackup(): string {
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      customers: this.getCustomers(),
      vehicles: this.getVehicles(),
      serviceRecords: this.getServiceRecords(),
      reminders: this.getReminders(),
      stockItems: this.getStockItems(),
      packages: this.getPackages(),
      technicians: this.getTechnicians(),
      cashTransactions: this.getCashTransactions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers && data.vehicles) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
        localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(data.vehicles));
        localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(data.serviceRecords || []));
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders || []));
        if (data.stockItems) localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(data.stockItems));
        if (data.packages) localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages));
        if (data.technicians) localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(data.technicians));
        if (data.cashTransactions) localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(data.cashTransactions));
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }

  // --- Dashboard Aggregates ---
  getDashboardStats() {
    const customers = this.getCustomers();
    const vehicles = this.getVehicles();
    const records = this.getServiceRecords();
    const reminders = this.getReminders();
    const lowStock = this.getLowStockItems();
    const cash = this.getCashTransactions();

    const activeServices = records.filter(r => r.status === 'ISLEMDE' || r.status === 'KABUL_EDILDI' || r.status === 'PARCA_BEKLENIYOR');
    const totalReceivables = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
    const totalRevenue = records.reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    const totalIncome = cash.filter(c => c.type === 'GELIR').reduce((s, c) => s + c.amount, 0);
    const totalExpense = cash.filter(c => c.type === 'GIDER').reduce((s, c) => s + c.amount, 0);
    const netCashBalance = totalIncome - totalExpense;

    return {
      customerCount: customers.length,
      vehicleCount: vehicles.length,
      activeServiceCount: activeServices.length,
      totalReceivables,
      totalRevenue,
      remindersCount: reminders.length,
      lowStockCount: lowStock.length,
      totalIncome,
      totalExpense,
      netCashBalance,
      recentRecords: records.slice(0, 5),
    };
  }
}

export const storage = new StorageService();
