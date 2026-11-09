import React, { useState } from 'react';
import { 
  Car, 
  Search, 
  Plus, 
  History, 
  User, 
  Calendar, 
  Gauge, 
  Fuel, 
  Wrench,
  X,
  FileText
} from 'lucide-react';
import { storage } from '../services/storage';
import { Vehicle, Customer, FuelType, ServiceRecord } from '../types';

interface VehiclesViewProps {
  onOpenNewServiceForVehicle: (vehicle: Vehicle) => void;
  onOpenServiceDetail: (record: ServiceRecord) => void;
  selectedVehicleForDetail?: Vehicle | null;
  onClearSelectedVehicle?: () => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  onOpenNewServiceForVehicle,
  onOpenServiceDetail,
  selectedVehicleForDetail,
  onClearSelectedVehicle,
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [customers] = useState<Customer[]>(() => storage.getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(selectedVehicleForDetail || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New vehicle form state
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    currentKm: 0,
    vin: '',
    engineNo: '',
    fuelType: 'Benzin' as FuelType,
    color: '',
    notes: '',
  });

  const refreshVehicles = () => {
    setVehicles(storage.getVehicles());
  };

  const getCustomer = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  const filteredVehicles = vehicles.filter(v => {
    const customer = getCustomer(v.customerId);
    const search = searchTerm.toLowerCase();
    return (
      v.plate.toLowerCase().includes(search) ||
      v.brand.toLowerCase().includes(search) ||
      v.model.toLowerCase().includes(search) ||
      (customer && customer.fullName.toLowerCase().includes(search))
    );
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plate || !formData.brand || !formData.model) {
      alert('Lütfen Plaka, Marka ve Model alanlarını doldurunuz.');
      return;
    }

    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      customerId: formData.customerId,
      plate: formData.plate.replace(/\s+/g, '').toUpperCase(),
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year),
      currentKm: Number(formData.currentKm) || 0,
      vin: formData.vin,
      engineNo: formData.engineNo,
      fuelType: formData.fuelType,
      color: formData.color,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    storage.saveVehicle(newVehicle);
    refreshVehicles();
    setIsModalOpen(false);
    setActiveVehicle(newVehicle);
    // Reset form
    setFormData({
      customerId: customers[0]?.id || '',
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      currentKm: 0,
      vin: '',
      engineNo: '',
      fuelType: 'Benzin',
      color: '',
      notes: '',
    });
  };

  const activeVehicleRecords = activeVehicle ? storage.getRecordsByVehicle(activeVehicle.id) : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Araç & Servis Geçmişi</h2>
          <p className="text-slate-400 text-sm">Tüm kayıtlı araçlar, KM takibi ve tamir geçmişi</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Araç Ekle</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Plaka (örn: 34VR4821), marka, model veya müşteri adı ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Main Layout: Left Vehicle Grid, Right Active Vehicle Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles List (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredVehicles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-base font-medium">Aramanıza uygun araç bulunamadı.</p>
              <p className="text-xs text-slate-600 mt-1">Yeni bir araç ekleyebilir veya filtreyi temizleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVehicles.map((veh) => {
                const customer = getCustomer(veh.customerId);
                const isSelected = activeVehicle?.id === veh.id;
                return (
                  <div
                    key={veh.id}
                    onClick={() => setActiveVehicle(veh)}
                    className={`bg-slate-900 border rounded-2xl p-4 cursor-pointer transition relative overflow-hidden group ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10' 
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-base text-blue-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider">
                          {veh.plate}
                        </span>
                        <h4 className="font-semibold text-slate-100 mt-2">
                          {veh.brand} {veh.model}
                        </h4>
                        <span className="text-xs text-slate-400">{veh.year} Model • {veh.fuelType}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {veh.currentKm.toLocaleString('tr-TR')} KM
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {customer?.fullName || 'Sahibi Yok'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewServiceForVehicle(veh);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 p-1 hover:bg-blue-600/10 rounded transition"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        İş Emri Aç
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vehicle Detail & Service History Card (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[calc(100vh-220px)] sticky top-6">
          {activeVehicle ? (
            <div className="flex flex-col h-full">
              {/* Detail Header */}
              <div className="pb-4 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-blue-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      {activeVehicle.plate}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{activeVehicle.year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1.5">
                    {activeVehicle.brand} {activeVehicle.model}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveVehicle(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 py-3 border-b border-slate-800 text-xs">
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block">Güncel KM</span>
                  <span className="font-mono font-bold text-slate-200">
                    {activeVehicle.currentKm.toLocaleString('tr-TR')} KM
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 block">Yakıt Türü</span>
                  <span className="font-medium text-slate-200">{activeVehicle.fuelType}</span>
                </div>
                {activeVehicle.vin && (
                  <div className="col-span-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 block">Şasi No (VIN)</span>
                    <span className="font-mono text-slate-300 truncate block">
                      {activeVehicle.vin}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="py-3">
                <button
                  onClick={() => onOpenNewServiceForVehicle(activeVehicle)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Wrench className="w-4 h-4" />
                  Bu Araca Yeni İş Emri Aç
                </button>
              </div>

              {/* History Timeline */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-400" />
                  Geçmiş Bakım & Tamirler ({activeVehicleRecords.length})
                </h4>

                {activeVehicleRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Bu araca ait henüz kayıtlı bir servis işlemi yok.
                  </p>
                ) : (
                  activeVehicleRecords.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onOpenServiceDetail(rec)}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-400">
                          {new Date(rec.entryDate).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="font-mono font-bold text-blue-400">
                          {rec.entryKm.toLocaleString('tr-TR')} KM
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium line-clamp-2">
                        {rec.complaint}
                      </p>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                        <span className="text-slate-400">
                          {rec.items.length} Kalem İşlem
                        </span>
                        <span className="font-bold text-emerald-400">
                          ₺{rec.grandTotal.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <Car className="w-12 h-12 mb-3 opacity-30 text-slate-400" />
              <h4 className="text-sm font-semibold text-slate-300">Araç Seçiniz</h4>
              <p className="text-xs text-slate-500 mt-1">
                Detaylarını ve geçmiş servis kayıtlarını görmek için soldaki listeden bir araca tıklayın.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">Yeni Araç Tanımla</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Araç Sahibi (Müşteri) *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Plaka *
                  </label>
                  <input
                    type="text"
                    placeholder="34VR4821"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100 uppercase focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Güncel KM *
                  </label>
                  <input
                    type="number"
                    placeholder="125000"
                    value={formData.currentKm}
                    onChange={(e) => setFormData({ ...formData, currentKm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Marka *
                  </label>
                  <input
                    type="text"
                    placeholder="Volkswagen"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    placeholder="Passat 1.6 TDI"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Model Yılı
                  </label>
                  <input
                    type="number"
                    placeholder="2018"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Yakıt Türü
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="LPG">LPG / Benzin</option>
                    <option value="Hibrit">Hibrit</option>
                    <option value="Elektrik">Elektrik</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Renk
                  </label>
                  <input
                    type="text"
                    placeholder="Beyaz, Füme vb."
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Şasi No (VIN)
                </label>
                <input
                  type="text"
                  placeholder="WVWZZZ..."
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 uppercase focus:outline-none focus:border-blue-500"
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

