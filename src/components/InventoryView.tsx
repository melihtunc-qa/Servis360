import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { StockItem } from '../types';

export const InventoryView: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>(() => storage.getStockItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Motor Yağı',
    brand: '',
    quantity: 1,
    minQuantity: 3,
    unitCost: 0,
    unitPrice: 0,
    shelfLocation: '',
  });

  const refreshItems = () => {
    setStockItems(storage.getStockItems());
  };

  const filteredItems = stockItems.filter(item => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(search) ||
      item.code.toLowerCase().includes(search) ||
      item.brand.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search);

    const matchesLowStock = !filterLowStock || item.quantity <= item.minQuantity;

    return matchesSearch && matchesLowStock;
  });

  const lowStockCount = storage.getLowStockItems().length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      category: 'Motor Yağı',
      brand: '',
      quantity: 1,
      minQuantity: 3,
      unitCost: 0,
      unitPrice: 0,
      shelfLocation: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice,
      shelfLocation: item.shelfLocation || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('Lütfen Parça Kodu ve Adını doldurunuz.');
      return;
    }

    const itemToSave: StockItem = {
      id: editingItem ? editingItem.id : `stk-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      quantity: Number(formData.quantity) || 0,
      minQuantity: Number(formData.minQuantity) || 0,
      unitCost: Number(formData.unitCost) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      shelfLocation: formData.shelfLocation,
      updatedAt: new Date().toISOString(),
    };

    storage.saveStockItem(itemToSave);
    refreshItems();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu parçayı stoktan silmek istediğinize emin misiniz?')) {
      storage.deleteStockItem(id);
      refreshItems();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Yedek Parça & Stok Takibi</h2>
          <p className="text-slate-400 text-sm">Motor yağları, filtreler, fren parçaları ve kritik stok alarmları</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Parça Ekle</span>
        </button>
      </div>

      {/* Filter / Search & Low Stock Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Parça adı, kodu (örn: HU711), marka veya kategori ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shrink-0 ${
            filterLowStock
              ? 'bg-rose-500 text-white'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Kritik Stoklar ({lowStockCount})</span>
        </button>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Kod</th>
                <th className="py-3.5 px-4">Parça Adı</th>
                <th className="py-3.5 px-4">Kategori / Marka</th>
                <th className="py-3.5 px-4 text-center">Mevcut Stok</th>
                <th className="py-3.5 px-4 text-right">Alış (Maliyet)</th>
                <th className="py-3.5 px-4 text-right">Satış Fiyatı</th>
                <th className="py-3.5 px-4">Raf / Konum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Parça bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850 transition">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-blue-400">
                        {item.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        <span>{item.category}</span>
                        {item.brand && <span className="text-slate-500 block">{item.brand}</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.quantity} Adet
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                        ₺{item.unitCost.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-xs">
                        ₺{item.unitPrice.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {item.shelfLocation ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {item.shelfLocation}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingItem ? 'Parça Bilgilerini Düzenle' : 'Yeni Yedek Parça Tanımla'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Parça Kodu / OEM *
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: HU711/51X"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Marka
                  </label>
                  <input
                    type="text"
                    placeholder="Mann, Castrol, Bosch..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Parça Adı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Yağ Filtresi (VAG Grubu)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Motor Yağı">Motor Yağı</option>
                    <option value="Filtre">Filtre</option>
                    <option value="Fren Sistemi">Fren Sistemi</option>
                    <option value="Ön Takım">Ön Takım & Süspansiyon</option>
                    <option value="Ateşleme">Ateşleme (Buji/Bobin)</option>
                    <option value="Sıvı & Katkı">Sıvı & Antifriz</option>
                    <option value="Kayış & Rulman">Kayış & Rulman</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Raf / Kutu Konumu
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Raf B-2"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Mevcut Stok Adedi *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Kritik Stok Uyarısı Sınırı
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-rose-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Alış / Maliyet Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Satış Fiyatı (₺) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
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
                  {editingItem ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
