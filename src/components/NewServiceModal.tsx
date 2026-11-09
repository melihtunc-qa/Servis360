import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  Plus, 
  Trash2, 
  DollarSign, 
  Car, 
  User, 
  CheckCircle 
} from 'lucide-react';
import { storage } from '../services/storage';
import { Vehicle, Customer, ServiceRecord, ServiceItem, ServiceStatus, PaymentStatus, ItemType } from '../types';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated: (record: ServiceRecord) => void;
  preSelectedVehicle?: Vehicle | null;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  onRecordCreated,
  preSelectedVehicle,
}) => {
  const vehicles = storage.getVehicles();
  const customers = storage.getCustomers();

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    preSelectedVehicle ? preSelectedVehicle.id : (vehicles[0]?.id || '')
  );

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedCustomer = selectedVehicle ? customers.find(c => c.id === selectedVehicle.customerId) : null;

  const [entryKm, setEntryKm] = useState(selectedVehicle ? selectedVehicle.currentKm : 0);
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('ISLEMDE');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('ODENDI');
  const [paymentMethod, setPaymentMethod] = useState<'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'ACIK_HESAP'>('NAKIT');

  // Service items (parts and labor)
  const [items, setItems] = useState<Array<{
    id: string;
    itemType: ItemType;
    name: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
  }>>([
    {
      id: 'item-1',
      itemType: 'PARCA',
      name: 'Motor Yağı ve Filtre Değişimi',
      quantity: 1,
      unitPrice: 2500,
      costPrice: 1800,
    },
    {
      id: 'item-2',
      itemType: 'ISCILIK',
      name: 'Periyodik Bakım İşçiliği',
      quantity: 1,
      unitPrice: 1000,
      costPrice: 0,
    },
  ]);

  if (!isOpen) return null;

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const veh = vehicles.find(v => v.id === vId);
    if (veh) {
      setEntryKm(veh.currentKm);
    }
  };

  const handleAddItem = (type: ItemType) => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        itemType: type,
        name: '',
        quantity: 1,
        unitPrice: 0,
        costPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculations
  const partsTotal = items
    .filter(i => i.itemType === 'PARCA')
    .reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);

  const laborTotal = items
    .filter(i => i.itemType === 'ISCILIK')
    .reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);

  const grandTotal = Math.max(0, partsTotal + laborTotal - Number(discount || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedCustomer) {
      alert('Lütfen geçerli bir araç seçiniz.');
      return;
    }
    if (!complaint) {
      alert('Lütfen müşteri talebini / şikayetini giriniz.');
      return;
    }

    const recordId = `srv-${Date.now()}`;

    const formattedItems: ServiceItem[] = items.map((it) => ({
      id: it.id,
      serviceRecordId: recordId,
      itemType: it.itemType,
      name: it.name || (it.itemType === 'PARCA' ? 'Yedek Parça' : 'İşçilik'),
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      costPrice: Number(it.costPrice) || 0,
      totalPrice: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
    }));

    const newRecord: ServiceRecord = {
      id: recordId,
      vehicleId: selectedVehicle.id,
      customerId: selectedCustomer.id,
      entryDate: new Date().toISOString(),
      entryKm: Number(entryKm) || selectedVehicle.currentKm,
      complaint,
      diagnosis,
      status,
      items: formattedItems,
      partsTotal,
      laborTotal,
      discount: Number(discount) || 0,
      grandTotal,
      paidAmount: Number(paidAmount) || 0,
      paymentStatus,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    storage.saveServiceRecord(newRecord);
    onRecordCreated(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Yeni İş Emri & Servis Girişi</h3>
              <p className="text-xs text-slate-400">Araç kabul, işlem kalemleri ve fiyatlandırma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Vehicle and Customer Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Servise Gelen Araç *
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} - {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Müşteri (Sahibi)
              </label>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 truncate">
                {selectedCustomer ? `${selectedCustomer.fullName} (${selectedCustomer.phone})` : 'Seçilmedi'}
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Servis Giriş KM *
              </label>
              <input
                type="number"
                value={entryKm}
                onChange={(e) => setEntryKm(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Complaint and Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Müşteri Şikayeti & Talep *
              </label>
              <textarea
                rows={3}
                placeholder="Örn: 10.000 KM periyodik bakımı, ön frenlerden ses geliyor, klima gazı kontrolü..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Usta Teşhisi / Ön Muayene
              </label>
              <textarea
                rows={3}
                placeholder="Örn: Ön balatalar aşınmış, motor yağı seviyesi düşük, hava filtresi tıkalı..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Dynamic Service Items (Parts / Labor) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Değişen Parçalar ve İşçilik Kalemleri
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem('PARCA')}
                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Parça Ekle
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('ISCILIK')}
                  className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + İşçilik Ekle
                </button>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-2.5 w-24">Tür</th>
                    <th className="p-2.5">Kalem Adı / Parça</th>
                    <th className="p-2.5 w-20 text-center">Miktar</th>
                    <th className="p-2.5 w-28 text-right">Birim Fiyat</th>
                    <th className="p-2.5 w-28 text-right">Tutar</th>
                    <th className="p-2.5 w-12 text-center">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {items.map((item, index) => {
                    const rowTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.itemType === 'PARCA' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {item.itemType}
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Parça / İşlem adı"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-right text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-200">
                          ₺{rowTotal.toLocaleString('tr-TR')}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Payment Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {/* Status & Method */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  İşlem Durumu
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="KABUL_EDILDI">Kabul Edildi</option>
                  <option value="ISLEMDE">İşlemde (Liftte)</option>
                  <option value="PARCA_BEKLENIYOR">Parça Bekleniyor</option>
                  <option value="TAMAMLANDI">Tamamlandı</option>
                  <option value="TESLIM_EDILDI">Teslim Edildi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Ödeme Durumu
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => {
                      const val = e.target.value as PaymentStatus;
                      setPaymentStatus(val);
                      if (val === 'ODENDI') setPaidAmount(grandTotal);
                      if (val === 'BEKLIYOR' || val === 'VERESIYE') setPaidAmount(0);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ODENDI">Ödendi (Tamamı)</option>
                    <option value="KISMI_ODENDI">Kısmi Ödendi</option>
                    <option value="VERESIYE">Veresiye / Açık Hesap</option>
                    <option value="BEKLIYOR">Bekliyor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Ödeme Yolu
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NAKIT">Nakit</option>
                    <option value="KREDI_KARTI">Kredi Kartı (POS)</option>
                    <option value="HAVALE">Havale / EFT</option>
                    <option value="ACIK_HESAP">Açık Hesap (Cari)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Yedek Parça Toplamı:</span>
                <span className="font-mono font-bold text-slate-200">₺{partsTotal.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">İşçilik Toplamı:</span>
                <span className="font-mono font-bold text-slate-200">₺{laborTotal.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">İskonto / İndirim (₺):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-rose-400 font-mono font-bold focus:outline-none"
                />
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-700 text-sm">
                <span className="font-bold text-white">Genel Toplam:</span>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  ₺{grandTotal.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Alınan Tahsilat (₺):</span>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-emerald-400 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              İş Emrini Kaydet ve Başlat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

