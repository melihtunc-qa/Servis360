import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  MessageCircle, 
  X,
  CreditCard
} from 'lucide-react';
import { storage } from '../services/storage';
import { Customer, Vehicle } from '../types';

interface CustomersViewProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onSelectVehicle,
}) => {
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [vehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    notes: '',
  });

  const refreshCustomers = () => {
    setCustomers(storage.getCustomers());
  };

  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(v => v.customerId === customerId);
  };

  const filteredCustomers = customers.filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(search) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search))
    );
  });

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      balance: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      fullName: cust.fullName,
      phone: cust.phone,
      email: cust.email || '',
      address: cust.address || '',
      balance: cust.balance || 0,
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Lütfen Müşteri Adı ve Telefon alanlarını doldurunuz.');
      return;
    }

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      balance: Number(formData.balance) || 0,
      notes: formData.notes,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    storage.saveCustomer(customerToSave);
    refreshCustomers();
    setIsModalOpen(false);
  };

  const handleDirectWhatsApp = (phone: string, name: string) => {
    const settings = storage.getSettings();
    const message = `Merhaba ${name} Bey/Hanım, ${settings.shopName} servisimizden ulaşıyoruz. Aracınız ile ilgili bilgi vermek istiyoruz.`;
    const url = storage.generateWhatsAppLink(phone, message);
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Müşteri Rehberi</h2>
          <p className="text-slate-400 text-sm">Müşteri iletişim bilgileri, araçları ve borç/alacak bakiyeleri</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Müşteri Ekle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="İsim, telefon veya e-posta ile müşteri ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-medium">Müşteri bulunamadı.</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const customerVehicles = getCustomerVehicles(cust.id);
            const hasDebt = cust.balance > 0;
            return (
              <div
                key={cust.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base">{cust.fullName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{cust.phone}</span>
                      </div>
                    </div>
                    {/* Bakiye Rozeti */}
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 ${
                          hasDebt
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        {hasDebt ? `₺${cust.balance.toLocaleString('tr-TR')} Borç` : 'Bakiye Temiz'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Address */}
                  {cust.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 mt-3">
                      {cust.notes}
                    </p>
                  )}

                  {/* Customer Vehicles */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      Kayıtlı Araçları ({customerVehicles.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {customerVehicles.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">Kayıtlı araç yok</span>
                      ) : (
                        customerVehicles.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => onSelectVehicle(v)}
                            className="font-mono text-xs font-bold text-blue-400 bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 px-2 py-1 rounded-md transition"
                            title={`${v.brand} ${v.model} - Detayları Aç`}
                          >
                            {v.plate}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDirectWhatsApp(cust.phone, cust.fullName)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-medium transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(cust)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingCustomer ? 'Müşteri Bilgilerini Düzenle' : 'Yeni Müşteri Tanımla'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Ad Soyad / Firma Adı *
                </label>
                <input
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="text"
                  placeholder="0532 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    placeholder="musteri@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Mevcut Bakiye (Borç TL)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Adres / Semt
                </label>
                <input
                  type="text"
                  placeholder="Kadıköy, İstanbul"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Özel Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Hafta sonu aranmak istemiyor, fatura talep ediyor..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/30"
                >
                  {editingCustomer ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

