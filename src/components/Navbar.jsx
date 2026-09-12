import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Store, LayoutGrid, Box, UserCircle, Sparkles, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { activePage, setActivePage, currency, setCurrency } = useAppStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handlePlannerClick = () => {
    if (activePage !== 'planner') {
      setActivePage('selector');
    }
    setMobileNavOpen(false);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileNavOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <div className="brand-logo" onClick={() => handleNavClick('landing')}>
          <div className="brand-icon">
            <Store size={20} color="#fff" />
          </div>
          <span className="brand-name">ShopPlan</span>
        </div>

        {/* Desktop Nav Links (hidden on <= 768px via CSS) */}
        <div className="nav-links desktop-only">
          <button
            className={`nav-btn ${activePage === 'landing' ? 'active' : ''}`}
            onClick={() => handleNavClick('landing')}
          >
            <Sparkles size={15} />
            Bosh Sahifa
          </button>

          <button
            className={`nav-btn ${activePage === 'selector' ? 'active' : ''}`}
            onClick={() => handleNavClick('selector')}
          >
            <LayoutGrid size={15} />
            Biznes Turlari
          </button>

          <button
            className={`nav-btn ${activePage === 'planner' ? 'active' : ''}`}
            onClick={handlePlannerClick}
          >
            <Box size={15} />
            3D Rejalashtiruvchi
          </button>

          <button
            className={`nav-btn ${activePage === 'user-panel' ? 'active' : ''}`}
            onClick={() => handleNavClick('user-panel')}
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
            <button className="btn-primary desktop-only" onClick={() => handleNavClick('selector')}>
              <Sparkles size={15} />
              Loyiha Boshlash
            </button>
          )}

          {/* Mobile Navbar Hamburger Toggle Button (visible on <= 768px) */}
          <button
            className="navbar-mobile-burger-btn"
            onClick={() => setMobileNavOpen(v => !v)}
            aria-label="Menyu"
            title="Asosiy Menyu"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Backdrop & Slide-down Menu */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)}>
          <div className="mobile-nav-menu" onClick={e => e.stopPropagation()}>
            <button
              className={`mobile-nav-link ${activePage === 'landing' ? 'active' : ''}`}
              onClick={() => handleNavClick('landing')}
            >
              <Sparkles size={18} />
              <span>Bosh Sahifa</span>
            </button>

            <button
              className={`mobile-nav-link ${activePage === 'selector' ? 'active' : ''}`}
              onClick={() => handleNavClick('selector')}
            >
              <LayoutGrid size={18} />
              <span>Biznes Turlari</span>
            </button>

            <button
              className={`mobile-nav-link ${activePage === 'planner' ? 'active' : ''}`}
              onClick={handlePlannerClick}
            >
              <Box size={18} />
              <span>3D Rejalashtiruvchi</span>
            </button>

            <button
              className={`mobile-nav-link ${activePage === 'user-panel' ? 'active' : ''}`}
              onClick={() => handleNavClick('user-panel')}
            >
              <UserCircle size={18} />
              <span>Mening Profilim</span>
            </button>

            {activePage !== 'planner' && (
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={() => handleNavClick('selector')}
              >
                <Sparkles size={16} />
                Loyiha Boshlash
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
