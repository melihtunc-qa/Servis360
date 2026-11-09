import React from 'react';
import { 
  Wrench, 
  Users, 
  Car, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  MessageCircle,
  FileText
} from 'lucide-react';
import { storage } from '../services/storage';
import { ServiceRecord, Customer, Vehicle, Reminder } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenServiceDetail: (record: ServiceRecord) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenServiceDetail,
  onSelectVehicle,
}) => {
  const stats = storage.getDashboardStats();
  const reminders = storage.getReminders().filter(r => r.status === 'YAKLASAN');
  const vehicles = storage.getVehicles();
  const customers = storage.getCustomers();

  const getVehiclePlate = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.plate || 'Plaka Yok';
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.fullName || 'Bilinmeyen Müşteri';
  };

  const getCustomerPhone = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.phone || '';
  };

  const handleSendReminderWhatsApp = (reminder: Reminder) => {
    const phone = getCustomerPhone(reminder.customerId);
    const plate = getVehiclePlate(reminder.vehicleId);
    const settings = storage.getSettings();
    const message = `Merhaba, ${settings.shopName} servisimizden yazıyoruz. ${plate} plakalı aracınızın ${reminder.title} zamanı yaklaşmıştır. Randevu ve detaylı bilgi için bize bu numaradan ulaşabilirsiniz.`;
    const url = storage.generateWhatsAppLink(phone, message);
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: ServiceRecord['status']) => {
    switch (status) {
      case 'KABUL_EDILDI':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-200">Kabul Edildi</span>;
      case 'ISLEMDE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">İşlemde</span>;
      case 'PARCA_BEKLENIYOR':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Parça Bekleniyor</span>;
      case 'TAMAMLANDI':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Tamamlandı</span>;
      case 'TESLIM_EDILDI':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Teslim Edildi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Atölye Genel Durumu</h2>
          <p className="text-slate-400 text-sm">Gerçek zamanlı iş durumu, araçlar ve yaklaşan periyodik bakımlar</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 uppercase tracking-wider block">Bugünün Tarihi</span>
          <span className="text-sm font-medium text-slate-300">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aktif İşler */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aktif İşler</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.activeServiceCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400">
            <span className="text-amber-400 font-medium mr-1.5">Liftte ve işlemde</span> olan araçlar
          </div>
        </div>

        {/* Müşteri ve Araç */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kayıtlı Araç / Müşteri</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {stats.vehicleCount} <span className="text-lg font-normal text-slate-500">/ {stats.customerCount}</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Car className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400">
            <span className="text-blue-400 font-medium mr-1.5">Tek tıkla</span> plaka geçmişi
          </div>
        </div>

        {/* Toplam Ciro / Tahsilat */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Toplam Tahsilat</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-1">
                ₺{stats.totalRevenue.toLocaleString('tr-TR')}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400">
            Kasa tahsilatları toplamı
          </div>
        </div>

        {/* Veresiye / Açık Hesap */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Açık Hesap (Alacak)</p>
              <h3 className="text-3xl font-bold text-rose-400 mt-1">
                ₺{stats.totalReceivables.toLocaleString('tr-TR')}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-400">
            Bekleyen müşteri bakiyeleri
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Recent Services, Right = Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Service Records (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">Son İş Emirleri ve Servis Kayıtları</h3>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition"
            >
              Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Plaka / Araç</th>
                  <th className="py-3 px-3">Müşteri</th>
                  <th className="py-3 px-3">İşlem / Şikayet</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-3">Tutar</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.recentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Henüz servis kaydı bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  stats.recentRecords.map((record) => {
                    const vehicle = vehicles.find(v => v.id === record.vehicleId);
                    return (
                      <tr key={record.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <button
                            onClick={() => vehicle && onSelectVehicle(vehicle)}
                            className="text-left font-mono font-bold text-blue-400 hover:underline block"
                          >
                            {getVehiclePlate(record.vehicleId)}
                          </button>
                          <span className="text-xs text-slate-400 block">
                            {vehicle?.brand} {vehicle?.model}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-200">
                          {getCustomerName(record.customerId)}
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                          {record.complaint}
                        </td>
                        <td className="py-3 px-3">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-100">
                          ₺{record.grandTotal.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onOpenServiceDetail(record)}
                            className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                            title="İş Emrini İncele"
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

        {/* Maintenance Reminders (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">Yaklaşan Bakımlar</h3>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition"
            >
              Tümü <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs py-8">
                Şu an yaklaşan kritik bakım bulunmuyor.
              </div>
            ) : (
              reminders.map((rem) => {
                const plate = getVehiclePlate(rem.vehicleId);
                const customer = customers.find(c => c.id === rem.customerId);
                return (
                  <div
                    key={rem.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/50">
                        {plate}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {rem.targetDate}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{rem.title}</h4>
                      <p className="text-xs text-slate-400">{customer?.fullName} ({customer?.phone})</p>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleSendReminderWhatsApp(rem)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
                        title="Müşteriye WhatsApp Hatırlatması Gönder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Hatırlat
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

