import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { VehiclesView } from './components/VehiclesView';
import { CustomersView } from './components/CustomersView';
import { ServiceRecordsView } from './components/ServiceRecordsView';
import { InventoryView } from './components/InventoryView';
import { CashFlowView } from './components/CashFlowView';
import { RemindersView } from './components/RemindersView';
import { SettingsView } from './components/SettingsView';
import { NewServiceModal } from './components/NewServiceModal';
import { storage } from './services/storage';
import { Vehicle, ServiceRecord } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [quickSearchPlate, setQuickSearchPlate] = useState('');
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [preSelectedVehicle, setPreSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ServiceRecord | null>(null);

  // Stats for badge
  const reminders = storage.getReminders().filter(r => r.status === 'YAKLASAN');
  const activeServices = storage.getServiceRecords().filter(
    r => r.status === 'ISLEMDE' || r.status === 'PARCA_BEKLENIYOR'
  );
  const lowStock = storage.getLowStockItems();

  const handleQuickPlateSearch = () => {
    if (!quickSearchPlate.trim()) return;
    const vehicle = storage.getVehicleByPlate(quickSearchPlate);
    if (vehicle) {
      setSelectedVehicleForDetail(vehicle);
      setCurrentTab('vehicles');
    } else {
      alert(`"${quickSearchPlate.toUpperCase()}" plakalı araç bulunamadı. Yeni bir araç kaydı açabilirsiniz.`);
      setCurrentTab('vehicles');
    }
  };

  const handleOpenNewService = (vehicle?: Vehicle) => {
    setPreSelectedVehicle(vehicle || null);
    setIsNewServiceModalOpen(true);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForDetail(vehicle);
    setCurrentTab('vehicles');
  };

  const handleOpenServiceDetail = (record: ServiceRecord) => {
    setSelectedRecordForDetail(record);
    setCurrentTab('services');
  };

  const handleRecordCreated = (record: ServiceRecord) => {
    setSelectedRecordForDetail(record);
    setCurrentTab('services');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'vehicles') setSelectedVehicleForDetail(null);
          if (tab !== 'services') setSelectedRecordForDetail(null);
        }}
        onOpenNewService={() => handleOpenNewService()}
        quickSearchPlate={quickSearchPlate}
        setQuickSearchPlate={setQuickSearchPlate}
        onQuickSearch={handleQuickPlateSearch}
        reminderCount={reminders.length}
        activeServiceCount={activeServices.length}
        lowStockCount={lowStock.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenServiceDetail={handleOpenServiceDetail}
            onSelectVehicle={handleSelectVehicle}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehiclesView
            onOpenNewServiceForVehicle={(veh) => handleOpenNewService(veh)}
            onOpenServiceDetail={handleOpenServiceDetail}
            selectedVehicleForDetail={selectedVehicleForDetail}
            onClearSelectedVehicle={() => setSelectedVehicleForDetail(null)}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            onSelectVehicle={handleSelectVehicle}
          />
        )}

        {currentTab === 'services' && (
          <ServiceRecordsView
            onOpenNewService={() => handleOpenNewService()}
            selectedRecordForModal={selectedRecordForDetail}
            onCloseDetailModal={() => setSelectedRecordForDetail(null)}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryView />
        )}

        {currentTab === 'cashflow' && (
          <CashFlowView />
        )}

        {currentTab === 'reminders' && (
          <RemindersView />
        )}

        {currentTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* New Service / Work Order Modal */}
      <NewServiceModal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        onRecordCreated={handleRecordCreated}
        preSelectedVehicle={preSelectedVehicle}
      />
    </div>
  );
};
