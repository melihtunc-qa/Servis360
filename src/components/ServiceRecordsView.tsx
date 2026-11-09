import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  X,
  CreditCard,
  Tag
} from 'lucide-react';
import { storage } from '../services/storage';
import { ServiceRecord, ServiceStatus, PaymentStatus, Vehicle, Customer } from '../types';

interface ServiceRecordsViewProps {
  onOpenNewService: () => void;
  selectedRecordForModal?: ServiceRecord | null;
  onCloseDetailModal?: () => void;
}

export const ServiceRecordsView: React.FC<ServiceRecordsViewProps> = ({
  onOpenNewService,
  selectedRecordForModal,
  onCloseDetailModal,
}) => {
  const [records, setRecords] = useState<ServiceRecord[]>(() => storage.getServiceRecords());
  const [vehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [customers] = useState<Customer[]>(() => storage.getCustomers());
  const [activeTab, setActiveTab] = useState<'ALL' | ServiceStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRecord, setActiveRecord] = useState<ServiceRecord | null>(selectedRecordForModal || null);
  const [printMode, setPrintMode] = useState<'A4' | 'THERMAL' | null>(null);

  const refreshRecords = () => {
    setRecords(storage.getServiceRecords());
  };

  const getVehicle = (vehicleId: string) => vehicles.find(v => v.id === vehicleId);
  const getCustomer = (customerId: string) => customers.find(c => c.id === customerId);

  const filteredRecords = records.filter(r => {
    const vehicle = getVehicle(r.vehicleId);
    const customer = getCustomer(r.customerId);
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      (vehicle && vehicle.plate.toLowerCase().includes(search)) ||
      (customer && customer.fullName.toLowerCase().includes(search)) ||
      r.complaint.toLowerCase().includes(search);

    const matchesTab = activeTab === 'ALL' || r.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = (record: ServiceRecord, newStatus: ServiceStatus) => {
    const updated = { ...record, status: newStatus };
    if (newStatus === 'TESLIM_EDILDI' && !updated.exitDate) {
      updated.exitDate = new Date().toISOString();
    }
    storage.saveServiceRecord(updated);
    refreshRecords();
    if (activeRecord?.id === record.id) {
      setActiveRecord(updated);
    }
  };

  const handleUpdatePayment = (record: ServiceRecord, newPaymentStatus: PaymentStatus, paidAmount: number) => {
    const updated = { 
      ...record, 
      paymentStatus: newPaymentStatus, 
      paidAmount: paidAmount 
    };
    storage.saveServiceRecord(updated);
    refreshRecords();
    if (activeRecord?.id === record.id) {
      setActiveRecord(updated);
    }
  };

  const handleSendReadyWhatsApp = (record: ServiceRecord) => {
    const customer = getCustomer(record.customerId);
    const vehicle = getVehicle(record.vehicleId);
    const settings = storage.getSettings();
    if (!customer) return;

    const remainingDebt = Math.max(0, record.grandTotal - (record.paidAmount || 0));
    let msg = `Merhaba ${customer.fullName} Bey/Hanım, ${settings.shopName} servisimizden ulaşıyoruz. `;
    msg += `${vehicle?.plate} plakalı aracınızın bakım/onarım işlemleri tamamlanmıştır. Aracınızı teslim alabilirsiniz.\n`;
    msg += `Toplam Tutar: ₺${record.grandTotal.toLocaleString('tr-TR')}`;
    if (remainingDebt > 0) {
      msg += ` (Kalan: ₺${remainingDebt.toLocaleString('tr-TR')})`;
    }
    msg += `\nİyi günler dileriz.`;

    const url = storage.generateWhatsAppLink(customer.phone, msg);
    window.open(url, '_blank');
  };

  const triggerPrint = (mode: 'A4' | 'THERMAL') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const settings = storage.getSettings();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Printable Area (Visible only when printing) */}
      {printMode && activeRecord && (
        <div className="print-only p-8 text-black bg-white">
          {printMode === 'A4' ? (
            /* A4 Servis Fişi / Teslim Belgesi */
            <div className="space-y-6 max-w-3xl mx-auto text-sm">
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold uppercase">{settings.shopName}</h1>
                  <p className="text-xs">{settings.address} - {settings.city}</p>
                  <p className="text-xs">Tel: {settings.phone}</p>
                  <p className="text-xs">Vergi Dairesi / No: {settings.taxOffice} - {settings.taxNumber}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold">SERVİS & BAKIM İŞ EMRİ</h2>
                  <p className="font-mono text-xs">No: #{activeRecord.id.toUpperCase()}</p>
                  <p className="text-xs">Tarih: {new Date(activeRecord.entryDate).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Müşteri ve Araç Bilgileri */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50 text-xs">
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">MÜŞTERİ BİLGİLERİ</h4>
                  <p><strong>Ad Soyad:</strong> {getCustomer(activeRecord.customerId)?.fullName}</p>
                  <p><strong>Telefon:</strong> {getCustomer(activeRecord.customerId)?.phone}</p>
                  <p><strong>Adres:</strong> {getCustomer(activeRecord.customerId)?.address || '-'}</p>
                </div>
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">ARAÇ BİLGİLERİ</h4>
                  <p><strong>Plaka:</strong> {getVehicle(activeRecord.vehicleId)?.plate}</p>
                  <p><strong>Marka/Model:</strong> {getVehicle(activeRecord.vehicleId)?.brand} {getVehicle(activeRecord.vehicleId)?.model} ({getVehicle(activeRecord.vehicleId)?.year})</p>
                  <p><strong>Servis KM:</strong> {activeRecord.entryKm.toLocaleString('tr-TR')} KM</p>
                  <p><strong>Şasi No:</strong> {getVehicle(activeRecord.vehicleId)?.vin || '-'}</p>
                </div>
              </div>

              {/* Şikayet ve Teşhis */}
              <div className="text-xs space-y-1">
                <p><strong>Müşteri Talebi / Şikayet:</strong> {activeRecord.complaint}</p>
                {activeRecord.diagnosis && <p><strong>Yapılan Tespit:</strong> {activeRecord.diagnosis}</p>}
              </div>

              {/* Kalemler Tablosu */}
              <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Tür</th>
                    <th className="border p-2">Yapılan İşlem / Değişen Parça</th>
                    <th className="border p-2 text-center">Miktar</th>
                    <th className="border p-2 text-right">Birim Fiyat</th>
                    <th className="border p-2 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRecord.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{item.itemType === 'PARCA' ? 'Parça' : 'İşçilik'}</td>
                      <td className="border p-2 font-medium">{item.name}</td>
                      <td className="border p-2 text-center">{item.quantity}</td>
                      <td className="border p-2 text-right">₺{item.unitPrice.toLocaleString('tr-TR')}</td>
                      <td className="border p-2 text-right">₺{item.totalPrice.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tutarlar Özeti */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-xs max-w-sm text-gray-600">
                  <p className="font-semibold text-black">Garanti & Koşullar:</p>
                  <p>{settings.footerNote}</p>
                </div>
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span>Yedek Parça:</span>
                    <span>₺{activeRecord.partsTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>İşçilik:</span>
                    <span>₺{activeRecord.laborTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  {activeRecord.discount > 0 && (
                    <div className="flex justify-between py-1 border-b text-red-600">
                      <span>İskonto / İndirim:</span>
                      <span>-₺{activeRecord.discount.toLocaleString('tr-TR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 font-bold text-base border-b-2 border-black">
                    <span>Genel Toplam:</span>
                    <span>₺{activeRecord.grandTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold">
                    <span>Ödenen:</span>
                    <span>₺{activeRecord.paidAmount.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* İmza Alanları */}
              <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
                <div className="border-t border-black pt-2">
                  <p className="font-bold">Teslim Eden (Servis Yetkilisi)</p>
                  <p className="text-gray-500 mt-8">İmza / Kaşe</p>
                </div>
                <div className="border-t border-black pt-2">
                  <p className="font-bold">Teslim Alan (Müşteri)</p>
                  <p className="text-gray-500 mt-8">Araç eksiksiz teslim alınmıştır. İmza</p>
                </div>
              </div>
            </div>
          ) : (
            /* 80mm Termal POS Fişi */
            <div className="w-72 font-mono text-xs mx-auto space-y-3">
              <div className="text-center border-b border-black pb-2">
                <h2 className="font-bold text-sm uppercase">{settings.shopName}</h2>
                <p className="text-[10px]">{settings.phone}</p>
                <p className="text-[10px]">{new Date().toLocaleString('tr-TR')}</p>
              </div>

              <div>
                <p><strong>PLAKA:</strong> {getVehicle(activeRecord.vehicleId)?.plate}</p>
                <p><strong>ARAÇ:</strong> {getVehicle(activeRecord.vehicleId)?.brand} {getVehicle(activeRecord.vehicleId)?.model}</p>
                <p><strong>KM:</strong> {activeRecord.entryKm.toLocaleString('tr-TR')} KM</p>
                <p><strong>MÜŞTERİ:</strong> {getCustomer(activeRecord.customerId)?.fullName}</p>
              </div>

              <div className="border-t border-b border-black py-2 space-y-1">
                {activeRecord.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[170px]">{it.quantity}x {it.name}</span>
                    <span>₺{it.totalPrice}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right">
                <p className="font-bold text-sm">TOPLAM: ₺{activeRecord.grandTotal}</p>
                <p>ÖDENEN: ₺{activeRecord.paidAmount}</p>
                <p>KALAN: ₺{Math.max(0, activeRecord.grandTotal - activeRecord.paidAmount)}</p>
              </div>

              <div className="border-t border-black pt-2 text-center text-[10px]">
                <p>{settings.footerNote}</p>
                <p className="mt-2 font-bold">Bizi tercih ettiğiniz için teşekkürler!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">İş Emirleri & Servis Kayıtları</h2>
            <p className="text-slate-400 text-sm">Araç kabul, onarım süreçleri, parça dökümleri ve faturalandırma</p>
          </div>
          <button
            onClick={onOpenNewService}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İş Emri Aç</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'ALL', label: 'Tüm Kayıtlar' },
            { id: 'ISLEMDE', label: 'İşlemde Olanlar' },
            { id: 'KABUL_EDILDI', label: 'Kabul Edildi' },
            { id: 'PARCA_BEKLENIYOR', label: 'Parça Bekleyen' },
            { id: 'TAMAMLANDI', label: 'Tamamlandı' },
            { id: 'TESLIM_EDILDI', label: 'Teslim Edildi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Plaka, müşteri adı veya yapılan işlem ile filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Service Records Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tarih</th>
                  <th className="py-3.5 px-4">Plaka / Araç</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">KM</th>
                  <th className="py-3.5 px-4">Şikayet / İşlem</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4">Tutar / Ödeme</th>
                  <th className="py-3.5 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const vehicle = getVehicle(rec.vehicleId);
                    const customer = getCustomer(rec.customerId);
                    const isUnpaid = rec.grandTotal > rec.paidAmount;

                    return (
                      <tr 
                        key={rec.id} 
                        className="hover:bg-slate-850 cursor-pointer transition"
                        onClick={() => setActiveRecord(rec)}
                      >
                        <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap font-medium">
                          {new Date(rec.entryDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-400 block">
                            {vehicle?.plate || 'Bilinmiyor'}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {vehicle?.brand} {vehicle?.model}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-200 block">{customer?.fullName}</span>
                          <span className="text-xs text-slate-500 font-mono">{customer?.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                          {rec.entryKm.toLocaleString('tr-TR')} KM
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                          {rec.complaint}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                            rec.status === 'ISLEMDE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            rec.status === 'TAMAMLANDI' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            rec.status === 'TESLIM_EDILDI' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {rec.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-100">
                            ₺{rec.grandTotal.toLocaleString('tr-TR')}
                          </div>
                          <span className={`text-[10px] font-medium block ${
                            isUnpaid ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {isUnpaid ? `Kalan: ₺${(rec.grandTotal - rec.paidAmount).toLocaleString('tr-TR')}` : 'Ödendi'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRecord(rec);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="İş Emri Detayını Aç"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail / Invoice Modal */}
      {activeRecord && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 text-base">
                      {getVehicle(activeRecord.vehicleId)?.plate}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {new Date(activeRecord.entryDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    {getCustomer(activeRecord.customerId)?.fullName} ({getCustomer(activeRecord.customerId)?.phone})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveRecord(null);
                  if (onCloseDetailModal) onCloseDetailModal();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Quick Status Control */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
                    İş Emri Durumu
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(['ISLEMDE', 'PARCA_BEKLENIYOR', 'TAMAMLANDI', 'TESLIM_EDILDI'] as ServiceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(activeRecord, st)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          activeRecord.status === st
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSendReadyWhatsApp(activeRecord)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  "Aracınız Hazır" WhatsApp Mesajı
                </button>
              </div>

              {/* Complaint & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 font-semibold uppercase block mb-1">Müşteri Şikayeti / Talep:</span>
                  <p className="text-slate-200">{activeRecord.complaint}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 font-semibold uppercase block mb-1">Usta Teşhisi / Açıklama:</span>
                  <p className="text-slate-200">{activeRecord.diagnosis || 'Henüz eklenmemiş'}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Yapılan İşlemler ve Takılan Parçalar ({activeRecord.items.length})
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold">
                      <tr>
                        <th className="p-2.5">Tür</th>
                        <th className="p-2.5">Açıklama</th>
                        <th className="p-2.5 text-center">Adet</th>
                        <th className="p-2.5 text-right">Birim</th>
                        <th className="p-2.5 text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {activeRecord.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-800/30">
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              it.itemType === 'PARCA' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {it.itemType}
                            </span>
                          </td>
                          <td className="p-2.5 font-medium text-slate-200">{it.name}</td>
                          <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono">₺{it.unitPrice.toLocaleString('tr-TR')}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-100">₺{it.totalPrice.toLocaleString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Payment Status */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Yedek Parça:</span>
                    <span className="font-mono text-slate-200">₺{activeRecord.partsTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">İşçilik:</span>
                    <span className="font-mono text-slate-200">₺{activeRecord.laborTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  {activeRecord.discount > 0 && (
                    <div className="flex items-center gap-2 text-rose-400">
                      <span>İndirim:</span>
                      <span className="font-mono">-₺{activeRecord.discount.toLocaleString('tr-TR')}</span>
                    </div>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Genel Toplam</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono">
                    ₺{activeRecord.grandTotal.toLocaleString('tr-TR')}
                  </span>
                  <div className="text-xs">
                    {activeRecord.grandTotal > activeRecord.paidAmount ? (
                      <span className="text-rose-400 font-semibold">
                        Kalan Borç: ₺{(activeRecord.grandTotal - activeRecord.paidAmount).toLocaleString('tr-TR')}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Tamamı Tahsil Edildi</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer / Print Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerPrint('A4')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  A4 Servis Formu Yazdır
                </button>
                <button
                  onClick={() => triggerPrint('THERMAL')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  80mm Termal POS Fişi
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveRecord(null);
                  if (onCloseDetailModal) onCloseDetailModal();
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

