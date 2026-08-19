import React from 'react';
import { useAppStore, UZS_RATE } from '../../store/useAppStore';
import { Maximize2, DollarSign, Package, Layers, Plus, Minus, Check } from 'lucide-react';

export const SidebarControls = () => {
  const {
    roomDimensions,
    setRoomDimensions,
    userBudget,
    setUserBudget,
    activeTier,
    setActiveTier,
    equipmentList,
    updateEquipmentCount,
    autoFillInventory,
    toggleAutoFill,
    currency,
    selectedCategory
  } = useAppStore();

  const area = roomDimensions.width * roomDimensions.length;

  const formatPrice = (usd) => {
    if (currency === 'UZS') {
      return (usd * UZS_RATE).toLocaleString('uz-UZ') + " So'm";
    }
    return "$" + usd.toLocaleString('en-US');
  };

  return (
    <div className="sidebar-panel">
      {/* Category Header */}
      <div style={{
        background: selectedCategory.gradient,
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        color: '#fff',
        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.4)'
      }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
          Tanlangan Shablon
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
          {selectedCategory.name}
        </div>
      </div>

      {/* Package Tier Pills */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          Paket Darajasi (Preset Tier)
        </div>
        <div className="tier-pills">
          <button
            className={`tier-btn ${activeTier === 'economy' ? 'active' : ''}`}
            onClick={() => setActiveTier('economy')}
          >
            Ekonom
          </button>
          <button
            className={`tier-btn ${activeTier === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTier('standard')}
          >
            Standart
          </button>
          <button
            className={`tier-btn ${activeTier === 'premium' ? 'active' : ''}`}
            onClick={() => setActiveTier('premium')}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Room Dimensions Sliders */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <Maximize2 size={18} color="var(--accent-cyan)" />
            Xona O'lchamlari
          </div>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)',
            padding: '2px 10px',
            borderRadius: '99px',
            fontSize: '0.82rem',
            fontWeight: 800
          }}>
            {area} m²
          </div>
        </div>

        {/* Width Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Eni (Width)</span>
            <span className="control-value">{roomDimensions.width} m</span>
          </div>
          <input
            type="range"
            min="3"
            max="30"
            step="0.5"
            className="range-slider"
            value={roomDimensions.width}
            onChange={(e) => setRoomDimensions({ width: parseFloat(e.target.value) })}
          />
        </div>

        {/* Length Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Bo'yi (Length)</span>
            <span className="control-value">{roomDimensions.length} m</span>
          </div>
          <input
            type="range"
            min="3"
            max="30"
            step="0.5"
            className="range-slider"
            value={roomDimensions.length}
            onChange={(e) => setRoomDimensions({ length: parseFloat(e.target.value) })}
          />
        </div>

        {/* Height Slider */}
        <div className="control-group">
          <div className="control-label">
            <span>Balandligi (Height)</span>
            <span className="control-value">{roomDimensions.height} m</span>
          </div>
          <input
            type="range"
            min="2.5"
            max="6.0"
            step="0.1"
            className="range-slider"
            value={roomDimensions.height}
            onChange={(e) => setRoomDimensions({ height: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      {/* Target Budget Input */}
      <div className="control-group">
        <div className="control-label">
          <span>Byudjet Chegarangiz ({currency})</span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={userBudget}
            onChange={(e) => setUserBudget(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Auto-Fill Inventory Switch */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer'
      }} onClick={toggleAutoFill}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', fontWeight: 600 }}>
          <Package size={18} color="var(--accent-emerald)" />
          Tovarlar bilan to'ldirish
        </div>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '4px',
          background: autoFillInventory ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {autoFillInventory && <Check size={14} color="#fff" />}
        </div>
      </div>

      {/* Equipment List Counter Controls */}
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={16} color="var(--accent-indigo)" />
          Jihozlar Katalogi va Soni
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {equipmentList.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatPrice(item.unitPrice)} / dona</div>
              </div>

              <div className="item-counter">
                <button className="count-btn" onClick={() => updateEquipmentCount(item.id, -1)}>
                  <Minus size={12} />
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                  {item.count}
                </span>
                <button className="count-btn" onClick={() => updateEquipmentCount(item.id, 1)}>
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
