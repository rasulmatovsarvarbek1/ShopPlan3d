import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SidebarControls } from './SidebarControls';
import { RoomCanvas } from './RoomCanvas';
import { LiveSmetaPanel } from './LiveSmetaPanel';
import { AutoSaveIndicator, AutoSaveCloudIcon } from './AutoSaveIndicator';
import { usePlannerAutosave } from '../../hooks/usePlannerAutosave';
import { Eye, Box, ArrowLeft, Lock, Unlock, Undo2, Redo2, Menu, Calculator, SlidersHorizontal } from 'lucide-react';

export const PlannerPage = () => {
  const {
    viewMode,
    setViewMode,
    setActivePage,
    roomLocked,
    toggleRoomLocked,
    undoPosition,
    redoPosition,
    positionHistory,
    positionFuture
  } = useAppStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileSmetaOpen, setIsMobileSmetaOpen] = useState(false);

  usePlannerAutosave();

  return (
    <div className="animate-fade-in planner-root-container">
      {/* ── Mobil Backdrop Overlay (Ixtiyoriy panel ochiq bo'lganda) ── */}
      {(isMobileSidebarOpen || isMobileSmetaOpen) && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => {
            setIsMobileSidebarOpen(false);
            setIsMobileSmetaOpen(false);
          }}
        />
      )}

      {/* ── 768px dan kichiklarda Chap tarafda Burger Icon Tugmasi ── */}
      <button
        className="mobile-sidebar-toggle-btn"
        onClick={() => {
          setIsMobileSidebarOpen(v => !v);
          setIsMobileSmetaOpen(false);
        }}
        title="Jihozlar va Shablonlar menyusi"
      >
        <Menu size={18} />
        <span>Jihozlar</span>
      </button>

      {/* ── 768px dan kichiklarda O'ng tarafda Smeta Tugmasi ── */}
      <button
        className="mobile-smeta-toggle-btn"
        onClick={() => {
          setIsMobileSmetaOpen(v => !v);
          setIsMobileSidebarOpen(false);
        }}
        title="Jonli Smeta va Hisob-kitob"
      >
        <Calculator size={17} />
        <span>Smeta</span>
      </button>

      <div className="planner-wrapper">
        <SidebarControls
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div className="viewport-toolbar">
            <button
              className="toolbar-btn"
              onClick={() => setActivePage('selector')}
              title="Biznes shablonini o'zgartirish"
            >
              <ArrowLeft size={15} />
              Shablonni O'zgartirish
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }}></div>

            <button
              className={`toolbar-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <Box size={15} />
              3D Perspektiv
            </button>

            <button
              className={`toolbar-btn ${viewMode === 'top2d' ? 'active' : ''}`}
              onClick={() => setViewMode('top2d')}
            >
              <Eye size={15} />
              2D Tepadan Ko'rinish
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }}></div>

            {/* Xonani qulflash/ochish tugmasi */}
            <button
              className={`toolbar-btn ${roomLocked ? 'active' : ''}`}
              onClick={toggleRoomLocked}
              title={roomLocked ? "Kamera qulflangan — bosing ochish uchun" : "Kamerani qulflash (aylanishni to'xtatish)"}
              style={{ padding: '7px 9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {roomLocked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }}></div>

            {/* Undo / Redo tugmalari */}
            <button
              className="toolbar-btn"
              onClick={undoPosition}
              disabled={positionHistory.length === 0}
              title="Orqaga qaytarish (Ctrl + Z)"
              style={{ opacity: positionHistory.length === 0 ? 0.4 : 1, cursor: positionHistory.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <Undo2 size={15} />
              Undo
            </button>

            <button
              className="toolbar-btn"
              onClick={redoPosition}
              disabled={positionFuture.length === 0}
              title="Qaytarish (Ctrl + Y)"
              style={{ opacity: positionFuture.length === 0 ? 0.4 : 1, cursor: positionFuture.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <Redo2 size={15} />
              Redo
            </button>
          </div>

          <AutoSaveCloudIcon />
          <RoomCanvas />
        </div>

        <LiveSmetaPanel
          isMobileOpen={isMobileSmetaOpen}
          onClose={() => setIsMobileSmetaOpen(false)}
        />
      </div>

      <AutoSaveIndicator />
    </div>
  );
};
