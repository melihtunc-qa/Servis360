import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Wrench, 
  Bell, 
  Settings, 
  PlusCircle, 
  ShieldCheck,
  Search
} from 'lucide-react';

export type NavTab = 'dashboard' | 'vehicles' | 'customers' | 'services' | 'reminders' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewService: () => void;
  quickSearchPlate: string;
  setQuickSearchPlate: (val: string) => void;
  onQuickSearch: () => void;
  reminderCount: number;
  activeServiceCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewService,
  quickSearchPlate,
  setQuickSearchPlate,
  onQuickSearch,
  reminderCount,
  activeServiceCount,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Araçlar & Plaka', icon: Car },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { 
      id: 'services', 
      label: 'İş Emirleri', 
      icon: Wrench, 
      badge: activeServiceCount > 0 ? activeServiceCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    { 
      id: 'reminders', 
      label: 'Bakım Hatırlatma', 
      icon: Bell, 
      badge: reminderCount > 0 ? reminderCount : undefined,
      badgeColor: 'bg-rose-500'
    },
    { id: 'settings', label: 'Ayarlar & Yedek', icon: Settings },
  ];

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onQuickSearch();
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide leading-none">Servis360</h1>
          <span className="text-xs text-blue-400 font-medium">Oto Bakım & Müşteri Takip</span>
        </div>
      </div>

      {/* Quick Plate Search Widget */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          Hızlı Plaka Arama
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="34VR4821"
            value={quickSearchPlate}
            onChange={(e) => setQuickSearchPlate(e.target.value.toUpperCase())}
            onKeyDown={handleSearchKeyDown}
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 text-sm font-mono font-bold tracking-wider px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 uppercase transition"
          />
          <button
            onClick={onQuickSearch}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium text-xs flex items-center justify-center shrink-0"
            title="Plakayı Sorgula"
          >
            Bul
          </button>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenNewService}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition duration-200 active:scale-98"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Yeni İş Emri Aç</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Lokal SQLite DB
          </span>
          <span className="text-[11px] font-mono text-slate-600">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

