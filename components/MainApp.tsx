'use client';

import { useState } from 'react';
import { LayoutDashboard, Dumbbell, UtensilsCrossed, Settings } from 'lucide-react';
import DashboardTab from './DashboardTab';
import TrainingTab from './TrainingTab';
import DietTab from './DietTab';
import SettingsTab from './SettingsTab';

const tabs = [
  { id: 'dashboard', label: '總覽', Icon: LayoutDashboard },
  { id: 'training', label: '訓練', Icon: Dumbbell },
  { id: 'diet', label: '飲食', Icon: UtensilsCrossed },
  { id: 'settings', label: '設定', Icon: Settings },
];

export default function MainApp() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div style={{ paddingBottom: 80 }}>
      {tab === 'dashboard' && <DashboardTab onNavigate={setTab} />}
      {tab === 'training' && <TrainingTab />}
      {tab === 'diet' && <DietTab />}
      {tab === 'settings' && <SettingsTab onLogout={() => { localStorage.clear(); window.location.reload(); }} />}

      <nav className="bottom-nav">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
