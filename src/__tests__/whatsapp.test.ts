import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatPhoneNumber, buildWhatsAppUrl, createMaintenanceReminderMessage } from '../utils/whatsapp.ts';
import { storage } from '../services/storage.ts';

describe('WhatsApp Integration & URL Formatting Tests', () => {
  describe('formatPhoneNumber() - Normalization to 90... Format', () => {
    it('should format standard 11-digit Turkish mobile numbers starting with 0', () => {
      assert.equal(formatPhoneNumber('0532 111 22 33'), '905321112233');
      assert.equal(formatPhoneNumber('0544-222-33-44'), '905322223344'.replace('532', '544'));
      assert.equal(formatPhoneNumber('(0555) 333 44 55'), '905553334455');
    });

    it('should format 10-digit numbers starting without leading zero', () => {
      assert.equal(formatPhoneNumber('5321112233'), '905321112233');
      assert.equal(formatPhoneNumber('544 222 33 44'), '905442223344');
    });

    it('should preserve numbers already prefixed with 90', () => {
      assert.equal(formatPhoneNumber('905321112233'), '905321112233');
      assert.equal(formatPhoneNumber('+90 532 111 22 33'), '905321112233');
      assert.equal(formatPhoneNumber('+90 (544) 222-33-44'), '905442223344');
    });

    it('should handle falsy or empty phone numbers gracefully', () => {
      assert.equal(formatPhoneNumber(''), '');
      assert.equal(formatPhoneNumber(null), '');
      assert.equal(formatPhoneNumber(undefined), '');
      assert.equal(formatPhoneNumber('   '), '');
      assert.equal(formatPhoneNumber('no-digits-here'), '');
    });
  });

  describe('buildWhatsAppUrl() - URL Encoding & Turkish Characters', () => {
    it('should generate valid wa.me URL with properly encoded message text', () => {
      const url = buildWhatsAppUrl('0532 111 22 33', 'Merhaba Dünya!');
      assert.equal(url, 'https://wa.me/905321112233?text=Merhaba%20D%C3%BCnya!');
    });

    it('should correctly percent-encode all Turkish characters (ş, ğ, ı, ö, ü, ç, İ, Ş, Ğ, Ö, Ü, Ç)', () => {
      const turkishText = 'Çalışma saatleri: Öğlen 12:00. Şoförümüz hazır!';
      const url = buildWhatsAppUrl('0532 111 22 33', turkishText);

      // Verify wa.me prefix and phone
      assert.ok(url.startsWith('https://wa.me/905321112233?text='));

      // Verify decoded parameter matches original Turkish text exactly
      const parsedUrl = new URL(url);
      const textParam = parsedUrl.searchParams.get('text');
      assert.equal(textParam, turkishText);
    });

    it('should properly encode multiline newlines (\\n -> %0A) and punctuation', () => {
      const multilineMsg = 'Sayın Müşteri,\nAracınız servise kabul edilmiştir.\nİyi günler.';
      const url = buildWhatsAppUrl('0544 222 33 44', multilineMsg);

      assert.ok(url.includes('%0A'));
      const parsedUrl = new URL(url);
      assert.equal(parsedUrl.searchParams.get('text'), multilineMsg);
    });
  });

  describe('createMaintenanceReminderMessage() - Template Generation', () => {
    it('should create complete reminder message with customer name and target KM', () => {
      const message = createMaintenanceReminderMessage({
        shopName: 'GÜVEN OTO',
        customerName: 'Ahmet Yılmaz',
        plate: '34VR4821',
        title: 'Periyodik Yağ Bakımı',
        targetKm: 155000,
      });

      assert.ok(message.includes('Sayın Ahmet Yılmaz'));
      assert.ok(message.includes('GÜVEN OTO'));
      assert.ok(message.includes('34VR4821'));
      assert.ok(message.includes('155.000 KM') || message.includes('155000 KM'));
      assert.ok(message.includes('Periyodik Yağ Bakımı'));
    });

    it('should create general reminder message when customer name is not provided', () => {
      const message = createMaintenanceReminderMessage({
        shopName: 'GÜVEN OTO',
        plate: '34ABC789',
        title: 'Fren Balata Değişimi',
      });

      assert.ok(message.startsWith('Merhaba,\n'));
      assert.ok(message.includes('34ABC789'));
    });
  });

  describe('Storage.generateWhatsAppLink() Service Method Integration', () => {
    it('should match storage service implementation output', () => {
      const link1 = storage.generateWhatsAppLink('0532 111 22 33', 'Bakım Zamanı Geldi');
      assert.equal(link1, 'https://wa.me/905321112233?text=Bak%C4%B1m%20Zaman%C4%B1%20Geldi');

      const link2 = storage.generateWhatsAppLink('+90 544 999 88 77', 'Test');
      assert.equal(link2, 'https://wa.me/905449998877?text=Test');
    });
  });
});
