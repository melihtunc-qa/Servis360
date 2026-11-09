import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  CheckCircle,
  FileText
} from 'lucide-react';
import { storage, defaultSettings } from '../services/storage';
import { ShopSettings } from '../types';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettings>(() => storage.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupJson = storage.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servis360_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importBackup(content);
      if (success) {
        setImportStatus('Veritabanı başarıyla geri yüklendi! Sayfa yenileniyor...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('Hata: Geçersiz yedek dosyası formatı!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (confirm('Tüm veriler sıfırlanıp fabrika demo verileri yüklenecek. Emin misiniz?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Atölye Ayarları & Veritabanı</h2>
        <p className="text-slate-400 text-sm">
          Servis fatura/fiş başlık bilgileri, bakım periyotları ve yerel veri yedekleme
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shop Info Form (2 Cols) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Servis & Fiş Başlık Bilgileri
            </h3>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" />
                Kaydedildi!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Servis / Atölye Adı *
                </label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Yetkili / Usta Adı
                </label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Adres & Sanayi Sitesi Bilgisi
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Vergi Dairesi
                </label>
                <input
                  type="text"
                  value={settings.taxOffice || ''}
                  onChange={(e) => setSettings({ ...settings, taxOffice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  value={settings.taxNumber || ''}
                  onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Default Maintenance Periods */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Akıllı Bakım Hatırlatma Varsayılanları
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Varsayılan Yağ Değişim KM Periyodu
                  </label>
                  <input
                    type="number"
                    value={settings.defaultOilPeriodKm}
                    onChange={(e) => setSettings({ ...settings, defaultOilPeriodKm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-blue-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Varsayılan Gün Periyodu
                  </label>
                  <input
                    type="number"
                    value={settings.defaultOilPeriodDays}
                    onChange={(e) => setSettings({ ...settings, defaultOilPeriodDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-blue-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Servis Fişi Alt Notu & Garanti Şartı
              </label>
              <textarea
                rows={2}
                value={settings.footerNote}
                onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/30"
              >
                <Save className="w-4 h-4" />
                Ayarları Kaydet
              </button>
            </div>
          </form>
        </div>

        {/* Database & Backup Card (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Lokal Veritabanı & Güvenlik</h4>
                <p className="text-[11px] text-slate-400">Cihaz hafızasında %100 çevrimdışı</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Tüm müşteri, araç ve servis kayıtlarınız cihaz hafızasında güvenle saklanmaktadır. Verileriniz asla internete veya buluta gönderilmez.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-medium transition shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-400" />
                Veritabanı Yedeği İndir (.json)
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-medium transition cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Yedekten Geri Yükle</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <p className="text-xs font-medium text-center text-amber-400 pt-1">
                  {importStatus}
                </p>
              )}
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Geliştirici & Test
            </h4>
            <p className="text-xs text-slate-500">
              Uygulamayı ilk haline döndürmek ve örnek servis/araç kayıtlarını yeniden yüklemek için:
            </p>
            <button
              onClick={handleResetDemoData}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Örnek Verileri Sıfırla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

