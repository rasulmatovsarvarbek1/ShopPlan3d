import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, UZS_RATE } from '../../store/useAppStore';
import { Maximize2, Package, Layers, Plus, Minus, Check, Users, Sun, Moon, Zap, AlertTriangle, CheckCircle2, Trash2, Clock, PackagePlus, X, Undo2 } from 'lucide-react';

// ─── Raqam bosilganda klaviatura bilan to'g'ridan-to'g'ri son yozish imkoniyati ───
const EquipmentItemCounter = ({ item, meta, updateEquipmentCount, setEquipmentCount }) => {
  const [val, setVal] = useState(item.count);

  useEffect(() => {
    setVal(item.count);
  }, [item.count]);

  const commitValue = (inputVal) => {
    const parsed = parseInt(inputVal, 10);
    const validCount = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setVal(validCount);
    setEquipmentCount(item.id, validCount);
  };

  return (
    <div
      className="item-counter"
      style={{ flexShrink: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="count-btn"
        onClick={(e) => {
          e.stopPropagation();
          updateEquipmentCount(item.id, -1);
        }}
        style={{ background: item.count === 0 ? '#f1f5f9' : undefined }}
      >
        <Minus size={11} />
      </button>

      <input
        type="number"
        min="0"
        max="999"
        inputMode="numeric"
        pattern="[0-9]*"
        value={val === 0 && val !== item.count ? '' : val}
        placeholder="0"
        title="Raqam yozish uchun bosing"
        onFocus={(e) => {
          e.stopPropagation();
          e.target.select();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.target.select();
        }}
        onChange={(e) => {
          const raw = e.target.value;
          setVal(raw);
          if (raw !== '') {
            const parsed = parseInt(raw, 10);
            if (!isNaN(parsed) && parsed >= 0) {
              setEquipmentCount(item.id, parsed);
            }
          }
        }}
        onBlur={(e) => {
          commitValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitValue(e.target.value);
            e.target.blur();
          }
        }}
        style={{
          width: '36px',
          height: '24px',
          padding: '0 2px',
          fontSize: '0.88rem',
          fontWeight: 800,
          textAlign: 'center',
          border: '1.5px solid transparent',
          borderRadius: '4px',
          background: 'transparent',
          color: item.count > 0 ? meta.border : 'var(--text-muted)',
          outline: 'none',
          cursor: 'text',
          MozAppearance: 'textfield'
        }}
      />

      <button
        type="button"
        className="count-btn"
        onClick={(e) => {
          e.stopPropagation();
          updateEquipmentCount(item.id, 1);
        }}
        style={{ background: meta.bg, borderColor: meta.border }}
      >
        <Plus size={11} />
      </button>
    </div>
  );
};

// ─── Swipeable Jihoz Kartochkasi (Surilganda o'z o'rnida 3s orqaga qaytarish ↩️ belgisi turadi) ───
const SwipeableEquipmentCard = ({
  item,
  meta,
  formatPrice,
  updateEquipmentCount,
  setEquipmentCount,
  removeCustomEquipmentItem
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isPermanentlyDeleted, setIsPermanentlyDeleted] = useState(false);
  const startXRef = useRef(0);
  const hasMovedRef = useRef(false);
  const timerRef = useRef(null);

  // 3 sekund ichida bosilmasa o'z-o'zidan butunlay yo'q bo'ladi
  useEffect(() => {
    if (isSwiped && !isPermanentlyDeleted) {
      timerRef.current = setTimeout(() => {
        setIsPermanentlyDeleted(true);
        setTimeout(() => {
          removeCustomEquipmentItem(item.id);
        }, 220);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isSwiped, isPermanentlyDeleted, item.id, removeCustomEquipmentItem]);

  const handlePointerDown = (e) => {
    if (!item.custom || isSwiped || isPermanentlyDeleted) return;
    if (e.target.closest('button') || e.target.closest('input')) return;

    startXRef.current = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isSwiped || isPermanentlyDeleted) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const diff = clientX - startXRef.current;

    // Faqat o'ngdan chapga surish
    if (diff < 0) {
      if (Math.abs(diff) > 4) {
        hasMovedRef.current = true;
      }
      // Yarmigacha (40px) surilganda o'z o'rnida qaytarish holatiga o'tadi
      if (diff <= -40) {
        triggerSwipe();
        return;
      }
      setOffsetX(diff);
    } else {
      setOffsetX(0);
    }
  };

  const triggerSwipe = () => {
    setIsDragging(false);
    setIsSwiped(true);
    setOffsetX(-400);
  };

  const handlePointerUp = () => {
    if (!isDragging || isSwiped || isPermanentlyDeleted) return;
    setIsDragging(false);

    if (offsetX < -25) {
      triggerSwipe();
    } else {
      setOffsetX(0);
    }
  };

  const handleUndo = (e) => {
    e.stopPropagation();
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSwiped(false);
    setOffsetX(0);
  };

  const handleCardClick = () => {
    if (hasMovedRef.current || isSwiped || isPermanentlyDeleted) return;
    updateEquipmentCount(item.id, 1);
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-sm)',
        transition: 'max-height 0.22s ease, margin 0.22s ease, opacity 0.22s ease',
        maxHeight: isPermanentlyDeleted ? '0px' : '90px',
        opacity: isPermanentlyDeleted ? 0 : 1,
        marginBottom: isPermanentlyDeleted ? '0px' : '0.5rem'
      }}
    >
      {/* Surilgandan keyin kartochka o'rnida turadigan 3 sekundlik qaytarish iconi */}
      {isSwiped ? (
        <div
          style={{
            height: '56px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px dashed #94a3b8',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <button
            onClick={handleUndo}
            title="Orqaga qaytarish"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid #2563eb',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.15s, background 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = '#dbeafe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#eff6ff';
            }}
          >
            <Undo2 size={20} />
          </button>
        </div>
      ) : (
        /* Asosiy Kartochka */
        <div
          onClick={handleCardClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: item.count > 0 ? meta.bg : '#f8fafc',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: `1.5px solid ${item.count > 0 ? meta.border : '#e2e8f0'}`,
            cursor: isDragging ? 'grabbing' : 'pointer',
            transform: `translateX(${offsetX}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease, background 0.15s ease',
            boxShadow: item.count > 0 ? `0 2px 8px ${meta.border}22` : 'none',
            userSelect: 'none',
            touchAction: 'pan-y'
          }}
        >
          {/* SVG mini chizma preview */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: meta.bg,
            border: `2px solid ${meta.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <ShapePreviewSVG type={item.type} color={item.color || meta.border} size={34} />
          </div>

          {/* Name & price */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {formatPrice(item.unitPrice)} / dona
            </div>
          </div>

          {/* Interactive Counter with Keyboard & Direct Number Input */}
          <EquipmentItemCounter
            item={item}
            meta={meta}
            updateEquipmentCount={updateEquipmentCount}
            setEquipmentCount={setEquipmentCount}
          />
        </div>
      )}
    </div>
  );
};

// ─── Har bir 3D tip uchun meta (bg, border rang) ───
const SHAPE_META = {
  fridge:             { bg: '#dbeafe', border: '#3b82f6' },
  wall_shelf:         { bg: '#f0fdf4', border: '#10b981' },
  counter:            { bg: '#fef3c7', border: '#d97706' },
  island_shelf:       { bg: '#ede9fe', border: '#7c3aed' },
  produce:            { bg: '#dcfce7', border: '#16a34a' },
  chest_freezer:      { bg: '#e0f2fe', border: '#0891b2' },
  mannequin:          { bg: '#ffe4e6', border: '#e11d48' },
  clothing_rack:      { bg: '#fce7f3', border: '#ec4899' },
  center_rack:        { bg: '#f3e8ff', border: '#a855f7' },
  shoe_shelf:         { bg: '#fff7ed', border: '#f97316' },
  fitting_room:       { bg: '#f1f5f9', border: '#475569' },
  treadmill:          { bg: '#fef9c3', border: '#ca8a04' },
  bike:               { bg: '#ecfdf5', border: '#059669' },
  stationary_bike:    { bg: '#ecfdf5', border: '#059669' },
  bench:              { bg: '#fdf2f8', border: '#db2777' },
  flat_bench:         { bg: '#f8fafc', border: '#64748b' },
  adjustable_bench:   { bg: '#f1f5f9', border: '#475569' },
  crossover:          { bg: '#eff6ff', border: '#2563eb' },
  dumbbell_rack:      { bg: '#fafafa', border: '#64748b' },
  kettlebell_rack:    { bg: '#fff7ed', border: '#ea580c' },
  medicine_ball_rack: { bg: '#fdf2f8', border: '#db2777' },
  plyo_boxes:         { bg: '#fef3c7', border: '#d97706' },
  trx:                { bg: '#fef9c3', border: '#eab308' },
  mats_rollers:       { bg: '#ecfdf5', border: '#10b981' },
  squat_cage:         { bg: '#f1f5f9', border: '#334155' },
  smith_machine:      { bg: '#f8fafc', border: '#475569' },
  olympic_barbell:    { bg: '#fef2f2', border: '#ef4444' },
  weight_plates:      { bg: '#eff6ff', border: '#3b82f6' },
  chest_press:        { bg: '#f0fdf4', border: '#16a34a' },
  shoulder_press:     { bg: '#fefce8', border: '#ca8a04' },
  seated_row:         { bg: '#faf5ff', border: '#9333ea' },
  stair_climber:      { bg: '#e0f2fe', border: '#0284c7' },
  leg_press:          { bg: '#e0f2fe', border: '#0284c7' },
  lat_pulldown:       { bg: '#f1f5f9', border: '#475569' },
  elliptical:         { bg: '#ecfdf5', border: '#10b981' },
  punching_bag:       { bg: '#fef2f2', border: '#ef4444' },
  lockers:            { bg: '#f0f9ff', border: '#0284c7' },
  table:              { bg: '#fdf4ff', border: '#c026d3' },
  tv_wall:            { bg: '#f1f5f9', border: '#334155' },
  seating:            { bg: '#fff7ed', border: '#b45309' },
  sofa:               { bg: '#fef3c7', border: '#92400e' },
  drawer:             { bg: '#f0fdfa', border: '#0d9488' },
  tire_stand:         { bg: '#f8fafc', border: '#475569' },
  oil_display:        { bg: '#fefce8', border: '#a16207' },
  flower_stand:       { bg: '#fdf2f8', border: '#ec4899' },
  cold_room:          { bg: '#e0f2fe', border: '#0369a1' },
  demo_table:         { bg: '#eff6ff', border: '#1d4ed8' },
  coffee_bar:         { bg: '#fef3c7', border: '#78350f' },
  book_shelf:         { bg: '#f5f3ff', border: '#6d28d9' },
  stationery:         { bg: '#fdf4ff', border: '#c026d3' },
  read_table:         { bg: '#eff6ff', border: '#2563eb' },
  default:            { bg: '#f1f5f9', border: '#94a3b8' },
};

// ─── RoomCanvas.jsx'da mavjud barcha 3D shakllar — Yangi jihoz qo'shishda tanlash uchun ───
// Guruhlangan holda: foydalanuvchi to'g'ri kategoriyaga mos shaklni tanlaydi (masalan fitnes uchun trenajyor shakli)
const SHAPE_TYPE_GROUPS = [
  {
    label: 'Fitnes / Sport Zali',
    options: [
      { value: 'treadmill', label: 'Yugurish trenajyori (Treadmill)' },
      { value: 'bike', label: 'Velosiped trenajyori' },
      { value: 'stationary_bike', label: 'Statsionar velosiped' },
      { value: 'bench', label: 'Bench Press' },
      { value: 'flat_bench', label: 'Yassi skameyka' },
      { value: 'adjustable_bench', label: 'Moslashuvchan skameyka' },
      { value: 'crossover', label: 'Crossover mashinasi' },
      { value: 'leg_press', label: 'Leg Press' },
      { value: 'lat_pulldown', label: 'Lat Pulldown' },
      { value: 'chest_press', label: "Ko'krak Press mashinasi" },
      { value: 'shoulder_press', label: 'Yelka Press mashinasi' },
      { value: 'seated_row', label: "O'tirib tortish mashinasi" },
      { value: 'stair_climber', label: 'Zinapoya trenajyori' },
      { value: 'elliptical', label: 'Elliptik trenajyor' },
      { value: 'squat_cage', label: 'Squat qafasi' },
      { value: 'smith_machine', label: 'Smith mashinasi' },
      { value: 'olympic_barbell', label: 'Shtanga stendi' },
      { value: 'weight_plates', label: "Og'irlik disklari stendi" },
      { value: 'dumbbell_rack', label: 'Gantel stendi' },
      { value: 'kettlebell_rack', label: 'Girya stendi' },
      { value: 'medicine_ball_rack', label: "Meditsina to'pi stendi" },
      { value: 'plyo_boxes', label: 'Plyo qutilar' },
      { value: 'trx', label: 'TRX tizimi' },
      { value: 'mats_rollers', label: 'Gilamcha / Rolikli mashq' },
      { value: 'punching_bag', label: 'Boks grushasi' },
      { value: 'lockers', label: 'Shkaflar' },
    ]
  },
  {
    label: "Do'kon / Savdo",
    options: [
      { value: 'wall_shelf', label: 'Devoriy stellaj' },
      { value: 'island_shelf', label: 'Orol javon' },
      { value: 'counter', label: 'Kassa stoli' },
      { value: 'produce', label: 'Meva-sabzavot stendi' },
      { value: 'fridge', label: 'Vertikal muzlatgich' },
      { value: 'chest_freezer', label: 'Gorizontal muzlatgich' },
      { value: 'cold_room', label: 'Sovutish xonasi' },
      { value: 'oil_display', label: 'Vitrina stend' },
      { value: 'tire_stand', label: 'Shina/Aylanma stend' },
      { value: 'demo_table', label: 'Demo stol' },
    ]
  },
  {
    label: 'Kiyim-kechak',
    options: [
      { value: 'clothing_rack', label: 'Kiyim ilgichi (devoriy)' },
      { value: 'center_rack', label: 'Aylana kiyim stendi' },
      { value: 'mannequin', label: 'Maneken' },
      { value: 'shoe_shelf', label: 'Poyabzal javoni' },
      { value: 'fitting_room', label: 'Kiyinish xonasi' },
      { value: 'drawer', label: 'Tortmali javon' },
    ]
  },
  {
    label: 'Kafe / Ofis / Boshqa',
    options: [
      { value: 'coffee_bar', label: 'Kofe bar' },
      { value: 'seating', label: "Stol va o'tirish joyi" },
      { value: 'sofa', label: 'Divan' },
      { value: 'table', label: 'Stol' },
      { value: 'tv_wall', label: 'TV devor' },
      { value: 'flower_stand', label: 'Gul stendi' },
      { value: 'book_shelf', label: 'Kitob javoni' },
      { value: 'stationery', label: 'Kantselyariya stendi' },
      { value: 'read_table', label: "O'qish stoli" },
      { value: 'custom', label: 'Oddiy quti (standart shakl)' },
    ]
  }
];

// ─── Mini SVG chizma — har bir tip uchun alohida ───
const ShapePreviewSVG = ({ type, color, size = 38 }) => {
  const c = color || '#64748b';
  const S = size;
  const cx = S / 2, cy = S / 2;

  const svgProps = { width: S, height: S, viewBox: `0 0 ${S} ${S}`, xmlns: 'http://www.w3.org/2000/svg' };

  switch (type) {
    // ── Muzlatgich ─────────────────────────────
    case 'fridge':
    case 'chest_freezer':
    case 'pastry':
      return (
        <svg {...svgProps}>
          <rect x={9} y={4} width={20} height={28} rx={3} fill={c} opacity={0.85}/>
          <rect x={11} y={6} width={16} height={12} rx={2} fill="#e0f2fe" opacity={0.7}/>
          <rect x={11} y={20} width={16} height={10} rx={2} fill="#bfdbfe" opacity={0.5}/>
          <line x1={25} y1={11} x2={25} y2={16} stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round"/>
          <line x1={25} y1={23} x2={25} y2={27} stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round"/>
        </svg>
      );

    // ── Javon / Stellaj ────────────────────────
    case 'wall_shelf':
    case 'island_shelf':
    case 'shoe_shelf':
    case 'book_shelf':
    case 'gift_shelf':
      return (
        <svg {...svgProps}>
          <rect x={7} y={4} width={24} height={30} rx={2} fill={c} opacity={0.8}/>
          {[8, 14, 20, 26].map((y, i) => (
            <rect key={i} x={9} y={y} width={20} height={2} rx={1} fill="#f1f5f9" opacity={0.9}/>
          ))}
          {[10, 16, 22].map((y, i) => (
            <rect key={i} x={11} y={y} width={6} height={4} rx={1} fill={['#f43f5e', '#3b82f6', '#10b981'][i]} opacity={0.9}/>
          ))}
        </svg>
      );

    // ── Kassa stoli / Counter / Retsepsiya ─────
    case 'counter':
    case 'demo_table':
    case 'reception':
    case 'cash_counter':
      return (
        <svg {...svgProps}>
          <rect x={5} y={14} width={28} height={14} rx={3} fill={c} opacity={0.85}/>
          <rect x={4} y={11} width={30} height={4} rx={2} fill="#f1f5f9" opacity={0.9}/>
          <rect x={22} y={6} width={8} height={6} rx={2} fill="#1e293b"/>
          <rect x={23} y={7} width={6} height={4} rx={1} fill="#3b82f6" opacity={0.7}/>
          <line x1={10} y1={28} x2={10} y2={34} stroke={c} strokeWidth={2}/>
          <line x1={28} y1={28} x2={28} y2={34} stroke={c} strokeWidth={2}/>
        </svg>
      );

    // ── Maneken ────────────────────────────────
    case 'mannequin':
      return (
        <svg {...svgProps}>
          <circle cx={cx} cy={8} r={5} fill={c} opacity={0.85}/>
          <rect x={14} y={14} width={10} height={12} rx={4} fill={c} opacity={0.8}/>
          <line x1={cx} y1={26} x2={cx} y2={33} stroke="#94a3b8" strokeWidth={2}/>
          <ellipse cx={cx} cy={34} rx={6} ry={2} fill="#64748b" opacity={0.6}/>
        </svg>
      );

    // ── Kiyim stakani / Aylana stend ───────────
    case 'clothing_rack':
    case 'center_rack':
      return (
        <svg {...svgProps}>
          <line x1={5} y1={12} x2={33} y2={12} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={7}  y1={12} x2={7}  y2={34} stroke={c} strokeWidth={2} strokeLinecap="round"/>
          <line x1={31} y1={12} x2={31} y2={34} stroke={c} strokeWidth={2} strokeLinecap="round"/>
          {[12, 19, 26].map((x, i) => (
            <g key={i}>
              <path d={`M${x},12 Q${x},9 ${x+3},9 Q${x+6},9 ${x+6},12`} fill="none" stroke="#94a3b8" strokeWidth={1.2}/>
              <rect x={x} y={12} width={7} height={9} rx={1} fill={['#f43f5e', '#3b82f6', '#10b981'][i]} opacity={0.85}/>
            </g>
          ))}
        </svg>
      );

    // ── Kiyinish xonasi ────────────────────────
    case 'fitting_room':
      return (
        <svg {...svgProps}>
          <rect x={6} y={5} width={26} height={28} rx={2} fill="none" stroke={c} strokeWidth={2.5}/>
          <rect x={14} y={5} width={10} height={22} rx={1} fill="#e0e7ff" opacity={0.5}/>
          <line x1={14} y1={5} x2={14} y2={27} stroke={c} strokeWidth={1.5}/>
          <circle cx={24} cy={17} r={1.5} fill={c}/>
        </svg>
      );

    // ── Treadmill (Yugurish yo'lagi) ───────────
    case 'treadmill':
      return (
        <svg {...svgProps}>
          <rect x={5} y={20} width={28} height={8} rx={3} fill={c} opacity={0.85}/>
          <rect x={8} y={21} width={22} height={5} rx={1} fill="#1e293b" opacity={0.7}/>
          <line x1={8}  y1={20} x2={8}  y2={10} stroke="#475569" strokeWidth={2} strokeLinecap="round"/>
          <line x1={30} y1={20} x2={30} y2={10} stroke="#475569" strokeWidth={2} strokeLinecap="round"/>
          <rect x={14} y={6} width={10} height={6} rx={2} fill="#0f172a"/>
          <rect x={15} y={7} width={8} height={4} rx={1} fill="#3b82f6" opacity={0.7}/>
        </svg>
      );

    // ── Velosiped ──────────────────────────────
    case 'bike':
      return (
        <svg {...svgProps}>
          <circle cx={11} cy={26} r={7} fill="none" stroke={c} strokeWidth={2.5}/>
          <circle cx={27} cy={26} r={7} fill="none" stroke={c} strokeWidth={2.5}/>
          <line x1={19} y1={26} x2={27} y2={26} stroke={c} strokeWidth={2}/>
          <line x1={19} y1={26} x2={14} y2={14} stroke={c} strokeWidth={2}/>
          <line x1={19} y1={26} x2={11} y2={26} stroke={c} strokeWidth={2}/>
          <rect x={11} y={10} width={10} height={3} rx={1} fill={c} opacity={0.8}/>
        </svg>
      );

    // ── Skameyka / Bench Press ─────────────────
    case 'bench':
      return (
        <svg {...svgProps}>
          {/* Bench pad */}
          <rect x={4} y={19} width={30} height={5} rx={2} fill="#111827"/>
          <rect x={5} y={20} width={28} height={2} rx={1} fill="#374151"/>
          {/* Upright posts */}
          <rect x={8} y={8} width={3} height={22} rx={1} fill={c}/>
          <rect x={27} y={8} width={3} height={22} rx={1} fill={c}/>
          {/* Barbell on rack */}
          <line x1={3} y1={10} x2={35} y2={10} stroke="#cbd5e1" strokeWidth={2.5}/>
          <rect x={4} y={6} width={2.5} height={8} rx={1} fill="#dc2626"/>
          <rect x={31.5} y={6} width={2.5} height={8} rx={1} fill="#dc2626"/>
          {/* Base legs */}
          <line x1={5} y1={30} x2={14} y2={30} stroke={c} strokeWidth={2} strokeLinecap="round"/>
          <line x1={24} y1={30} x2={33} y2={30} stroke={c} strokeWidth={2} strokeLinecap="round"/>
        </svg>
      );

    // ── Flat Bench ─────────────────────────────
    case 'flat_bench':
      return (
        <svg {...svgProps}>
          {/* Leather Pad */}
          <rect x={4} y={16} width={30} height={5} rx={2} fill="#111827"/>
          <rect x={5} y={17} width={28} height={2} rx={1} fill="#374151"/>
          {/* Steel T-legs */}
          <rect x={8} y={21} width={3} height={9} rx={1} fill={c}/>
          <rect x={27} y={21} width={3} height={9} rx={1} fill={c}/>
          <line x1={5} y1={30} x2={14} y2={30} stroke={c} strokeWidth={2} strokeLinecap="round"/>
          <line x1={24} y1={30} x2={33} y2={30} stroke={c} strokeWidth={2} strokeLinecap="round"/>
        </svg>
      );

    // ── Adjustable / Incline Bench ─────────────
    case 'adjustable_bench':
      return (
        <svg {...svgProps}>
          {/* Flat seat */}
          <rect x={6} y={22} width={10} height={4} rx={1} fill="#111827"/>
          {/* Incline backrest */}
          <rect x={14} y={9} width={17} height={4} rx={1} transform="rotate(-35 14 11)" fill="#111827"/>
          {/* Frame & adjustment pin */}
          <path d="M8,26 L30,26 M14,26 L22,14" stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
          <circle cx={22} cy={14} r={2} fill="#f59e0b"/>
        </svg>
      );

    // ── Krossover (Cable Crossover) ────────────
    case 'crossover':
      return (
        <svg {...svgProps}>
          {/* Left & Right Weight Towers */}
          <rect x={4} y={5} width={7} height={27} rx={2} fill="#1f2937"/>
          <rect x={27} y={5} width={7} height={27} rx={2} fill="#1f2937"/>
          {/* Weight plates stack */}
          <rect x={5.5} y={10} width={4} height={18} rx={1} fill="#3b82f6" opacity={0.7}/>
          <rect x={28.5} y={10} width={4} height={18} rx={1} fill="#3b82f6" opacity={0.7}/>
          {/* Overhead Crossbar arch & chin-up */}
          <path d="M7,5 L19,3 L31,5" fill="none" stroke={c} strokeWidth={2.5}/>
          {/* Cable pulleys & D-handles */}
          <circle cx={13} cy={12} r={1.5} fill="#f59e0b"/>
          <circle cx={25} cy={12} r={1.5} fill="#f59e0b"/>
          <line x1={8} y1={8} x2={13} y2={12} stroke="#94a3b8" strokeWidth={1}/>
          <line x1={30} y1={8} x2={25} y2={12} stroke="#94a3b8" strokeWidth={1}/>
          <path d="M12,12 Q14,14 12,16" fill="none" stroke="#f59e0b" strokeWidth={1.5}/>
          <path d="M26,12 Q24,14 26,16" fill="none" stroke="#f59e0b" strokeWidth={1.5}/>
        </svg>
      );

    // ── Gantel Stendi (Dumbbell Rack) ──────────
    case 'dumbbell_rack':
    case 'dumbbell':
    case 'dumbbells':
      return (
        <svg {...svgProps}>
          {/* 2-tier angled rack frame */}
          <rect x={4} y={14} width={30} height={3} rx={1} fill="#475569"/>
          <rect x={4} y={24} width={30} height={3} rx={1} fill="#475569"/>
          <line x1={7} y1={14} x2={5} y2={31} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={31} y1={14} x2={33} y2={31} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
          {/* Tier 1 dumbbells */}
          {[8, 19, 30].map((x, i) => (
            <g key={'t1_' + i}>
              <line x1={x - 3} y1={11} x2={x + 3} y2={11} stroke="#cbd5e1" strokeWidth={1.5}/>
              <rect x={x - 4} y={8} width={2} height={6} rx={0.8} fill="#1e293b"/>
              <rect x={x + 2} y={8} width={2} height={6} rx={0.8} fill="#1e293b"/>
            </g>
          ))}
          {/* Tier 2 heavier dumbbells */}
          {[11, 24].map((x, i) => (
            <g key={'t2_' + i}>
              <line x1={x - 4} y1={21} x2={x + 4} y2={21} stroke="#cbd5e1" strokeWidth={2}/>
              <rect x={x - 5} y={17} width={2.5} height={8} rx={1} fill="#0f172a"/>
              <rect x={x + 2.5} y={17} width={2.5} height={8} rx={1} fill="#0f172a"/>
            </g>
          ))}
        </svg>
      );

    // ── Shkaflar (Lockers / Wardrobe) ──────────
    case 'lockers':
    case 'locker':
    case 'wardrobe':
      return (
        <svg {...svgProps}>
          {/* Outer cabinet */}
          <rect x={6} y={4} width={26} height={29} rx={2} fill={c} opacity={0.9}/>
          {/* Vertical divider */}
          <line x1={19} y1={4} x2={19} y2={33} stroke="#1e293b" strokeWidth={1.5}/>
          {/* Horizontal divider */}
          <line x1={6} y1={18} x2={32} y2={18} stroke="#1e293b" strokeWidth={1.5}/>
          {/* 4 Locker Doors with air vents & handles */}
          {[[12, 11], [25, 11], [12, 25], [25, 25]].map(([x, y], i) => (
            <g key={i}>
              <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y - 3} stroke="#fff" strokeWidth={1} opacity={0.6}/>
              <line x1={x - 3} y1={y - 1} x2={x + 3} y2={y - 1} stroke="#fff" strokeWidth={1} opacity={0.6}/>
              <circle cx={x + (i % 2 === 0 ? 4 : -4)} cy={y + 2} r={1.2} fill="#f59e0b"/>
            </g>
          ))}
          {/* Base legs */}
          <rect x={8} y={33} width={3} height={3} fill="#1e293b"/>
          <rect x={27} y={33} width={3} height={3} fill="#1e293b"/>
        </svg>
      );

    // ── Meva-sabzavot Stendi (Produce) ─────────
    case 'produce':
      return (
        <svg {...svgProps}>
          {/* Angled wooden tiered stand */}
          <rect x={5} y={16} width={28} height={14} rx={2} fill={c} opacity={0.85}/>
          <rect x={4} y={12} width={30} height={5} rx={1.5} fill="#d97706"/>
          <rect x={6} y={6} width={26} height={5} rx={1.5} fill="#b45309"/>
          {/* Fresh colorful fruits / vegetables */}
          {[9, 14, 19, 24, 29].map((x, i) => (
            <circle key={'f1_' + i} cx={x} cy={6} r={2.2} fill={i % 2 === 0 ? '#84cc16' : '#eab308'}/>
          ))}
          {[7, 12, 17, 22, 27, 31].map((x, i) => (
            <circle key={'f2_' + i} cx={x} cy={12} r={2.4} fill={i % 2 === 0 ? '#ef4444' : '#f97316'}/>
          ))}
        </svg>
      );

    // ── Gul Stendi (Flower Stand) ──────────────
    case 'flower_stand':
      return (
        <svg {...svgProps}>
          {/* Multi-tiered flower rack */}
          <rect x={5} y={26} width={28} height={3} rx={1} fill={c}/>
          <rect x={8} y={18} width={22} height={3} rx={1} fill={c}/>
          <rect x={11} y={10} width={16} height={3} rx={1} fill={c}/>
          {/* Flowers in pots */}
          {[14, 24].map((x, i) => (
            <g key={'top_' + i}>
              <rect x={x - 2} y={7} width={4} height={3} rx={0.5} fill="#d97706"/>
              <circle cx={x} cy={4} r={2.5} fill={['#f43f5e', '#a855f7'][i]}/>
            </g>
          ))}
          {[11, 19, 27].map((x, i) => (
            <g key={'mid_' + i}>
              <rect x={x - 2} y={15} width={4} height={3} rx={0.5} fill="#b45309"/>
              <circle cx={x} cy={12} r={2.2} fill={['#ec4899', '#06b6d4', '#eab308'][i]}/>
            </g>
          ))}
          {[8, 15, 23, 30].map((x, i) => (
            <g key={'bot_' + i}>
              <circle cx={x} cy={23} r={2.4} fill={['#10b981', '#f97316', '#ec4899', '#3b82f6'][i]}/>
            </g>
          ))}
        </svg>
      );

    // ── Sovutish / Gul Xonasi (Cold Room) ──────
    case 'cold_room':
      return (
        <svg {...svgProps}>
          {/* Insulated glass enclosure */}
          <rect x={5} y={4} width={28} height={29} rx={3} fill="#e0f2fe" opacity={0.6}/>
          <rect x={5} y={4} width={28} height={29} rx={3} fill="none" stroke={c} strokeWidth={2}/>
          {/* Glass divider / double doors */}
          <line x1={19} y1={4} x2={19} y2={33} stroke={c} strokeWidth={1.5}/>
          {/* Door handles */}
          <line x1={17} y1={16} x2={17} y2={22} stroke="#0284c7" strokeWidth={2} strokeLinecap="round"/>
          <line x1={21} y1={16} x2={21} y2={22} stroke="#0284c7" strokeWidth={2} strokeLinecap="round"/>
          {/* Top AC cooling unit */}
          <rect x={8} y={6} width={22} height={4} rx={1} fill="#0284c7" opacity={0.8}/>
          <line x1={10} y1={8} x2={28} y2={8} stroke="#fff" strokeWidth={1}/>
        </svg>
      );

    // ── Shina Stendi (Tire Stand) ──────────────
    case 'tire_stand':
      return (
        <svg {...svgProps}>
          {/* Steel frame */}
          <rect x={5} y={6} width={28} height={26} rx={2} fill="none" stroke={c} strokeWidth={2}/>
          <line x1={5} y1={18} x2={33} y2={18} stroke={c} strokeWidth={1.5}/>
          {/* Top tier tires */}
          {[11, 19, 27].map((x, i) => (
            <ellipse key={'t_' + i} cx={x} cy={12} rx={3.5} ry={5} fill="#1e293b"/>
          ))}
          {/* Bottom tier tires */}
          {[11, 19, 27].map((x, i) => (
            <ellipse key={'b_' + i} cx={x} cy={24} rx={3.5} ry={5} fill="#0f172a"/>
          ))}
        </svg>
      );

    // ── Moy Vitrinasi (Oil Display) ────────────
    case 'oil_display':
      return (
        <svg {...svgProps}>
          {/* Shelved rack */}
          <rect x={6} y={5} width={26} height={28} rx={2} fill={c} opacity={0.8}/>
          {[6, 15, 24, 32].map((y, i) => (
            <line key={i} x1={6} y1={y} x2={32} y2={y} stroke="#f1f5f9" strokeWidth={1.5}/>
          ))}
          {/* Oil canister bottles */}
          {[10, 18, 26].map((x, i) => (
            <g key={'o1_' + i}>
              <rect x={x - 2.5} y={8} width={5} height={6} rx={1} fill={['#f97316', '#eab308', '#dc2626'][i]}/>
              <rect x={x - 1} y={6.5} width={2} height={1.5} fill="#1e293b"/>
            </g>
          ))}
          {[10, 18, 26].map((x, i) => (
            <g key={'o2_' + i}>
              <rect x={x - 2.5} y={17} width={5} height={6} rx={1} fill={['#3b82f6', '#10b981', '#f59e0b'][i]}/>
              <rect x={x - 1} y={15.5} width={2} height={1.5} fill="#1e293b"/>
            </g>
          ))}
        </svg>
      );

    // ── Tortmali Javon (Drawer) ────────────────
    case 'drawer':
      return (
        <svg {...svgProps}>
          {/* Cabinet body */}
          <rect x={6} y={5} width={26} height={27} rx={2} fill={c} opacity={0.9}/>
          {/* Drawers */}
          {[8, 15, 22].map((y, i) => (
            <g key={i}>
              <rect x={8} y={y} width={22} height={5.5} rx={1} fill="#f8fafc" opacity={0.95}/>
              <rect x={16} y={y + 1.8} width={6} height={1.8} rx={0.6} fill="#0284c7"/>
            </g>
          ))}
          <rect x={8} y={32} width={3} height={3} fill="#0f172a"/>
          <rect x={27} y={32} width={3} height={3} fill="#0f172a"/>
        </svg>
      );

    // ── Stol va O'tirish Joyi (Seating) ────────
    case 'seating':
      return (
        <svg {...svgProps}>
          {/* Center Table */}
          <rect x={13} y={15} width={12} height={3} rx={1} fill={c}/>
          <line x1={19} y1={18} x2={19} y2={28} stroke="#475569" strokeWidth={2}/>
          <line x1={15} y1={28} x2={23} y2={28} stroke="#475569" strokeWidth={2}/>
          {/* Left Chair */}
          <rect x={6} y={20} width={6} height={2} rx={0.5} fill="#d97706"/>
          <line x1={6} y1={12} x2={6} y2={26} stroke="#b45309" strokeWidth={1.8}/>
          <line x1={11} y1={22} x2={11} y2={26} stroke="#b45309" strokeWidth={1.8}/>
          {/* Right Chair */}
          <rect x={26} y={20} width={6} height={2} rx={0.5} fill="#d97706"/>
          <line x1={31} y1={12} x2={31} y2={26} stroke="#b45309" strokeWidth={1.8}/>
          <line x1={26} y1={22} x2={26} y2={26} stroke="#b45309" strokeWidth={1.8}/>
        </svg>
      );

    // ── Divan (Sofa) ───────────────────────────
    case 'sofa':
      return (
        <svg {...svgProps}>
          {/* Backrest */}
          <rect x={4} y={10} width={30} height={12} rx={3} fill={c} opacity={0.9}/>
          {/* Seat cushions */}
          <rect x={7} y={18} width={11.5} height={7} rx={2} fill="#f59e0b" opacity={0.85}/>
          <rect x={19.5} y={18} width={11.5} height={7} rx={2} fill="#f59e0b" opacity={0.85}/>
          {/* Armrests */}
          <rect x={4} y={15} width={4} height={10} rx={2} fill="#78350f"/>
          <rect x={30} y={15} width={4} height={10} rx={2} fill="#78350f"/>
          {/* Wooden legs */}
          <line x1={7} y1={25} x2={5} y2={30} stroke="#451a03" strokeWidth={2}/>
          <line x1={31} y1={25} x2={33} y2={30} stroke="#451a03" strokeWidth={2}/>
        </svg>
      );

    // ── Demo / Makiyaj / O'rash Stoli (Table) ──
    case 'table':
      return (
        <svg {...svgProps}>
          {/* Table top */}
          <rect x={4} y={14} width={30} height={4} rx={1.5} fill={c}/>
          {/* Four legs */}
          <line x1={7} y1={18} x2={7} y2={32} stroke="#334155" strokeWidth={2.5}/>
          <line x1={31} y1={18} x2={31} y2={32} stroke="#334155" strokeWidth={2.5}/>
          {/* Laptop / gadget on table */}
          <polygon points="13,14 25,14 27,10 15,10" fill="#0284c7" opacity={0.7}/>
          <rect x={16} y={6} width={9} height={6} rx={1} fill="#1e293b"/>
        </svg>
      );

    // ── TV Devor (TV Wall) ─────────────────────
    case 'tv_wall':
      return (
        <svg {...svgProps}>
          {/* Accent wall backdrop */}
          <rect x={4} y={4} width={30} height={30} rx={2} fill={c} opacity={0.7}/>
          {[4, 10, 16, 22, 28].map((y, i) => (
            <line key={i} x1={4} y1={y} x2={34} y2={y} stroke="#334155" strokeWidth={0.8} opacity={0.5}/>
          ))}
          {/* Big TV screen */}
          <rect x={7} y={8} width={24} height={15} rx={1.5} fill="#020617"/>
          <rect x={8} y={9} width={22} height={13} rx={1} fill="#0284c7" opacity={0.8}/>
          {/* Soundbar underneath */}
          <rect x={11} y={25} width={16} height={2.5} rx={1} fill="#0f172a"/>
        </svg>
      );

    // ── Kofe-Bar (Coffee Bar) ──────────────────
    case 'coffee_bar':
      return (
        <svg {...svgProps}>
          {/* Bar counter */}
          <rect x={4} y={16} width={30} height={14} rx={2} fill={c} opacity={0.9}/>
          <rect x={3} y={13} width={32} height={4} rx={1.5} fill="#fde68a"/>
          {/* Espresso Machine on counter */}
          <rect x={8} y={6} width={12} height={8} rx={1.5} fill="#334155"/>
          <rect x={10} y={7} width={8} height={4} rx={0.5} fill="#0284c7" opacity={0.8}/>
          <line x1={14} y1={11} x2={14} y2={13} stroke="#f59e0b" strokeWidth={1.5}/>
          {/* Coffee cup */}
          <ellipse cx={26} cy={12} rx={2.5} ry={1.5} fill="#fff"/>
          <rect x={24} y={10} width={4} height={3} rx={1} fill="#fff"/>
        </svg>
      );

    // ── Squat Cage (Power Rack) ──────────────
    case 'squat_cage':
      return (
        <svg {...svgProps}>
          {/* 4 Pillars */}
          <rect x={7} y={4} width={3} height={30} rx={1} fill="#1e293b"/>
          <rect x={28} y={4} width={3} height={30} rx={1} fill="#1e293b"/>
          {/* Top connector */}
          <rect x={7} y={4} width={24} height={3} rx={1} fill={c}/>
          {/* Chinup bar */}
          <line x1={8} y1={9} x2={30} y2={9} stroke="#94a3b8" strokeWidth={1.5}/>
          {/* Barbell */}
          <line x1={4} y1={17} x2={34} y2={17} stroke="#cbd5e1" strokeWidth={2.5}/>
          {/* Weight plates */}
          <rect x={4} y={12} width={2.5} height={10} rx={1} fill="#dc2626"/>
          <rect x={31.5} y={12} width={2.5} height={10} rx={1} fill="#dc2626"/>
          {/* Safety bars */}
          <line x1={7} y1={23} x2={31} y2={23} stroke="#64748b" strokeWidth={1.5} strokeDasharray="2,2"/>
        </svg>
      );

    // ── Smith Machine ──────────────────────────
    case 'smith_machine':
      return (
        <svg {...svgProps}>
          {/* Outer Frame */}
          <rect x={6} y={4} width={3.5} height={30} rx={1} fill={c}/>
          <rect x={28.5} y={4} width={3.5} height={30} rx={1} fill={c}/>
          <rect x={6} y={4} width={26} height={3} rx={1} fill={c}/>
          {/* Chrome guide rods */}
          <line x1={11} y1={6} x2={11} y2={32} stroke="#cbd5e1" strokeWidth={1.5}/>
          <line x1={27} y1={6} x2={27} y2={32} stroke="#cbd5e1" strokeWidth={1.5}/>
          {/* Guided barbell */}
          <line x1={4} y1={16} x2={34} y2={16} stroke="#94a3b8" strokeWidth={2.5}/>
          <rect x={4} y={11} width={3} height={10} rx={1} fill="#ef4444"/>
          <rect x={31} y={11} width={3} height={10} rx={1} fill="#ef4444"/>
        </svg>
      );

    // ── Olympic Barbell (Shtanga Stend) ───────
    case 'olympic_barbell':
      return (
        <svg {...svgProps}>
          {/* Base & Posts */}
          <rect x={6} y={28} width={26} height={3} rx={1} fill={c}/>
          <rect x={10} y={10} width={3} height={18} rx={1} fill={c}/>
          <rect x={25} y={10} width={3} height={18} rx={1} fill={c}/>
          {/* Barbells on tiers */}
          {[12, 19, 26].map((y, i) => (
            <g key={i}>
              <line x1={3} y1={y} x2={35} y2={y} stroke="#cbd5e1" strokeWidth={2}/>
              <rect x={4} y={y - 4} width={2} height={8} rx={1} fill={['#dc2626', '#2563eb', '#16a34a'][i]}/>
              <rect x={32} y={y - 4} width={2} height={8} rx={1} fill={['#dc2626', '#2563eb', '#16a34a'][i]}/>
            </g>
          ))}
        </svg>
      );

    // ── Weight Plates (Disk-stend) ────────────
    case 'weight_plates':
      return (
        <svg {...svgProps}>
          {/* Central post and base */}
          <rect x={16.5} y={4} width={5} height={28} rx={1} fill={c}/>
          <rect x={9} y={30} width={20} height={3} rx={1.5} fill="#334155"/>
          {/* Pegs with colorful weight plates */}
          {[9, 17, 25].map((y, i) => {
            const rad = 6 - i * 0.8;
            const col = ['#dc2626', '#2563eb', '#16a34a'][i];
            return (
              <g key={i}>
                <line x1={9} y1={y} x2={29} y2={y} stroke="#94a3b8" strokeWidth={2}/>
                <ellipse cx={10} cy={y} rx={2.5} ry={rad} fill={col}/>
                <ellipse cx={28} cy={y} rx={2.5} ry={rad} fill={col}/>
              </g>
            );
          })}
        </svg>
      );

    // ── Chest Press Machine ────────────────────
    case 'chest_press':
      return (
        <svg {...svgProps}>
          {/* Weight stack on left */}
          <rect x={4} y={6} width={9} height={24} rx={2} fill="#1f2937"/>
          <rect x={6} y={9} width={5} height={18} rx={1} fill="#3b82f6" opacity={0.6}/>
          {/* Seat & backrest */}
          <rect x={18} y={15} width={4} height={10} rx={1} fill="#111827"/>
          <rect x={18} y={23} width={10} height={4} rx={1} fill="#111827"/>
          {/* Frame & press handles */}
          <path d="M13,26 L32,26 L32,21" fill="none" stroke={c} strokeWidth={2}/>
          <path d="M22,12 L30,12 L30,17" fill="none" stroke="#64748b" strokeWidth={2.5}/>
          <circle cx={30} cy={17} r={2} fill="#f43f5e"/>
        </svg>
      );

    // ── Shoulder Press Machine ─────────────────
    case 'shoulder_press':
      return (
        <svg {...svgProps}>
          {/* Weight stack on left */}
          <rect x={4} y={6} width={9} height={24} rx={2} fill="#1f2937"/>
          <rect x={6} y={9} width={5} height={18} rx={1} fill="#eab308" opacity={0.6}/>
          {/* Vertical seat */}
          <rect x={19} y={14} width={4} height={12} rx={1} fill="#111827"/>
          <rect x={19} y={24} width={9} height={4} rx={1} fill="#111827"/>
          {/* Overhead lever handles */}
          <path d="M19,8 L28,8 L28,13" fill="none" stroke="#64748b" strokeWidth={2.5}/>
          <circle cx={28} cy={13} r={2} fill="#eab308"/>
        </svg>
      );

    // ── Seated Row Machine ─────────────────────
    case 'seated_row':
      return (
        <svg {...svgProps}>
          {/* Weight stack on right */}
          <rect x={25} y={6} width={9} height={24} rx={2} fill="#1f2937"/>
          <rect x={27} y={9} width={5} height={18} rx={1} fill="#a855f7" opacity={0.6}/>
          {/* Long Bench */}
          <rect x={5} y={22} width={16} height={4} rx={1} fill="#111827"/>
          <rect x={15} y={15} width={4} height={8} rx={1} fill="#111827"/>
          {/* Cable & Handle */}
          <line x1={18} y1={17} x2={26} y2={17} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="1,1"/>
          <line x1={18} y1={15} x2={18} y2={19} stroke="#f59e0b" strokeWidth={2}/>
        </svg>
      );

    // ── Leg Press Machine ──────────────────────
    case 'leg_press':
      return (
        <svg {...svgProps}>
          {/* Angled sled & seat */}
          <path d="M5,28 L32,10" stroke={c} strokeWidth={3} strokeLinecap="round"/>
          <rect x={6} y={20} width={8} height={5} rx={1} transform="rotate(-30 10 22)" fill="#111827"/>
          <rect x={10} y={15} width={4} height={9} rx={1} transform="rotate(-30 12 19)" fill="#111827"/>
          {/* Footplate & weights */}
          <rect x={26} y={8} width={6} height={8} rx={1} transform="rotate(-30 29 12)" fill="#0284c7"/>
          <circle cx={28} cy={10} r={3} fill="#dc2626"/>
        </svg>
      );

    // ── Lat Pulldown ───────────────────────────
    case 'lat_pulldown':
      return (
        <svg {...svgProps}>
          {/* Weight tower */}
          <rect x={4} y={5} width={8} height={26} rx={2} fill="#1f2937"/>
          {/* High pulley overhead arm */}
          <path d="M8,5 L26,5 L26,8" fill="none" stroke={c} strokeWidth={2.5}/>
          {/* Wide grip bar */}
          <line x1={16} y1={11} x2={34} y2={11} stroke="#cbd5e1" strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={26} y1={5} x2={26} y2={11} stroke="#94a3b8" strokeWidth={1.5}/>
          {/* Seat */}
          <rect x={20} y={22} width={11} height={4} rx={1} fill="#111827"/>
          <rect x={24} y={26} width={3} height={6} fill="#475569"/>
        </svg>
      );

    // ── Elliptical ─────────────────────────────
    case 'elliptical':
      return (
        <svg {...svgProps}>
          {/* Flywheel base */}
          <ellipse cx={27} cy={24} rx={6} ry={6} fill="none" stroke={c} strokeWidth={3}/>
          <rect x={5} y={26} width={26} height={3} rx={1.5} fill="#1f2937"/>
          {/* Moving ski handles */}
          <line x1={12} y1={8} x2={16} y2={25} stroke="#475569" strokeWidth={2} strokeLinecap="round"/>
          <line x1={16} y1={8} x2={20} y2={25} stroke="#475569" strokeWidth={2} strokeLinecap="round"/>
          {/* Console */}
          <rect x={12} y={9} width={6} height={5} rx={1} fill="#0f172a"/>
          <rect x={13} y={10} width={4} height={3} rx={0.5} fill="#10b981"/>
        </svg>
      );

    // ── Stationary / Recumbent Bike ────────────
    case 'stationary_bike':
      return (
        <svg {...svgProps}>
          {/* Base */}
          <rect x={5} y={26} width={28} height={3} rx={1.5} fill="#1e293b"/>
          {/* Front flywheel */}
          <circle cx={26} cy={20} r={6} fill={c} opacity={0.8}/>
          <circle cx={26} cy={20} r={3} fill="#0f172a"/>
          {/* Seat with high backrest */}
          <rect x={8} y={19} width={9} height={4} rx={1} fill="#111827"/>
          <rect x={7} y={11} width={3.5} height={10} rx={1} fill="#111827"/>
          {/* Console stem */}
          <line x1={26} y1={20} x2={24} y2={10} stroke="#64748b" strokeWidth={2}/>
          <rect x={21} y={8} width={6} height={4} rx={1} fill="#0f172a"/>
        </svg>
      );

    // ── Stair Climber (Stepper) ────────────────
    case 'stair_climber':
      return (
        <svg {...svgProps}>
          {/* Stepped body */}
          <path d="M6,28 L6,20 L13,20 L13,14 L20,14 L20,8 L29,8 L29,28 Z" fill={c} opacity={0.85}/>
          {/* Steps lines */}
          <line x1={6} y1={20} x2={13} y2={20} stroke="#f1f5f9" strokeWidth={2}/>
          <line x1={13} y1={14} x2={20} y2={14} stroke="#f1f5f9" strokeWidth={2}/>
          <line x1={20} y1={8} x2={29} y2={8} stroke="#f1f5f9" strokeWidth={2}/>
          {/* Handrail & glowing screen */}
          <path d="M10,18 L24,5 L28,5" fill="none" stroke="#475569" strokeWidth={2}/>
          <rect x={25} y={3} width={6} height={5} rx={1} fill="#0284c7"/>
        </svg>
      );

    // ── Kettlebell Rack ────────────────────────
    case 'kettlebell_rack':
      return (
        <svg {...svgProps}>
          {/* 2-tier rack */}
          <rect x={4} y={15} width={30} height={3} rx={1} fill="#475569"/>
          <rect x={4} y={27} width={30} height={3} rx={1} fill="#475569"/>
          <line x1={6} y1={15} x2={6} y2={30} stroke={c} strokeWidth={2.5}/>
          <line x1={32} y1={15} x2={32} y2={30} stroke={c} strokeWidth={2.5}/>
          {/* Kettlebells on shelf 1 */}
          {[10, 19, 28].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={12} r={3} fill={['#dc2626', '#16a34a', '#2563eb'][i]}/>
              <path d={`M${x-1.5},9 Q${x},6 ${x+1.5},9`} fill="none" stroke="#1e293b" strokeWidth={1.2}/>
            </g>
          ))}
          {/* Kettlebells on shelf 2 */}
          {[14, 23].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={24} r={3.5} fill={['#f59e0b', '#9333ea'][i]}/>
              <path d={`M${x-2},20 Q${x},17 ${x+2},20`} fill="none" stroke="#1e293b" strokeWidth={1.5}/>
            </g>
          ))}
        </svg>
      );

    // ── Medicine Ball Rack ─────────────────────
    case 'medicine_ball_rack':
      return (
        <svg {...svgProps}>
          {/* Vertical pole & round base */}
          <rect x={17.5} y={4} width={3} height={28} rx={1} fill={c}/>
          <ellipse cx={cx} cy={31} rx={8} ry={2.5} fill="#334155"/>
          {/* Stacked colorful medicine balls */}
          {[8, 14, 20, 26].map((y, i) => (
            <g key={i}>
              <ellipse cx={cx} cy={y + 1} rx={4.5 - i * 0.3} ry={1} fill="#94a3b8"/>
              <circle cx={cx} cy={y} r={3.8 - i * 0.3} fill={['#e11d48', '#3b82f6', '#10b981', '#f59e0b'][i]}/>
            </g>
          ))}
        </svg>
      );

    // ── Plyo Boxes ─────────────────────────────
    case 'plyo_boxes':
      return (
        <svg {...svgProps}>
          {/* Large Box */}
          <rect x={4} y={15} width={18} height={16} rx={2} fill={c}/>
          <rect x={6} y={15} width={14} height={3} rx={1} fill="#1e293b"/>
          {/* Small Box */}
          <rect x={20} y={20} width={14} height={11} rx={2} fill="#d97706"/>
          <rect x={21} y={20} width={12} height={2.5} rx={1} fill="#1e293b"/>
        </svg>
      );

    // ── TRX Suspension Straps ──────────────────
    case 'trx':
      return (
        <svg {...svgProps}>
          {/* Top anchor */}
          <rect x={14} y={3} width={10} height={3} rx={1} fill="#334155"/>
          <circle cx={cx} cy={6} r={2} fill="#94a3b8"/>
          {/* Yellow/black V-straps */}
          <line x1={cx} y1={6} x2={10} y2={26} stroke="#eab308" strokeWidth={2.5}/>
          <line x1={cx} y1={6} x2={28} y2={26} stroke="#eab308" strokeWidth={2.5}/>
          {/* Handles */}
          <rect x={6} y={26} width={8} height={3} rx={1} fill="#0f172a"/>
          <rect x={24} y={26} width={8} height={3} rx={1} fill="#0f172a"/>
        </svg>
      );

    // ── Mats & Foam Rollers ────────────────────
    case 'mats_rollers':
      return (
        <svg {...svgProps}>
          {/* Rolled Yoga Mat */}
          <ellipse cx={12} cy={18} rx={6} ry={10} fill="#10b981"/>
          <ellipse cx={12} cy={18} rx={3} ry={6} fill="#047857"/>
          <circle cx={12} cy={18} r={1.5} fill="#064e3b"/>
          {/* Foam Roller */}
          <rect x={22} y={10} width={10} height={18} rx={4} fill="#3b82f6"/>
          {[13, 17, 21, 25].map((y, i) => (
            <line key={i} x1={22} y1={y} x2={32} y2={y} stroke="#1d4ed8" strokeWidth={1}/>
          ))}
        </svg>
      );

    // ── Punching Bag ───────────────────────────
    case 'punching_bag':
      return (
        <svg {...svgProps}>
          {/* Ceiling Mount & Chains */}
          <rect x={15} y={3} width={8} height={2} rx={1} fill="#475569"/>
          <line x1={19} y1={5} x2={14} y2={10} stroke="#94a3b8" strokeWidth={1.5}/>
          <line x1={19} y1={5} x2={24} y2={10} stroke="#94a3b8" strokeWidth={1.5}/>
          {/* Heavy Bag Cylinder */}
          <rect x={12} y={10} width={14} height={22} rx={6} fill="#dc2626"/>
          <rect x={13} y={14} width={12} height={3} fill="#991b1b"/>
          <rect x={13} y={22} width={12} height={3} fill="#991b1b"/>
        </svg>
      );

    // ── Stationery / Spinner ───────────────────
    case 'stationery':
      return (
        <svg {...svgProps}>
          <rect x={17} y={4} width={4} height={28} rx={1} fill={c}/>
          {[8, 16, 24].map((y, i) => (
            <g key={i}>
              <rect x={8} y={y} width={22} height={5} rx={1} fill={['#f43f5e', '#3b82f6', '#10b981'][i]} opacity={0.9}/>
              <line x1={8} y1={y+2.5} x2={30} y2={y+2.5} stroke="#fff" strokeWidth={1}/>
            </g>
          ))}
          <ellipse cx={cx} cy={31} rx={8} ry={2.5} fill="#334155"/>
        </svg>
      );

    // ── Read Table ─────────────────────────────
    case 'read_table':
      return (
        <svg {...svgProps}>
          <rect x={4} y={17} width={30} height={4} rx={1} fill={c}/>
          <line x1={7} y1={21} x2={7} y2={32} stroke="#475569" strokeWidth={2}/>
          <line x1={31} y1={21} x2={31} y2={32} stroke="#475569" strokeWidth={2}/>
          {/* Open book */}
          <path d="M12,17 Q15,14 18,16 Q21,14 24,17 Z" fill="#f8fafc" stroke="#3b82f6" strokeWidth={1}/>
          {/* Lamp */}
          <path d="M28,17 L28,11 L25,11" fill="none" stroke="#f59e0b" strokeWidth={1.5}/>
          <polygon points="23,10 27,10 28,13 22,13" fill="#f59e0b"/>
        </svg>
      );

    // ── Standart / Barcha yangi va nomalum jihozlar uchun ──
    case 'custom':
    default:
      return (
        <svg {...svgProps}>
          {/* 3D Isometric display cube */}
          <polygon points="19,5 32,12 19,19 6,12" fill={c} opacity={0.9}/>
          <polygon points="6,12 19,19 19,32 6,25" fill="#334155" opacity={0.85}/>
          <polygon points="19,19 32,12 32,25 19,32" fill="#1e293b" opacity={0.95}/>
          <circle cx={19} cy={12} r={3} fill="#38bdf8" opacity={0.8}/>
        </svg>
      );
  }
};

export const SidebarControls = () => {
  const {
    roomDimensions,
    setRoomDimensions,
    userBudget,
    setUserBudget,
    equipmentList,
    updateEquipmentCount,
    setEquipmentCount,
    autoFillInventory,
    toggleAutoFill,
    currency,
    selectedCategory,
    applyLayoutTemplate,
    footTrafficActive,
    toggleFootTraffic,
    footTrafficAnalytics,
    lightingActive,
    toggleLighting,
    timeOfDay,
    setTimeOfDay,
    customLights,
    addCustomLight,
    clearCustomLights,
    addCustomEquipmentItem,
    removeCustomEquipmentItem,
    clearAllEquipment
  } = useAppStore();

  const [showTemplates, setShowTemplates] = useState(false);

  // ── Yangi (custom) jihoz qo'shish formasi ──
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemWidth, setNewItemWidth] = useState('1');
  const [newItemDepth, setNewItemDepth] = useState('0.6');
  const [newItemHeight, setNewItemHeight] = useState('1.5');
  const [newItemColor, setNewItemColor] = useState('#3b82f6');
  const [newItemShapeType, setNewItemShapeType] = useState('custom');

  const handleAddCustomItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    const newItem = {
      id: `custom_${Date.now()}`,
      name: newItemName.trim(),
      type: newItemShapeType,
      custom: true,
      unitPrice: Number(newItemPrice) || 0,
      width: Number(newItemWidth) || 1,
      depth: Number(newItemDepth) || 0.6,
      height: Number(newItemHeight) || 1.5,
      color: newItemColor,
      count: 0
    };
    addCustomEquipmentItem(newItem);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemWidth('1');
    setNewItemDepth('0.6');
    setNewItemHeight('1.5');
    setNewItemColor('#3b82f6');
    setNewItemShapeType('custom');
    setShowAddItemForm(false);
  };

  // ── LED Chiroq qo'shish cooldown & loading doira holati ──
  const [isAddingLight, setIsAddingLight] = useState(false);
  const [lightProgress, setLightProgress] = useState(0);
  const lightAnimRef = useRef(null);

  useEffect(() => {
    return () => {
      if (lightAnimRef.current) {
        cancelAnimationFrame(lightAnimRef.current);
      }
    };
  }, []);

  const handleAddLight = () => {
    if (isAddingLight) return;

    const createLight = () => ({
      id: 'light_' + Date.now(),
      x: (Math.random() - 0.5) * (roomDimensions.width * 0.5),
      z: (Math.random() - 0.5) * (roomDimensions.length * 0.5),
      color: '#fef08a',
      intensity: 1.2,
      unitPrice: 120
    });

    // 1-chiroq darhol qo'yilib 1.5s cooldown doirasi to'ladi (qotib qolmasligi uchun).
    // 2-chi va keyingilari bosilganda esa 1.5s doira to'lib keyin qo'yiladi.
    const isFirstLight = customLights.length === 0;

    if (isFirstLight) {
      addCustomLight(createLight());
    }

    setIsAddingLight(true);
    setLightProgress(0);
    const startTime = performance.now();
    const duration = 1500; // 1.5 sekund

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setLightProgress(progress);

      if (elapsed < duration) {
        lightAnimRef.current = requestAnimationFrame(step);
      } else {
        if (!isFirstLight) {
          addCustomLight(createLight());
        }
        setIsAddingLight(false);
        setLightProgress(0);
      }
    };

    lightAnimRef.current = requestAnimationFrame(step);
  };

  const handleClearLights = () => {
    if (lightAnimRef.current) {
      cancelAnimationFrame(lightAnimRef.current);
    }
    setIsAddingLight(false);
    setLightProgress(0);
    clearCustomLights();
  };

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



      {/* ── Tayyor Joylashuv Shablonlari ── */}
      <div>
        <button
          onClick={() => setShowTemplates(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: showTemplates ? '#eff6ff' : '#f8fafc',
            border: `1.5px solid ${showTemplates ? '#3b82f6' : '#e2e8f0'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family)',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: showTemplates ? '#1d4ed8' : 'var(--text-primary)',
            marginBottom: showTemplates ? '0.5rem' : '0'
          }}
        >
          <span>Tayyor Joylashuv Shablonlari</span>
          <span style={{ transition: 'transform 0.2s', transform: showTemplates ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
        </button>

        {showTemplates && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>

            {/* 1: Devor bo'ylab */}
            <div onClick={() => applyLayoutTemplate('linear')} className="template-card-hover" style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px', cursor: 'pointer', background: '#fff', textAlign: 'center' }}>
              <svg width="100%" height="46" viewBox="0 0 100 60" style={{ display: 'block', background: '#f8fafc', borderRadius: '4px' }}>
                <rect x="5" y="5" width="90" height="50" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
                <rect x="7" y="7" width="86" height="5" fill="#10b981" rx="1"/>
                <rect x="7" y="14" width="5" height="23" fill="#10b981" rx="1"/>
                <rect x="88" y="14" width="5" height="23" fill="#10b981" rx="1"/>
                <rect x="35" y="44" width="30" height="8" fill="#3b82f6" rx="1"/>
              </svg>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', color: '#1e293b' }}>Devor bo'ylab</div>
            </div>

            {/* 2: Orolcha */}
            <div onClick={() => applyLayoutTemplate('island')} className="template-card-hover" style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px', cursor: 'pointer', background: '#fff', textAlign: 'center' }}>
              <svg width="100%" height="46" viewBox="0 0 100 60" style={{ display: 'block', background: '#f8fafc', borderRadius: '4px' }}>
                <rect x="5" y="5" width="90" height="50" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
                <rect x="7" y="7" width="86" height="5" fill="#10b981" rx="1"/>
                <rect x="32" y="22" width="36" height="6" fill="#7c3aed" rx="1"/>
                <rect x="32" y="30" width="36" height="6" fill="#7c3aed" rx="1"/>
                <rect x="84" y="40" width="7" height="12" fill="#3b82f6" rx="1"/>
              </svg>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', color: '#1e293b' }}>Orolcha</div>
            </div>

            {/* 3: U-simon */}
            <div onClick={() => applyLayoutTemplate('ushape')} className="template-card-hover" style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px', cursor: 'pointer', background: '#fff', textAlign: 'center' }}>
              <svg width="100%" height="46" viewBox="0 0 100 60" style={{ display: 'block', background: '#f8fafc', borderRadius: '4px' }}>
                <rect x="5" y="5" width="90" height="50" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
                <rect x="7" y="7" width="5" height="35" fill="#10b981" rx="1"/>
                <rect x="14" y="7" width="72" height="5" fill="#10b981" rx="1"/>
                <rect x="88" y="7" width="5" height="35" fill="#10b981" rx="1"/>
                <rect x="38" y="46" width="24" height="6" fill="#3b82f6" rx="1"/>
              </svg>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', color: '#1e293b' }}>U-simon</div>
            </div>

            {/* 4: Burchakli */}
            <div onClick={() => applyLayoutTemplate('corner')} className="template-card-hover" style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px', cursor: 'pointer', background: '#fff', textAlign: 'center' }}>
              <svg width="100%" height="46" viewBox="0 0 100 60" style={{ display: 'block', background: '#f8fafc', borderRadius: '4px' }}>
                <rect x="5" y="5" width="90" height="50" rx="3" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
                <rect x="7" y="7" width="5" height="38" fill="#10b981" rx="1"/>
                <rect x="14" y="7" width="72" height="5" fill="#10b981" rx="1"/>
                <rect x="65" y="44" width="20" height="8" fill="#3b82f6" rx="1"/>
              </svg>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', color: '#1e293b' }}>Burchakli (L)</div>
            </div>

          </div>
        )}
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
            max="100"
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
            max="100"
            step="0.5"
            className="range-slider"
            value={roomDimensions.length}
            onChange={(e) => setRoomDimensions({ length: parseFloat(e.target.value) })}
          />
        </div>

      </div>

      {/* Target Budget Input */}
      <div className="control-group">
        <div className="control-label">
          <span>Byudjet Chegarangiz ({currency === 'UZS' ? "So'm" : "$ USD"})</span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={userBudget === '' || userBudget === null || userBudget === undefined ? '' : (currency === 'UZS' ? Math.round(userBudget * UZS_RATE) : userBudget)}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                setUserBudget('');
              } else {
                const val = parseFloat(raw);
                if (currency === 'UZS') {
                  setUserBudget(val / UZS_RATE);
                } else {
                  setUserBudget(val);
                }
              }
            }}
            placeholder={currency === 'UZS' ? "Masalan: 300000000" : "Masalan: 25000"}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1.5px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontWeight: 700,
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)'
            }}
          />
        </div>
      </div>

      {/* ── 1-FUNKSIYA: MIJOZ OQIMI SIMULYATSIYASI (Foot Traffic) ── */}
      <div style={{
        background: footTrafficActive ? '#f0fdf4' : 'rgba(255, 255, 255, 0.03)',
        border: `1.5px solid ${footTrafficActive ? '#10b981' : 'var(--border-color)'}`,
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: footTrafficActive ? '0.75rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem', color: footTrafficActive ? '#047857' : 'var(--text-primary)' }}>
            <Users size={18} color={footTrafficActive ? '#10b981' : '#64748b'} />
            Mijoz Oqimi Simulyatsiyasi
          </div>
          <button
            onClick={toggleFootTraffic}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: 'none',
              background: footTrafficActive ? '#10b981' : '#e2e8f0',
              color: footTrafficActive ? '#fff' : '#475569',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {footTrafficActive ? 'O\'chirish' : 'Yoqish'}
          </button>
        </div>
      </div>

      {/* ── 2-FUNKSIYA: KUN/TUN YORUG'LIK SIMULYATSIYASI ── */}
      <div style={{
        background: lightingActive ? '#fefce8' : 'rgba(255, 255, 255, 0.03)',
        border: `1.5px solid ${lightingActive ? '#eab308' : 'var(--border-color)'}`,
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: lightingActive ? '0.75rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.92rem', color: lightingActive ? '#a16207' : 'var(--text-primary)' }}>
            {timeOfDay >= 19 ? <Moon size={18} color="#6366f1" /> : <Sun size={18} color="#eab308" />}
            Kun/Tun Yorug'lik Simulyatsiyasi
          </div>
          <button
            onClick={toggleLighting}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: 'none',
              background: lightingActive ? '#eab308' : '#e2e8f0',
              color: lightingActive ? '#fff' : '#475569',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {lightingActive ? 'O\'chirish' : 'Yoqish'}
          </button>
        </div>

        {lightingActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            {/* Time Slider */}
            <div className="control-group">
              <div className="control-label" style={{ marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="#a16207" /> Kun vaqti:
                </span>
                <strong style={{ color: '#a16207' }}>
                  {Math.floor(timeOfDay).toString().padStart(2, '0')}:00{' '}
                  {timeOfDay < 9 ? '(Ertalab)' : timeOfDay < 16 ? '(Tush)' : timeOfDay < 19 ? '(Kechqurun)' : '(Tun)'}
                </strong>
              </div>
              <input
                type="range"
                min="6"
                max="22"
                step="0.5"
                className="range-slider"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>

            {/* Custom LED Spotlights Control */}
            <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#713f12' }}>LED Chiroqlar: {customLights.length} dona</span>
                <span style={{ fontSize: '0.75rem', color: '#854d0e', fontWeight: 600 }}>$120/dona</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleAddLight}
                  disabled={isAddingLight}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: isAddingLight ? '1px solid #facc15' : '1px solid #ca8a04',
                    background: isAddingLight ? '#fefce8' : '#fef9c3',
                    color: '#854d0e',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: isAddingLight ? 'not-allowed' : 'pointer',
                    opacity: isAddingLight ? 0.9 : 1,
                    transition: 'background 0.2s, border-color 0.2s',
                    userSelect: 'none'
                  }}
                  title={isAddingLight ? "Doira to'lishini kuting..." : "Yangi chiroq qo'shish"}
                >
                  {isAddingLight ? (
                    <>
                      <div style={{ position: 'relative', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            fill="none"
                            stroke="#fef08a"
                            strokeWidth="3"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            fill="none"
                            stroke="#ca8a04"
                            strokeWidth="3"
                            strokeDasharray={56.54}
                            strokeDashoffset={56.54 - (56.54 * lightProgress) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <span>O'rnatilmoqda... {Math.round(lightProgress)}%</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Chiroq qo'shish
                    </>
                  )}
                </button>
                {customLights.length > 0 && (
                  <button
                    onClick={handleClearLights}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #f87171',
                      background: '#fff1f2',
                      color: '#991b1b',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Tozalash
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Equipment Library — Click to add to room */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Layers size={16} color="var(--accent-indigo)" />
            3D Jihozlar Kutubxonasi
          </div>
          <button
            onClick={() => setShowAddItemForm(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--accent-indigo, #6366f1)',
              background: showAddItemForm ? 'var(--accent-indigo, #6366f1)' : '#eef2ff',
              color: showAddItemForm ? '#fff' : '#4338ca',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {showAddItemForm ? <X size={13} /> : <PackagePlus size={13} />}
            {showAddItemForm ? 'Bekor qilish' : 'Yangi jihoz'}
          </button>
        </div>

        {/* ── Yangi jihoz qo'shish formasi ── */}
        {showAddItemForm && (
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #c7d2fe',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            marginBottom: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem'
          }}>
            <input
              type="text"
              placeholder="Jihoz nomi (masalan: Vitrina)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '6px',
                border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'
              }}
            />

            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                3D Shakli (jihoz turiga mos ko'rinish tanlang)
              </label>
              <select
                value={newItemShapeType}
                onChange={(e) => setNewItemShapeType(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  border: '1.5px solid #e2e8f0', fontSize: '0.83rem', outline: 'none',
                  background: '#fff', cursor: 'pointer', marginTop: '3px'
                }}
              >
                {SHAPE_TYPE_GROUPS.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                placeholder="Narxi ($)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: '6px',
                  border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none'
                }}
              />
              <input
                type="color"
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                title="Rang"
                style={{
                  width: '38px', height: '36px', borderRadius: '6px',
                  border: '1.5px solid #e2e8f0', padding: '2px', cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kenglik (m)</label>
                <input
                  type="number" step="0.1" value={newItemWidth}
                  onChange={(e) => setNewItemWidth(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chuqurlik (m)</label>
                <input
                  type="number" step="0.1" value={newItemDepth}
                  onChange={(e) => setNewItemDepth(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Balandlik (m)</label>
                <input
                  type="number" step="0.1" value={newItemHeight}
                  onChange={(e) => setNewItemHeight(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }}
                />
              </div>
            </div>

            <button
              onClick={handleAddCustomItem}
              disabled={!newItemName.trim() || !newItemPrice}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: '6px',
                border: 'none',
                background: (!newItemName.trim() || !newItemPrice) ? '#cbd5e1' : '#4338ca',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: (!newItemName.trim() || !newItemPrice) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <Plus size={14} /> Kutubxonaga Qo'shish
            </button>
          </div>
        )}

        {/* ── Bosing -> xonaga qo'shiladi va Xonani Tozalash (Axlat qutisi) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Bosing → xonaga qo'shiladi
          </div>

          <button
            type="button"
            onClick={clearAllEquipment}
            disabled={equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) === 0}
            title={
              equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0
                ? "Xonadagi barcha jihozlarni tozalash (o'chirish)"
                : "Xonada jihozlar yo'q"
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0 ? '1px solid #fecdd3' : '1px solid #e2e8f0',
              background: equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0 ? '#fff1f2' : '#f8fafc',
              color: equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0 ? '#e11d48' : '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0) {
                e.currentTarget.style.background = '#ffe4e6';
              }
            }}
            onMouseLeave={(e) => {
              if (equipmentList.reduce((sum, item) => sum + (item.count || 0), 0) > 0) {
                e.currentTarget.style.background = '#fff1f2';
              }
            }}
          >
            <Trash2 size={12} strokeWidth={2.2} />
            <span>Tozalash</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {equipmentList.map((item) => {
            const meta = SHAPE_META[item.type] || SHAPE_META.default;
            return (
              <SwipeableEquipmentCard
                key={item.id}
                item={item}
                meta={meta}
                formatPrice={formatPrice}
                updateEquipmentCount={updateEquipmentCount}
                setEquipmentCount={setEquipmentCount}
                removeCustomEquipmentItem={removeCustomEquipmentItem}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};