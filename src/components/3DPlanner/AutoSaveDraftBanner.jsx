import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatDraftAge } from '../../utils/autosaveStorage';
import { FolderOpen, RotateCcw, X } from 'lucide-react';

export const AutoSaveDraftBanner = () => {
  const { pendingAutosaveDraft, restoreFromAutosaveDraft, dismissAutosaveDraft, hideAutosaveDraftBanner } = useAppStore();

  if (!pendingAutosaveDraft) return null;

  const age = formatDraftAge(pendingAutosaveDraft.savedAt);

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#fff',
      border: '1.5px solid var(--accent-blue)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '520px',
      width: 'calc(100% - 2rem)',
      animation: 'fadeIn 0.3s ease',
      position: 'relative',
    }}>
      {/* Yopish (X) tugmasi — faqat bannerni yashiradi, loyihani o'chirmaydi */}
      <button
        onClick={hideAutosaveDraftBanner}
        title="Yopish"
        style={{
          position: 'absolute',
          top: '-9px',
          right: '-9px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
          padding: 0,
        }}
      >
        <X size={13} />
      </button>

      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'var(--accent-blue-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FolderOpen size={20} color="var(--accent-blue)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          Saqlanmagan loyihangiz topildi
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Oxirgi o'zgarish: {age}. Davom ettirasizmi?
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          className="btn-primary"
          style={{ padding: '7px 14px', fontSize: '0.82rem' }}
          onClick={restoreFromAutosaveDraft}
        >
          <RotateCcw size={14} />
          Davom ettirish
        </button>
        <button
          className="btn-secondary"
          style={{ padding: '7px 12px', fontSize: '0.82rem' }}
          onClick={dismissAutosaveDraft}
        >
          Yangi boshlash
        </button>
      </div>
    </div>
  );
};