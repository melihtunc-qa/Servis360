import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  CreditCard, 
  Banknote, 
  Building2,
  X,
  Trash2
} from 'lucide-react';
import { storage } from '../services/storage';
import { CashTransaction } from '../types';

export const CashFlowView: React.FC = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>(() => storage.getCashTransactions());
  const [filterType, setFilterType] = useState<'ALL' | 'GELIR' | 'GIDER'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'GELIR' as 'GELIR' | 'GIDER',
    category: 'SERVIS_TAHSILAT' as CashTransaction['category'],
    amount: 0,
    paymentMethod: 'NAKIT' as CashTransaction['paymentMethod'],
    description: '',
  });

  const refreshTransactions = () => {
    setTransactions(storage.getCashTransactions());
  };

  const totalIncome = transactions.filter(t => t.type === 'GELIR').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'GIDER').reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const filtered = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    const newTx: CashTransaction = {
      id: `csh-${Date.now()}`,
      date: new Date().toISOString(),
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      description: formData.description || (formData.type === 'GELIR' ? 'Gelir Girişi' : 'Gider Çıkışı'),
    };

    storage.saveCashTransaction(newTx);
    refreshTransactions();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu kasa hareketini silmek istediğinize emin misiniz?')) {
      storage.deleteCashTransaction(id);
      refreshTransactions();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Kasa & Günlük Gelir/Gider Defteri</h2>
          <p className="text-slate-400 text-sm">Servis tahsilatları, parça alımları, dükkan masrafları ve net kasa durumu</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Kasa Hareketi Ekle</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Kasa Girişi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ₺{totalIncome.toLocaleString('tr-TR')}
          </h3>
          <span className="text-xs text-slate-500 mt-1 block">Tahsilatlar ve diğer gelirler</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Toplam Kasa Çıkışı</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-rose-400 mt-2 font-mono">
            ₺{totalExpense.toLocaleString('tr-TR')}
          </h3>
          <span className="text-xs text-slate-500 mt-1 block">Parça alımları ve dükkan giderleri</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Kasa Bakiyesi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-2xl font-bold mt-2 font-mono ${netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            ₺{netBalance.toLocaleString('tr-TR')}
          </h3>
          <span className="text-xs text-slate-500 mt-1 block">Mevcut eldeki net nakit akışı</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'ALL', label: 'Tüm Hareketler' },
          { id: 'GELIR', label: 'Sadece Gelirler' },
          { id: 'GIDER', label: 'Sadece Giderler' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
              filterType === tab.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Tür</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Açıklama</th>
                <th className="py-3.5 px-4">Ödeme Yolu</th>
                <th className="py-3.5 px-4 text-right">Tutar</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Kasa kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850 transition">
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">
                      {new Date(tx.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                        tx.type === 'GELIR'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.type === 'GELIR' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-300">
                      {tx.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-200 font-medium">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {tx.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                      tx.type === 'GELIR' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'GELIR' ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">Yeni Kasa Hareketi Ekle</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'GELIR', category: 'SERVIS_TAHSILAT' })}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    formData.type === 'GELIR'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  + Kasa Girişi (Gelir)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'GIDER', category: 'PARCA_ALIMI' })}
                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                    formData.type === 'GIDER'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  - Kasa Çıkışı (Gider)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {formData.type === 'GELIR' ? (
                    <>
                      <option value="SERVIS_TAHSILAT">Servis & Bakım Tahsilatı</option>
                      <option value="DIGER">Diğer Gelirler</option>
                    </>
                  ) : (
                    <>
                      <option value="PARCA_ALIMI">Yedek Parça & Yağ Alımı (Toptancı)</option>
                      <option value="KIRA_VE_AIDAT">Kira ve Sanayi Aidatı</option>
                      <option value="MAAS_VE_AVANS">Usta Maaşı ve Avans</option>
                      <option value="FATURALAR">Elektrik, Su, Doğalgaz</option>
                      <option value="DIGER">Diğer Atölye Giderleri</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Tutar (₺) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Ödeme Yolu
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="NAKIT">Nakit (Kasa)</option>
                  <option value="KREDI_KARTI">Kredi Kartı (POS)</option>
                  <option value="HAVALE">Banka Havalesi / EFT</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  placeholder="Örn: X Parçacıdan 5 teneke Castrol yağ alımı..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
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

