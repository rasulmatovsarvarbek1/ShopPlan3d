import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Store, LayoutGrid, Box, UserCircle, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { activePage, setActivePage, currency, setCurrency } = useAppStore();

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="brand-logo" onClick={() => setActivePage('landing')}>
        <div className="brand-icon">
          <Store size={20} color="#fff" />
        </div>
        <span className="brand-name">ShopPlan</span>
      </div>

      {/* Nav Links */}
      <div className="nav-links">
        <button
          className={`nav-btn ${activePage === 'landing' ? 'active' : ''}`}
          onClick={() => setActivePage('landing')}
        >
          <Sparkles size={15} />
          Bosh Sahifa
        </button>

        <button
          className={`nav-btn ${activePage === 'selector' ? 'active' : ''}`}
          onClick={() => setActivePage('selector')}
        >
          <LayoutGrid size={15} />
          Biznes Turlari
        </button>

        <button
          className={`nav-btn ${activePage === 'planner' || activePage === 'selector' ? 'active' : ''}`}
          onClick={() => setActivePage('selector')}
        >
          <Box size={15} />
          3D Rejalashtiruvchi
        </button>

        <button
          className={`nav-btn ${activePage === 'user-panel' ? 'active' : ''}`}
          onClick={() => setActivePage('user-panel')}
        >
          <UserCircle size={15} />
          Mening Profilim
        </button>
      </div>

      {/* Right Actions */}
      <div className="nav-right-actions">
        {/* Currency Switcher */}
        <div className="currency-toggle">
          <button
            className={`curr-item ${currency === 'USD' ? 'active' : ''}`}
            onClick={() => setCurrency('USD')}
          >
            $ USD
          </button>
          <button
            className={`curr-item ${currency === 'UZS' ? 'active' : ''}`}
            onClick={() => setCurrency('UZS')}
          >
            So'm
          </button>
        </div>

        {activePage !== 'planner' && (
          <button className="btn-primary" onClick={() => setActivePage('selector')}>
            <Sparkles size={15} />
            Loyiha Boshlash
          </button>
        )}
      </div>
    </nav>
  );
};
