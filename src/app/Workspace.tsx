import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { BookingDrawer } from '../components/itinerary/BookingDrawer';
import { ParticipantDrawer } from '../components/people/ParticipantDrawer';
import { useTrip } from '../context/TripContext';
import { Overview } from './routes/Overview';
import { Itinerary } from './routes/Itinerary';
import { Expenses } from './routes/Expenses';
import { People } from './routes/People';
import { Settlements } from './routes/Settlements';

export const Workspace: React.FC<{ isDarkTheme: boolean; onThemeToggle: () => void }> = ({ isDarkTheme, onThemeToggle }) => {
  const { activeTab, isAddExpenseOpen, setIsAddExpenseOpen, selectedBookingId, setSelectedBookingId, selectedParticipantId, setSelectedParticipantId } = useTrip();
  const [menuOpen, setMenuOpen] = useState(false);
  const content = activeTab === 'itinerary' ? <Itinerary /> : activeTab === 'expenses' ? <Expenses /> : activeTab === 'people' ? <People /> : activeTab === 'settlements' ? <Settlements /> : <Overview />;

  return <div className="app-shell min-h-screen flex">
    <Sidebar />
    <div className="flex-1 min-w-0">
      <Topbar onMenuToggle={() => setMenuOpen(true)} isDarkTheme={isDarkTheme} onThemeToggle={onThemeToggle} />
      <main className="p-4 lg:p-8 max-w-[1600px] mx-auto">{content}</main>
    </div>
    {menuOpen && <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)}><div className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}><button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>×</button><Sidebar /></div></div>}
    {isAddExpenseOpen && <AddExpenseModal />}
    {selectedBookingId && <BookingDrawer />}
    {selectedParticipantId && <ParticipantDrawer />}
  </div>;
};
