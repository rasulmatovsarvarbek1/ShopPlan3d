import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Cloud, Check } from 'lucide-react';

export const AutoSaveIndicator = () => {
  const { autosaveJustSaved } = useAppStore();

  if (!autosaveJustSaved) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      zIndex: 9000,
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid var(--border-color)',
      borderRadius: '99px',
      padding: '5px 12px',
      fontSize: '0.72rem',
      fontWeight: 600,
      color: 'var(--accent-emerald)',
      boxShadow: 'var(--shadow-sm)',
      pointerEvents: 'none',
      animation: 'fadeIn 0.2s ease',
    }}>
      <Check size={12} />
      Saqlandi
    </div>
  );
};

/** Doimiy kichik bulut ikonkasi (planner rejimida) */
export const AutoSaveCloudIcon = () => (
  <div
    title="Avtomatik saqlash yoqilgan"
    style={{
      position: 'absolute',
      top: '0.75rem',
      right: '0.75rem',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: 'rgba(255,255,255,0.9)',
      border: '1px solid var(--border-color)',
      borderRadius: '99px',
      padding: '4px 10px',
      fontSize: '0.68rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      pointerEvents: 'none',
    }}
  >
    <Cloud size={11} />
    Auto-save
  </div>
);
