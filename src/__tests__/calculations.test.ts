import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateServiceTotals, 
  calculateCustomerBalance, 
  calculateCashFlow, 
  calculateNextMaintenance,
  type ServiceItemCalc 
} from '../utils/calculations.ts';

describe('Service Calculations & Financial Invariants Tests', () => {
  describe('calculateServiceTotals() - Parts, Labor, Discount & Grand Total', () => {
    it('should calculate standard parts and labor totals correctly', () => {
      const items: ServiceItemCalc[] = [
        { itemType: 'PARCA', quantity: 2, unitPrice: 1500 }, // 3000
        { itemType: 'PARCA', quantity: 1, unitPrice: 850 },  // 850
        { itemType: 'ISCILIK', quantity: 1, unitPrice: 1200 }, // 1200
      ];

      const result = calculateServiceTotals(items, 350);

      assert.equal(result.partsTotal, 3850);
      assert.equal(result.laborTotal, 1200);
      assert.equal(result.subTotal, 5050);
      assert.equal(result.discount, 350);
      assert.equal(result.grandTotal, 4700);
    });

    it('should handle zero items gracefully with zero totals', () => {
      const result = calculateServiceTotals([], 0);
      assert.equal(result.partsTotal, 0);
      assert.equal(result.laborTotal, 0);
      assert.equal(result.subTotal, 0);
      assert.equal(result.grandTotal, 0);
    });

    it('should clamp grandTotal to zero when discount exceeds subtotal (no negative invoice)', () => {
      const items: ServiceItemCalc[] = [
        { itemType: 'PARCA', quantity: 1, unitPrice: 1000 },
        { itemType: 'ISCILIK', quantity: 1, unitPrice: 500 },
      ];
      // Subtotal = 1500, Discount = 2500 -> GrandTotal should be 0, not -1000
      const result = calculateServiceTotals(items, 2500);

      assert.equal(result.subTotal, 1500);
      assert.equal(result.grandTotal, 0, 'Grand total must never be negative');
    });

    it('should treat negative discount as zero (cannot inflate price with negative discount)', () => {
      const items: ServiceItemCalc[] = [
        { itemType: 'PARCA', quantity: 1, unitPrice: 2000 },
      ];
      const result = calculateServiceTotals(items, -500);

      assert.equal(result.discount, 0, 'Negative discount must be clamped to 0');
      assert.equal(result.grandTotal, 2000);
    });

    it('should protect against negative quantity and negative unitPrice', () => {
      const items: ServiceItemCalc[] = [
        { itemType: 'PARCA', quantity: -3, unitPrice: 1000 },
        { itemType: 'ISCILIK', quantity: 1, unitPrice: -500 },
      ];
      const result = calculateServiceTotals(items, 0);

      assert.equal(result.partsTotal, 0, 'Negative quantity should be clamped to 0');
      assert.equal(result.laborTotal, 0, 'Negative unit price should be clamped to 0');
      assert.equal(result.grandTotal, 0);
    });

    it('should handle floating-point decimals accurately without IEEE 754 precision artifacts', () => {
      const items: ServiceItemCalc[] = [
        { itemType: 'PARCA', quantity: 3, unitPrice: 19.99 }, // 59.97
        { itemType: 'ISCILIK', quantity: 1, unitPrice: 40.05 }, // 40.05
      ];
      // 59.97 + 40.05 = 100.02
      const result = calculateServiceTotals(items, 10.01);

      assert.equal(result.subTotal, 100.02);
      assert.equal(result.grandTotal, 90.01);
    });
  });

  describe('calculateCustomerBalance() - Debt & Receivable Invariants', () => {
    it('should calculate customer unpaid balance accurately across multiple service records', () => {
      const records = [
        { customerId: 'cust-calc-1', grandTotal: 5000, paidAmount: 2000 }, // 3000 debt
        { customerId: 'cust-calc-1', grandTotal: 3500, paidAmount: 3500 }, // 0 debt
        { customerId: 'cust-calc-1', grandTotal: 1500, paidAmount: 0 },    // 1500 debt
        { customerId: 'cust-OTHER', grandTotal: 8000, paidAmount: 0 },     // Other customer
      ];

      const balance = calculateCustomerBalance(records, 'cust-calc-1');
      assert.equal(balance, 4500, 'Total customer debt must be 3000 + 1500 = 4500 TL');
    });

    it('should return 0 balance when all records are fully paid', () => {
      const records = [
        { customerId: 'cust-clean', grandTotal: 4000, paidAmount: 4000 },
        { customerId: 'cust-clean', grandTotal: 2500, paidAmount: 2500 },
      ];

      const balance = calculateCustomerBalance(records, 'cust-clean');
      assert.equal(balance, 0);
    });

    it('should clamp record balance to 0 if paidAmount is greater than grandTotal', () => {
      const records = [
        { customerId: 'cust-overpay', grandTotal: 1000, paidAmount: 1500 }, // +500 tip / overpay
      ];

      const balance = calculateCustomerBalance(records, 'cust-overpay');
      assert.equal(balance, 0, 'Customer debt balance must never be negative');
    });

    it('should return 0 for a customer with no service records', () => {
      const balance = calculateCustomerBalance([], 'cust-none');
      assert.equal(balance, 0);
    });
  });

  describe('calculateCashFlow() - Revenue, Expense & Net Balance', () => {
    it('should correctly calculate income, expense, and positive net cash balance', () => {
      const transactions = [
        { type: 'GELIR' as const, amount: 15000 },
        { type: 'GELIR' as const, amount: 7500 },
        { type: 'GIDER' as const, amount: 8000 },
        { type: 'GIDER' as const, amount: 4500 },
      ];

      const result = calculateCashFlow(transactions);

      assert.equal(result.totalIncome, 22500);
      assert.equal(result.totalExpense, 12500);
      assert.equal(result.netBalance, 10000, 'Net cash should be 22500 - 12500 = 10000');
    });

    it('should handle negative net balance (cash deficit / net loss)', () => {
      const transactions = [
        { type: 'GELIR' as const, amount: 5000 },
        { type: 'GIDER' as const, amount: 12000 },
      ];

      const result = calculateCashFlow(transactions);

      assert.equal(result.totalIncome, 5000);
      assert.equal(result.totalExpense, 12000);
      assert.equal(result.netBalance, -7000, 'Net balance should accurately reflect deficit');
    });

    it('should handle empty cash transactions list', () => {
      const result = calculateCashFlow([]);
      assert.equal(result.totalIncome, 0);
      assert.equal(result.totalExpense, 0);
      assert.equal(result.netBalance, 0);
    });
  });

  describe('calculateNextMaintenance() - Target KM and Target Date Forecast', () => {
    it('should calculate target KM and date using default periods (10,000 KM / 365 days)', () => {
      const entryKm = 100000;
      const entryDate = '2026-01-01T00:00:00Z';

      const forecast = calculateNextMaintenance(entryKm, entryDate);

      assert.equal(forecast.targetKm, 110000);
      assert.equal(forecast.targetDate, '2027-01-01');
    });

    it('should support customized maintenance periods (e.g. 15,000 KM / 180 days)', () => {
      const entryKm = 75000;
      const entryDate = '2026-06-01T00:00:00Z';

      const forecast = calculateNextMaintenance(entryKm, entryDate, 15000, 180);

      assert.equal(forecast.targetKm, 90000);
      
      const expectedDate = new Date(new Date(entryDate).getTime() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      assert.equal(forecast.targetDate, expectedDate);
    });
  });
});
