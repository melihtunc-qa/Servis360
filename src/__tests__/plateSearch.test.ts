import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlate, formatPlateDisplay, matchPlateSearch } from '../utils/plate.ts';
import { storage } from '../services/storage.ts';
import type { Vehicle } from '../types/index.ts';

describe('Plate Normalization & Search Tests', () => {
  describe('normalizePlate() Utility Function', () => {
    it('should strip internal, leading, and trailing whitespaces', () => {
      assert.equal(normalizePlate('  34  VR  4821  '), '34VR4821');
      assert.equal(normalizePlate(' 06 FS 5522 '), '06FS5522');
      assert.equal(normalizePlate('\t35\tABC\t123\n'), '35ABC123');
    });

    it('should convert lowercase letters to uppercase correctly', () => {
      assert.equal(normalizePlate('34abc789'), '34ABC789');
      assert.equal(normalizePlate('06fs5522'), '06FS5522');
    });

    it('should handle Turkish characters correctly during normalization', () => {
      // Türkçe i/İ ve ı/I dönüşümü
      assert.equal(normalizePlate('34 çşğ 123'), '34ÇŞĞ123');
    });

    it('should return empty string for falsy or empty inputs (null, undefined, empty string)', () => {
      assert.equal(normalizePlate(''), '');
      assert.equal(normalizePlate('   '), '');
      assert.equal(normalizePlate(null), '');
      assert.equal(normalizePlate(undefined), '');
    });
  });

  describe('formatPlateDisplay() Utility Function', () => {
    it('should format standard Turkish plates with proper spacing', () => {
      assert.equal(formatPlateDisplay('34VR4821'), '34 VR 4821');
      assert.equal(formatPlateDisplay('06FS5522'), '06 FS 5522');
      assert.equal(formatPlateDisplay('35ABC12'), '35 ABC 12');
      assert.equal(formatPlateDisplay('16A1234'), '16 A 1234');
    });

    it('should format messy input string gracefully', () => {
      assert.equal(formatPlateDisplay('  34  abc  789  '), '34 ABC 789');
    });

    it('should return original cleaned string if plate does not match standard 2-letter-num format', () => {
      assert.equal(formatPlateDisplay('CUSTOMPLATE'), 'CUSTOMPLATE');
      assert.equal(formatPlateDisplay(''), '');
    });
  });

  describe('matchPlateSearch() Fuzzy/Quick Search Matching', () => {
    it('should match plates regardless of casing or spacing differences', () => {
      const plate = '34 VR 4821';
      
      // Exact normalized match
      assert.equal(matchPlateSearch(plate, '34VR4821'), true);
      // Lowercase match
      assert.equal(matchPlateSearch(plate, '34vr4821'), true);
      // Spaces in query
      assert.equal(matchPlateSearch(plate, '34 vr 4821'), true);
      // Substring / partial match
      assert.equal(matchPlateSearch(plate, '4821'), true);
      assert.equal(matchPlateSearch(plate, 'vr'), true);
      assert.equal(matchPlateSearch(plate, '34V'), true);
    });

    it('should return false when query does not match plate', () => {
      const plate = '34VR4821';
      assert.equal(matchPlateSearch(plate, '06FS'), false);
      assert.equal(matchPlateSearch(plate, '9999'), false);
    });

    it('should handle edge cases (empty query, null plate, null query)', () => {
      assert.equal(matchPlateSearch('34VR4821', ''), true, 'Empty query should match all');
      assert.equal(matchPlateSearch(null, '34VR4821'), false);
      assert.equal(matchPlateSearch('34VR4821', null), false);
      assert.equal(matchPlateSearch('', '34VR4821'), false);
    });
  });

  describe('Storage Vehicle Plate Search Integration', () => {
    it('should find vehicles using storage.getVehicleByPlate with various inputs', () => {
      // veh-1 has plate '34VR4821'
      const foundDirect = storage.getVehicleByPlate('34VR4821');
      assert.ok(foundDirect);
      assert.equal(foundDirect.id, 'veh-1');

      // Lowercase with spaces
      const foundLowerSpaced = storage.getVehicleByPlate('  34  vr  4821 ');
      assert.ok(foundLowerSpaced);
      assert.equal(foundLowerSpaced.id, 'veh-1');

      // veh-2 has plate '34ABC789'
      const foundVeh2 = storage.getVehicleByPlate('34abc789');
      assert.ok(foundVeh2);
      assert.equal(foundVeh2.id, 'veh-2');

      // Non-existent plate
      const notFound = storage.getVehicleByPlate('99ZZZ999');
      assert.equal(notFound, undefined);
    });

    it('should filter an array of vehicles correctly using matchPlateSearch', () => {
      const mockVehicles: Vehicle[] = [
        { id: 'v1', customerId: 'c1', plate: '34VR4821', brand: 'VW', model: 'Passat', year: 2018, currentKm: 140000, fuelType: 'Dizel', createdAt: '' },
        { id: 'v2', customerId: 'c2', plate: '34ABC789', brand: 'Renault', model: 'Megane', year: 2020, currentKm: 80000, fuelType: 'Dizel', createdAt: '' },
        { id: 'v3', customerId: 'c3', plate: '06FS5522', brand: 'Toyota', model: 'Corolla', year: 2021, currentKm: 50000, fuelType: 'Hibrit', createdAt: '' },
      ];

      // Query '34' should return 2 vehicles
      const result34 = mockVehicles.filter(v => matchPlateSearch(v.plate, '34'));
      assert.equal(result34.length, 2);

      // Query 'fs' should return 1 vehicle ('06FS5522')
      const resultFS = mockVehicles.filter(v => matchPlateSearch(v.plate, 'fs'));
      assert.equal(resultFS.length, 1);
      assert.equal(resultFS[0].id, 'v3');

      // Query 'xyz' should return empty array
      const resultNone = mockVehicles.filter(v => matchPlateSearch(v.plate, 'xyz'));
      assert.equal(resultNone.length, 0);
    });
  });
});
