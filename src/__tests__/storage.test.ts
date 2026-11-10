import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { storage, defaultSettings } from '../services/storage.ts';
import { clearStorage } from './setup.ts';
import type { Customer, Vehicle, ServiceRecord, ShopSettings } from '../types/index.ts';

describe('Storage & Repository Integration Tests', () => {
  beforeEach(() => {
    clearStorage();
    // Re-initialize storage to default demo data
    (storage as any).initStorage();
  });

  describe('Initial Repository Initialization', () => {
    it('should initialize repository with baseline default entities', () => {
      const customers = storage.getCustomers();
      const vehicles = storage.getVehicles();
      const records = storage.getServiceRecords();
      const reminders = storage.getReminders();
      const settings = storage.getSettings();

      assert.ok(customers.length >= 3, 'Default customers should be loaded');
      assert.ok(vehicles.length >= 3, 'Default vehicles should be loaded');
      assert.ok(records.length >= 2, 'Default records should be loaded');
      assert.ok(reminders.length >= 2, 'Default reminders should be loaded');
      assert.equal(settings.shopName, defaultSettings.shopName);
      assert.equal(settings.defaultOilPeriodKm, 10000);
      assert.equal(settings.defaultOilPeriodDays, 365);
    });
  });

  describe('Customer CRUD and Balance Invariants', () => {
    it('should create, retrieve, update, and delete a customer', () => {
      const newCust: Customer = {
        id: 'cust-test-1',
        fullName: 'Mehmet Öz',
        phone: '0533 999 88 77',
        balance: 0,
        createdAt: new Date().toISOString(),
      };

      storage.saveCustomer(newCust);
      const retrieved = storage.getCustomer('cust-test-1');
      assert.ok(retrieved);
      assert.equal(retrieved.fullName, 'Mehmet Öz');

      // Update
      retrieved.fullName = 'Mehmet Özkan';
      retrieved.phone = '0533 111 22 33';
      storage.saveCustomer(retrieved);

      const updated = storage.getCustomer('cust-test-1');
      assert.equal(updated?.fullName, 'Mehmet Özkan');
      assert.equal(updated?.phone, '0533 111 22 33');

      // Delete
      const deleted = storage.deleteCustomer('cust-test-1');
      assert.equal(deleted, true);
      assert.equal(storage.getCustomer('cust-test-1'), undefined);
    });

    it('should update customer balance upon saving service records with partial payment', () => {
      const cust: Customer = {
        id: 'cust-debt-test',
        fullName: 'Ali Demir',
        phone: '0555 444 33 22',
        balance: 0,
        createdAt: new Date().toISOString(),
      };
      storage.saveCustomer(cust);

      const veh: Vehicle = {
        id: 'veh-debt-test',
        customerId: cust.id,
        plate: '34TEST01',
        brand: 'Ford',
        model: 'Focus',
        year: 2019,
        currentKm: 120000,
        fuelType: 'Dizel',
        createdAt: new Date().toISOString(),
      };
      storage.saveVehicle(veh);

      // Record 1: 5000 TL total, 3000 TL paid => 2000 TL debt
      const record1: ServiceRecord = {
        id: 'srv-debt-1',
        vehicleId: veh.id,
        customerId: cust.id,
        entryDate: '2026-03-01T10:00:00Z',
        entryKm: 121000,
        complaint: 'Periyodik Bakım',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 3000,
        laborTotal: 2000,
        discount: 0,
        grandTotal: 5000,
        paidAmount: 3000,
        paymentStatus: 'KISMI_ODENDI',
        createdAt: '2026-03-01T10:00:00Z',
      };

      storage.saveServiceRecord(record1);
      const custAfterRec1 = storage.getCustomer(cust.id);
      assert.equal(custAfterRec1?.balance, 2000, 'Customer debt should be 2000 TL');

      // Record 2: 4000 TL total, 1000 TL paid => +3000 TL debt => total 5000 TL debt
      const record2: ServiceRecord = {
        id: 'srv-debt-2',
        vehicleId: veh.id,
        customerId: cust.id,
        entryDate: '2026-04-01T10:00:00Z',
        entryKm: 123000,
        complaint: 'Ön Fren Balata',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 2500,
        laborTotal: 1500,
        discount: 0,
        grandTotal: 4000,
        paidAmount: 1000,
        paymentStatus: 'KISMI_ODENDI',
        createdAt: '2026-04-01T10:00:00Z',
      };

      storage.saveServiceRecord(record2);
      const custAfterRec2 = storage.getCustomer(cust.id);
      assert.equal(custAfterRec2?.balance, 5000, 'Customer debt should sum up to 5000 TL');

      // Pay off Record 1 completely
      record1.paidAmount = 5000;
      record1.paymentStatus = 'ODENDI';
      storage.saveServiceRecord(record1);

      const custAfterPayoff = storage.getCustomer(cust.id);
      assert.equal(custAfterPayoff?.balance, 3000, 'Customer debt should drop to 3000 TL');
    });

    it('should clamp customer debt to 0 if paidAmount exceeds grandTotal (no negative debt)', () => {
      const cust: Customer = {
        id: 'cust-overpay',
        fullName: 'Kemal Can',
        phone: '0544 555 66 77',
        balance: 0,
        createdAt: new Date().toISOString(),
      };
      storage.saveCustomer(cust);

      const veh: Vehicle = {
        id: 'veh-overpay',
        customerId: cust.id,
        plate: '34OVER99',
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        currentKm: 30000,
        fuelType: 'Benzin',
        createdAt: new Date().toISOString(),
      };
      storage.saveVehicle(veh);

      const overpaidRecord: ServiceRecord = {
        id: 'srv-overpay-1',
        vehicleId: veh.id,
        customerId: cust.id,
        entryDate: '2026-05-01T10:00:00Z',
        entryKm: 31000,
        complaint: 'Aksesuar Montajı',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 1000,
        laborTotal: 500,
        discount: 0,
        grandTotal: 1500,
        paidAmount: 2000, // Ödenen miktar toplamdan fazla
        paymentStatus: 'ODENDI',
        createdAt: '2026-05-01T10:00:00Z',
      };

      storage.saveServiceRecord(overpaidRecord);
      const customer = storage.getCustomer(cust.id);
      assert.equal(customer?.balance, 0, 'Customer debt must never be negative');
    });
  });

  describe('Vehicle KM Tracking and Plate Normalization', () => {
    it('should update vehicle currentKm when service entryKm is higher', () => {
      const veh: Vehicle = {
        id: 'veh-km-test',
        customerId: 'cust-1',
        plate: ' 34  ab  1234 ',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        currentKm: 50000,
        fuelType: 'Benzin',
        createdAt: new Date().toISOString(),
      };

      storage.saveVehicle(veh);
      const savedVeh = storage.getVehicle('veh-km-test');
      assert.equal(savedVeh?.plate, '34AB1234', 'Vehicle plate must be stripped of whitespace and capitalized');

      // Service with higher KM
      const record: ServiceRecord = {
        id: 'srv-km-update',
        vehicleId: veh.id,
        customerId: 'cust-1',
        entryDate: '2026-06-01T10:00:00Z',
        entryKm: 54500,
        complaint: 'KM Test Servisi',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 0,
        laborTotal: 0,
        discount: 0,
        grandTotal: 0,
        paidAmount: 0,
        paymentStatus: 'ODENDI',
        createdAt: '2026-06-01T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      const vehAfterService = storage.getVehicle(veh.id);
      assert.equal(vehAfterService?.currentKm, 54500, 'Vehicle KM must update to record entryKm');

      // Service with lower KM (e.g. historical entry) should not downgrade vehicle KM
      const oldRecord: ServiceRecord = {
        id: 'srv-km-old',
        vehicleId: veh.id,
        customerId: 'cust-1',
        entryDate: '2025-01-01T10:00:00Z',
        entryKm: 42000,
        complaint: 'Geçmiş Kayıt',
        status: 'TESLIM_EDILDI',
        items: [],
        partsTotal: 0,
        laborTotal: 0,
        discount: 0,
        grandTotal: 0,
        paidAmount: 0,
        paymentStatus: 'ODENDI',
        createdAt: '2025-01-01T10:00:00Z',
      };

      storage.saveServiceRecord(oldRecord);
      const vehAfterOldRecord = storage.getVehicle(veh.id);
      assert.equal(vehAfterOldRecord?.currentKm, 54500, 'Vehicle KM must not be downgraded by past records');
    });

    it('should find vehicle by plate with spaces and lowercase variants', () => {
      const match1 = storage.getVehicleByPlate('34 vr 4821');
      assert.ok(match1);
      assert.equal(match1.plate, '34VR4821');

      const match2 = storage.getVehicleByPlate('34VR4821');
      assert.ok(match2);
      assert.equal(match2.id, match1.id);

      const nonExistent = storage.getVehicleByPlate('99XYZ999');
      assert.equal(nonExistent, undefined);
    });
  });

  describe('Automatic Periodic Maintenance Reminder Algorithm', () => {
    it('should generate automatic reminder based on settings defaultOilPeriodKm and defaultOilPeriodDays', () => {
      const settings = storage.getSettings();
      settings.defaultOilPeriodKm = 15000;
      settings.defaultOilPeriodDays = 180;
      storage.saveSettings(settings);

      const initialReminderCount = storage.getReminders().length;

      const record: ServiceRecord = {
        id: 'srv-auto-rem-1',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-07-01T10:00:00Z',
        entryKm: 150000,
        complaint: 'Yağ Değişimi',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 1000,
        laborTotal: 500,
        discount: 0,
        grandTotal: 1500,
        paidAmount: 1500,
        paymentStatus: 'ODENDI',
        createdAt: '2026-07-01T10:00:00Z',
      };

      storage.saveServiceRecord(record);

      const reminders = storage.getReminders();
      assert.equal(reminders.length, initialReminderCount + 1, 'One reminder must be added');

      const newReminder = reminders[0]; // saved using unshift
      assert.equal(newReminder.vehicleId, 'veh-1');
      assert.equal(newReminder.customerId, 'cust-1');
      assert.equal(newReminder.type, 'YAG_BAKIMI');
      assert.equal(newReminder.targetKm, 150000 + 15000, 'Target KM must be entryKm + 15000');
      assert.equal(newReminder.status, 'YAKLASAN');

      // Check target date calculation (approx 180 days after 2026-07-01)
      const expectedTarget = new Date(new Date('2026-07-01T10:00:00Z').getTime() + 180 * 24 * 60 * 60 * 1000);
      const expectedDateStr = expectedTarget.toISOString().split('T')[0];
      assert.equal(newReminder.targetDate, expectedDateStr);
    });
  });

  describe('Backup & Restore (Export / Import)', () => {
    it('should export full database backup into valid JSON structure', () => {
      const backupJson = storage.exportBackup();
      assert.ok(typeof backupJson === 'string');

      const parsed = JSON.parse(backupJson);
      assert.equal(parsed.version, '2.0');
      assert.ok(parsed.exportDate);
      assert.ok(Array.isArray(parsed.customers));
      assert.ok(Array.isArray(parsed.vehicles));
      assert.ok(Array.isArray(parsed.serviceRecords));
      assert.ok(Array.isArray(parsed.reminders));
      assert.ok(Array.isArray(parsed.stockItems));
      assert.ok(Array.isArray(parsed.cashTransactions));
      assert.ok(parsed.settings);
    });

    it('should successfully restore full state from valid backup JSON', () => {
      const backupData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        customers: [
          { id: 'c-backup-1', fullName: 'Yedek Müşteri', phone: '0500 000 00 00', balance: 750, createdAt: '2026-01-01' },
        ],
        vehicles: [
          { id: 'v-backup-1', customerId: 'c-backup-1', plate: '34BKP01', brand: 'BMW', model: '320i', year: 2021, currentKm: 45000, fuelType: 'Benzin', createdAt: '2026-01-01' },
        ],
        serviceRecords: [],
        reminders: [],
        stockItems: [],
        packages: [],
        technicians: [],
        cashTransactions: [],
        settings: {
          shopName: 'YEDEK TEST SERVİS',
          ownerName: 'Usta Test',
          phone: '0500 111 22 33',
          address: 'Test Adres',
          city: 'İzmir',
          defaultOilPeriodKm: 12000,
          defaultOilPeriodDays: 300,
          footerNote: 'Test Garanti',
        },
      };

      const success = storage.importBackup(JSON.stringify(backupData));
      assert.equal(success, true, 'Import must return true on valid backup');

      const customers = storage.getCustomers();
      assert.equal(customers.length, 1);
      assert.equal(customers[0].fullName, 'Yedek Müşteri');

      const vehicles = storage.getVehicles();
      assert.equal(vehicles.length, 1);
      assert.equal(vehicles[0].plate, '34BKP01');

      const settings = storage.getSettings();
      assert.equal(settings.shopName, 'YEDEK TEST SERVİS');
      assert.equal(settings.defaultOilPeriodKm, 12000);
    });

    it('should reject invalid or corrupt JSON and return false without altering state', () => {
      const beforeCustomers = storage.getCustomers();

      const corruptResult = storage.importBackup('{ invalid-json, corrupt: true');
      assert.equal(corruptResult, false, 'Corrupt JSON string must return false');

      const missingFieldsResult = storage.importBackup(JSON.stringify({ someOtherField: 123 }));
      assert.equal(missingFieldsResult, false, 'Missing customers/vehicles must return false');

      const afterCustomers = storage.getCustomers();
      assert.equal(afterCustomers.length, beforeCustomers.length, 'Storage state must remain intact');
    });
  });
});
