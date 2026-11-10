import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../services/storage.ts';
import { clearStorage } from './setup.ts';
import type { StockItem, ServiceRecord } from '../types/index.ts';

describe('Inventory & Spare Parts Stock Management Tests', () => {
  beforeEach(() => {
    clearStorage();
    (storage as any).initStorage();
  });

  describe('Stock Item CRUD Operations', () => {
    it('should create a new stock item with accurate pricing and shelf info', () => {
      const newItem: StockItem = {
        id: 'stk-spark-plug',
        code: 'NGK-BKR6E',
        name: 'NGK Buji Takımı',
        category: 'Ateşleme',
        brand: 'NGK',
        quantity: 20,
        minQuantity: 5,
        unitCost: 120,
        unitPrice: 250,
        shelfLocation: 'Raf D-2',
        updatedAt: new Date().toISOString(),
      };

      storage.saveStockItem(newItem);
      const retrieved = storage.getStockItem('stk-spark-plug');
      assert.ok(retrieved, 'Item should be saved');
      assert.equal(retrieved.code, 'NGK-BKR6E');
      assert.equal(retrieved.quantity, 20);
      assert.equal(retrieved.shelfLocation, 'Raf D-2');
    });

    it('should update stock item quantity and price', () => {
      const item = storage.getStockItem('stk-1');
      assert.ok(item);
      const originalQuantity = item.quantity;

      item.quantity = originalQuantity + 10;
      item.unitPrice = 2100;
      storage.saveStockItem(item);

      const updated = storage.getStockItem('stk-1');
      assert.equal(updated?.quantity, originalQuantity + 10);
      assert.equal(updated?.unitPrice, 2100);
    });

    it('should delete a stock item successfully', () => {
      const deleteResult = storage.deleteStockItem('stk-5');
      assert.equal(deleteResult, true);
      assert.equal(storage.getStockItem('stk-5'), undefined);
    });
  });

  describe('Stock Deduction Mechanics', () => {
    it('should accurately deduct stock quantity when parts are used', () => {
      const item = storage.getStockItem('stk-1');
      assert.ok(item);
      const startQty = item.quantity;

      storage.deductStock('stk-1', 3);

      const updated = storage.getStockItem('stk-1');
      assert.equal(updated?.quantity, startQty - 3, 'Stock quantity should decrease by 3');
    });

    it('should clamp stock to zero and never allow negative inventory', () => {
      const item = storage.getStockItem('stk-4');
      assert.ok(item);
      // stk-4 initial quantity is 2
      assert.equal(item.quantity, 2);

      // Deduct more than available (5 items)
      storage.deductStock('stk-4', 5);

      const updated = storage.getStockItem('stk-4');
      assert.equal(updated?.quantity, 0, 'Stock quantity must never be negative, clamped to 0');
    });

    it('should handle deduction of non-existent item gracefully without errors', () => {
      assert.doesNotThrow(() => {
        storage.deductStock('stk-non-existent-999', 10);
      });
    });
  });

  describe('Service Record Integration with Stock Deduction', () => {
    it('should automatically deduct stock for all parts linked to a new service record', () => {
      // stk-1 has initial quantity 14
      // stk-2 has initial quantity 8
      const item1Before = storage.getStockItem('stk-1');
      const item2Before = storage.getStockItem('stk-2');
      assert.ok(item1Before && item2Before);

      const q1Before = item1Before.quantity;
      const q2Before = item2Before.quantity;

      const record: ServiceRecord = {
        id: `srv-deduct-${Date.now()}`,
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: new Date().toISOString(),
        entryKm: 150000,
        complaint: 'Stok Düşüm Testi',
        status: 'ISLEMDE',
        partsTotal: 4000,
        laborTotal: 1000,
        discount: 0,
        grandTotal: 5000,
        paidAmount: 5000,
        paymentStatus: 'ODENDI',
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'itm-s1',
            serviceRecordId: 'srv-deduct-1',
            stockItemId: 'stk-1',
            itemType: 'PARCA',
            name: 'Castrol Yağ 4L',
            quantity: 2,
            unitPrice: 1850,
            costPrice: 1350,
            totalPrice: 3700,
          },
          {
            id: 'itm-s2',
            serviceRecordId: 'srv-deduct-1',
            stockItemId: 'stk-2',
            itemType: 'PARCA',
            name: 'Motul Yağ 5L',
            quantity: 1,
            unitPrice: 2200,
            costPrice: 1600,
            totalPrice: 2200,
          },
          {
            id: 'itm-s3',
            serviceRecordId: 'srv-deduct-1',
            // No stockItemId - custom part / manual entry
            itemType: 'PARCA',
            name: 'Özel Dış Parça',
            quantity: 1,
            unitPrice: 500,
            costPrice: 300,
            totalPrice: 500,
          },
          {
            id: 'itm-s4',
            serviceRecordId: 'srv-deduct-1',
            itemType: 'ISCILIK',
            name: 'Usta İşçiliği',
            quantity: 1,
            unitPrice: 1000,
            costPrice: 0,
            totalPrice: 1000,
          },
        ],
      };

      storage.saveServiceRecord(record);

      const item1After = storage.getStockItem('stk-1');
      const item2After = storage.getStockItem('stk-2');

      assert.equal(item1After?.quantity, q1Before - 2, 'stk-1 quantity should be reduced by 2');
      assert.equal(item2After?.quantity, q2Before - 1, 'stk-2 quantity should be reduced by 1');
    });

    it('should not deduct stock again when an existing service record is edited / updated', () => {
      const item1 = storage.getStockItem('stk-1');
      assert.ok(item1);
      const qtyInitial = item1.quantity;

      const record: ServiceRecord = {
        id: 'srv-update-test',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: new Date().toISOString(),
        entryKm: 152000,
        complaint: 'İlk Kayıt',
        status: 'ISLEMDE',
        partsTotal: 1850,
        laborTotal: 500,
        discount: 0,
        grandTotal: 2350,
        paidAmount: 2350,
        paymentStatus: 'ODENDI',
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'itm-u1',
            serviceRecordId: 'srv-update-test',
            stockItemId: 'stk-1',
            itemType: 'PARCA',
            name: 'Castrol Yağ 4L',
            quantity: 1,
            unitPrice: 1850,
            costPrice: 1350,
            totalPrice: 1850,
          },
        ],
      };

      // 1. Initial save: Should deduct 1 item
      storage.saveServiceRecord(record);
      const qtyAfterFirstSave = storage.getStockItem('stk-1')?.quantity;
      assert.equal(qtyAfterFirstSave, qtyInitial - 1);

      // 2. Edit existing record (status changed to TAMAMLANDI)
      record.status = 'TAMAMLANDI';
      record.technicianNotes = 'İşlem tamamlandı, kontrol edildi.';
      storage.saveServiceRecord(record);

      const qtyAfterSecondSave = storage.getStockItem('stk-1')?.quantity;
      assert.equal(
        qtyAfterSecondSave,
        qtyAfterFirstSave,
        'Stock must not be deducted again when updating an existing record'
      );
    });
  });

  describe('Critical Low Stock Level Alarms', () => {
    it('should detect low stock items when quantity <= minQuantity', () => {
      const lowStockItems = storage.getLowStockItems();
      // In initial data: stk-4 has quantity 2 and minQuantity 4 (low stock)
      assert.ok(lowStockItems.length >= 1, 'Should find at least 1 low stock item initially');
      assert.ok(lowStockItems.some(i => i.id === 'stk-4'));
    });

    it('should trigger low stock alarm when quantity is exactly equal to minQuantity (boundary value)', () => {
      const item = storage.getStockItem('stk-3'); // Mann Yağ Filtresi, qty: 6, minQty: 5
      assert.ok(item);

      // Deduct 1 to make quantity exactly equal to minQuantity (5 == 5)
      storage.deductStock('stk-3', 1);

      const lowStockItems = storage.getLowStockItems();
      const stk3InAlarm = lowStockItems.find(i => i.id === 'stk-3');
      assert.ok(stk3InAlarm, 'Item must be in low stock list when quantity == minQuantity');
      assert.equal(stk3InAlarm.quantity, 5);
      assert.equal(stk3InAlarm.minQuantity, 5);
    });

    it('should clear low stock alarm when stock is replenished above minQuantity', () => {
      // stk-4 was critical (qty 2, min 4)
      const item = storage.getStockItem('stk-4');
      assert.ok(item);

      item.quantity = 10; // replenish
      storage.saveStockItem(item);

      const lowStockItems = storage.getLowStockItems();
      const stk4InAlarm = lowStockItems.find(i => i.id === 'stk-4');
      assert.equal(stk4InAlarm, undefined, 'Replenished item must not be in low stock list');
    });
  });
});
