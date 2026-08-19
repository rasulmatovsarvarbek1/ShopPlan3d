import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { BusinessSelectorPage } from './components/BusinessSelectorPage';
import { PlannerPage } from './components/3DPlanner/PlannerPage';
import { UserPanel } from './components/UserPanel';

export function App() {
  const { activePage } = useAppStore();

  return (
    <div className="app-container">
      <Navbar />

      <main style={{ flex: 1 }}>
        {activePage === 'landing' && <LandingPage />}
        {activePage === 'selector' && <BusinessSelectorPage />}
        {activePage === 'planner' && <PlannerPage />}
        {activePage === 'user-panel' && <UserPanel />}
      </main>

      {activePage !== 'planner' && (
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.5rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          background: '#fff'
        }}>
          © 2026 <strong style={{ color: 'var(--accent-blue)' }}>ShopPlan</strong> — Do'kon va Biznes Maydonini Rejalashtiruvchi
        </footer>
      )}
    </div>
  );
}

export default App;
