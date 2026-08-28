import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SidebarControls } from './SidebarControls';
import { RoomCanvas } from './RoomCanvas';
import { LiveSmetaPanel } from './LiveSmetaPanel';
import { AutoSaveIndicator, AutoSaveCloudIcon } from './AutoSaveIndicator';
import { usePlannerAutosave } from '../../hooks/usePlannerAutosave';
import { Eye, Box, ArrowLeft } from 'lucide-react';

export const PlannerPage = () => {
  const { viewMode, setViewMode, setActivePage } = useAppStore();

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
