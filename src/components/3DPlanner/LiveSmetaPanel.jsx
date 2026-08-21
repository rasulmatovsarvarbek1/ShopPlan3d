import React, { useState } from 'react';
import { useAppStore, UZS_RATE } from '../../store/useAppStore';
import confetti from 'canvas-confetti';
import { Calculator, Download, Save, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export const LiveSmetaPanel = () => {
  const {
    roomDimensions,
    equipmentList,
    autoFillInventory,
    selectedCategory,
    userBudget,
    currency,
    saveCurrentProject
  } = useAppStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [projName, setProjName] = useState('');

  const area = roomDimensions.width * roomDimensions.length;

  // Cost Calculations
  const equipmentTotal = equipmentList.reduce((sum, item) => sum + (item.unitPrice * item.count), 0);
  const inventoryTotal = autoFillInventory ? Math.round(area * selectedCategory.inventoryPricePerM2) : 0;
  const renovationTotal = Math.round(area * selectedCategory.renovationPricePerM2);
  const grandTotal = equipmentTotal + inventoryTotal + renovationTotal;

  const budgetUsagePercent = Math.min(100, Math.round((grandTotal / userBudget) * 100));
  const isOverBudget = grandTotal > userBudget;

  const formatPrice = (usd) => {
    if (currency === 'UZS') {
      return (usd * UZS_RATE).toLocaleString('uz-UZ') + " So'm";
    }
    return "$" + usd.toLocaleString('en-US');
  };

  const handleSave = () => {
    saveCurrentProject(projName.trim() || `${selectedCategory.name} (${area} m²)`);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportPrint = () => {
    window.print();
  };

  return (
    <div className="right-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 800 }}>
        <Calculator color="var(--accent-emerald)" size={22} />
        Real-Vaqt Smeta Kalkulyatori
      </div>

      {/* Grand Total Card */}
      <div className="smeta-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
          Umumiy Boshlang'ich Smeta
        </div>
        <div className="smeta-total">
          {formatPrice(grandTotal)}
        </div>

        {/* Budget Limit Progress */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Byudjetga sig'ish ({budgetUsagePercent}%)</span>
            <span style={{ color: isOverBudget ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              Target: {formatPrice(userBudget)}
            </span>
          </div>

          <div className="budget-progress-bar">
            <div
              className="budget-fill"
              style={{
                width: `${budgetUsagePercent}%`,
                backgroundColor: isOverBudget ? 'var(--accent-rose)' : 'var(--accent-emerald)'
              }}
            ></div>
          </div>

          {isOverBudget && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--accent-rose)',
              marginTop: '6px'
            }}>
              <AlertTriangle size={14} />
              Byudjet chegarsidan {formatPrice(grandTotal - userBudget)} oshdi.
            </div>
          )}
        </div>
      </div>

      {/* Itemized Cost Breakdown */}
      <div className="smeta-card">
        <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
          Hisob-Kitob Tarkibi
        </div>

        <div className="smeta-row">
          <span>1. Jihozlar ({equipmentList.reduce((acc, i) => acc + i.count, 0)} ta item)</span>
          <strong style={{ color: '#fff' }}>{formatPrice(equipmentTotal)}</strong>
        </div>

        <div className="smeta-row">
          <span>2. Tovarlar Zapaslari ({area} m²)</span>
          <strong style={{ color: autoFillInventory ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
            {autoFillInventory ? formatPrice(inventoryTotal) : "O'chirilgan"}
          </strong>
        </div>

        <div className="smeta-row">
          <span>3. Yoritish va Ta'mirlash Smetasi</span>
          <strong style={{ color: '#fff' }}>{formatPrice(renovationTotal)}</strong>
        </div>
      </div>

      {/* Save Project Section */}
      <div className="smeta-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Loyihani Saqlab Qo'yish
        </div>

        <input
          type="text"
          placeholder="Loyiha nomini kiriting..."
          value={projName}
          onChange={(e) => setProjName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: '#f8fafc',
            border: '1.5px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
          }}
        />

        <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={handleSave}>
          {savedSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
          {savedSuccess ? "Saqlandi!" : "Loyihani Saqlash"}
        </button>
      </div>

      {/* Export Report */}
      <button
        className="btn-secondary"
        style={{ justifyContent: 'center', width: '100%', padding: '12px' }}
        onClick={handleExportPrint}
      >
        <FileText size={16} />
        Smetani Eksport / Chop Etish
      </button>
    </div>
  );
};
