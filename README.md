# Servis360 - Araç Bakım & Müşteri Takip Sistemi

Masaüstü için optimize edilmiş, offline-first (cihaz hafızasında çalışan), yüksek performanslı oto servis ve müşteri yönetim uygulaması.

---

## 🚀 Hızlı Başlangıç

### 1. Geliştirme Modunda Başlatma
Uygulamayı tarayıcıda masaüstü çözünürlüğünde anında çalıştırmak için:
```bash
npm run dev
```
Uygulama `http://localhost:1420` adresinde açılacaktır.

### 2. Üretim Derlemesi (Production Build)
```bash
npm run build
```

---

## 🛠️ Tauri ile Masaüstü (.exe) Derleme
Uygulama Tauri v2 mimarisiyle tam uyumlu olarak hazırlanmıştır (`src-tauri/tauri.conf.json`). Windows üzerinde yerel `.exe` olarak derlemek için:

1. **Gereksinimler:**
   - **Rust & Cargo:** [rustup.rs](https://rustup.rs) üzerinden `rustup-init.exe` kurulumu.
   - **Visual Studio C++ Build Tools:** Desktop development with C++ bileşeni.

2. **Masaüstü Geliştirici Modu:**
```bash
npm run tauri dev
```

3. **Masaüstü Kurulum Dosyası (.msi / .exe) Çıkarma:**
```bash
npm run tauri build
```

---

## 🌟 Öne Çıkan Özellikler

- **Hızlı Plaka Arama:** Sol menüden plaka yazılarak tek saniyede aracın tüm geçmişine ve sahibine erişim.
- **İş Emri & Servis Yönetimi:** Giriş KM, müşteri şikayeti, usta teşhisi, dinamik parça ve işçilik kalemleri, kâr/maliyet hesabı.
- **Tek Tıkla Yazdırma:**
  - **A4 Servis Fişi / Teslim Tutanağı:** Yasal teslimat ve garanti dökümü.
  - **80mm Termal POS Fişi:** Sanayi tipi fiş yazıcıları için minimalist çıktı.
- **Ücretsiz WhatsApp Entegrasyonu:** Müşteriye "Aracınız hazır" veya "Bakım zamanınız geldi" şablonlarını tek tıkla gönderme.
- **Akıllı Bakım Algoritması:** KM ve zaman periyoduna göre otomatik periyodik bakım hatırlatması üretimi.
- **Açık Hesap (Veresiye) & Kasa Takibi:** Parçalı ödeme, kalan borç ve müşteri bazlı cari bakiye.
- **Veri Güvenliği & Yedekleme:** Cihaz hafızasında güvenle saklanır, internete ihtiyaç duymaz. Tek tıkla JSON yedek alma ve geri yükleme.
