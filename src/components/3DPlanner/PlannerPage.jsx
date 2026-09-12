import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SidebarControls } from './SidebarControls';
import { RoomCanvas } from './RoomCanvas';
import { LiveSmetaPanel } from './LiveSmetaPanel';
import { AutoSaveIndicator, AutoSaveCloudIcon } from './AutoSaveIndicator';
import { usePlannerAutosave } from '../../hooks/usePlannerAutosave';
import { Eye, Box, ArrowLeft, Lock, Unlock, Undo2, Redo2 } from 'lucide-react';

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

  usePlannerAutosave();

  return (
    <div className="animate-fade-in">
      <div className="planner-wrapper">
        <SidebarControls />

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

        <LiveSmetaPanel />
      </div>

      <AutoSaveIndicator />
    </div>
  );
};
