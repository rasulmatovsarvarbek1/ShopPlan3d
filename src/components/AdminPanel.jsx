import React, { useState } from 'react';
import { useAppStore, UZS_RATE } from '../store/useAppStore';
import { BUSINESS_CATEGORIES } from '../data/businessCategories';
import { ShieldCheck, Plus, Edit2, Save, Layers, DollarSign, Settings } from 'lucide-react';

export const AdminPanel = () => {
  const { currency } = useAppStore();
  const [selectedCatId, setSelectedCatId] = useState(BUSINESS_CATEGORIES[0].id);
  const [customRates, setCustomRates] = useState({
    uzsRate: UZS_RATE,
    taxPercent: 12
  });

  const selectedCategory = BUSINESS_CATEGORIES.find(c => c.id === selectedCatId) || BUSINESS_CATEGORIES[0];

  const formatPrice = (usd) => {
    if (currency === 'UZS') {
      return (usd * customRates.uzsRate).toLocaleString('uz-UZ') + " So'm";
    }
    return "$" + usd.toLocaleString('en-US');
  };

  return (
    <div className="selector-container animate-fade-in" style={{ maxWidth: '1150px' }}>
      <div className="section-header">
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <ShieldCheck color="var(--accent-indigo)" size={32} />
          Admin Panel — Boshqaruv Dashboardi
        </h1>
        <p className="section-subtitle">
          10 ta biznes sektori bo'yicha 3D jihozlar kataloqlari, birlik narxlari va smeta stavkalarini boshqarish paneli.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        {/* Left Category List */}
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Biznes Kataloglari
          </div>

          {BUSINESS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: selectedCatId === cat.id ? 'var(--accent-indigo)' : 'transparent',
                color: selectedCatId === cat.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'left',
                transition: 'var(--transition-fast)'
              }}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Right Editor Area */}
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
                Shablon Sozlamalari
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                {selectedCategory.name}
              </h2>
            </div>

            <button className="btn-primary" onClick={() => alert("Smeta tariflari va narxlar muvaffaqiyatli yangilandi!")}>
              <Save size={16} />
              O'zgarishlarni Saqlash
            </button>
          </div>

          {/* Rates Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Tovarlar Zapaslari Stavkasi / m²
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {formatPrice(selectedCategory.inventoryPricePerM2)}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Yoritish va Ta'mirlash Stavkasi / m²
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {formatPrice(selectedCategory.renovationPricePerM2)}
              </div>
            </div>
          </div>

          {/* Preset Equipment Table */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-indigo)" />
              Standart Paket Jihozlari va Birlik Narxlari
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '10px', color: '#fff' }}>Jihoz Nomi</th>
                  <th style={{ padding: '10px', color: '#fff' }}>Turi</th>
                  <th style={{ padding: '10px', color: '#fff' }}>Birlik Narxi</th>
                  <th style={{ padding: '10px', color: '#fff' }}>Standart Soni</th>
                </tr>
              </thead>
              <tbody>
                {selectedCategory.equipmentPresets.standard.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', color: '#fff', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '10px' }}>{item.type}</td>
                    <td style={{ padding: '10px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td style={{ padding: '10px' }}>{item.count} dona</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
