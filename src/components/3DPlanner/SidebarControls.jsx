import React, { useState } from 'react';
import { useAppStore, UZS_RATE } from '../../store/useAppStore';
import { Maximize2, Package, Layers, Plus, Minus, Check, Users, Sun, Moon, Zap, AlertTriangle, CheckCircle2, Trash2, Clock, PackagePlus, X } from 'lucide-react';

// ─── Har bir 3D tip uchun meta (bg, border rang) ───
const SHAPE_META = {
  fridge:        { bg: '#dbeafe', border: '#3b82f6' },
  wall_shelf:    { bg: '#f0fdf4', border: '#10b981' },
  counter:       { bg: '#fef3c7', border: '#d97706' },
  island_shelf:  { bg: '#ede9fe', border: '#7c3aed' },
  produce:       { bg: '#dcfce7', border: '#16a34a' },
  chest_freezer: { bg: '#e0f2fe', border: '#0891b2' },
  mannequin:     { bg: '#ffe4e6', border: '#e11d48' },
  clothing_rack: { bg: '#fce7f3', border: '#ec4899' },
  center_rack:   { bg: '#f3e8ff', border: '#a855f7' },
  shoe_shelf:    { bg: '#fff7ed', border: '#f97316' },
  fitting_room:  { bg: '#f1f5f9', border: '#475569' },
  treadmill:     { bg: '#fef9c3', border: '#ca8a04' },
  bike:          { bg: '#ecfdf5', border: '#059669' },
  bench:         { bg: '#fdf2f8', border: '#db2777' },
  crossover:     { bg: '#eff6ff', border: '#2563eb' },
  dumbbell_rack: { bg: '#fafafa', border: '#64748b' },
  leg_press:     { bg: '#e0f2fe', border: '#0284c7' },
  lat_pulldown:  { bg: '#f1f5f9', border: '#475569' },
  elliptical:    { bg: '#ecfdf5', border: '#10b981' },
  punching_bag:  { bg: '#fef2f2', border: '#ef4444' },
  lockers:       { bg: '#f0f9ff', border: '#0284c7' },
  table:         { bg: '#fdf4ff', border: '#c026d3' },
  tv_wall:       { bg: '#f1f5f9', border: '#334155' },
  seating:       { bg: '#fff7ed', border: '#b45309' },
  sofa:          { bg: '#fef3c7', border: '#92400e' },
  drawer:        { bg: '#f0fdfa', border: '#0d9488' },
  tire_stand:    { bg: '#f8fafc', border: '#475569' },
  oil_display:   { bg: '#fefce8', border: '#a16207' },
  flower_stand:  { bg: '#fdf2f8', border: '#ec4899' },
  cold_room:     { bg: '#e0f2fe', border: '#0369a1' },
  demo_table:    { bg: '#eff6ff', border: '#1d4ed8' },
  coffee_bar:    { bg: '#fef3c7', border: '#78350f' },
  book_shelf:    { bg: '#f5f3ff', border: '#6d28d9' },
  default:       { bg: '#f1f5f9', border: '#94a3b8' },
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
    case 'oil_display':
    case 'book_shelf':
      return (
        <svg {...svgProps}>
          <rect x={7} y={4} width={24} height={30} rx={2} fill={c} opacity={0.8}/>
          {[8,14,20,26].map((y,i) => (
            <rect key={i} x={9} y={y} width={20} height={2} rx={1} fill="#f1f5f9" opacity={0.9}/>
          ))}
          {[10,16,22].map((y,i) => (
            <rect key={i} x={11} y={y} width={6} height={4} rx={1} fill={['#f43f5e','#3b82f6','#10b981'][i]} opacity={0.9}/>
          ))}
        </svg>
      );

    // ── Kassa stoli / Counter ──────────────────
    case 'counter':
    case 'demo_table':
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

    // ── Kiyim stakani ──────────────────────────
    case 'clothing_rack':
    case 'center_rack':
      return (
        <svg {...svgProps}>
          <line x1={5} y1={12} x2={33} y2={12} stroke={c} strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={7}  y1={12} x2={7}  y2={34} stroke={c} strokeWidth={2} strokeLinecap="round"/>
          <line x1={31} y1={12} x2={31} y2={34} stroke={c} strokeWidth={2} strokeLinecap="round"/>
          {[12, 19, 26].map((x,i) => (
            <g key={i}>
              <path d={`M${x},12 Q${x},9 ${x+3},9 Q${x+6},9 ${x+6},12`} fill="none" stroke="#94a3b8" strokeWidth={1.2}/>
              <rect x={x} y={12} width={7} height={9} rx={1} fill={['#f43f5e','#3b82f6','#10b981'][i]} opacity={0.85}/>
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

    // ── Treadmill ──────────────────────────────
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

    // ── Bench press ────────────────────────────
    case 'bench':
      return (
        <svg {...svgProps}>
          <rect x={6} y={16} width={26} height={6} rx={3} fill={c} opacity={0.85}/>
          {[7,29].map((x,i) => <line key={i} x1={x} y1={22} x2={x} y2={30} stroke="#64748b" strokeWidth={2} strokeLinecap="round"/>)}
          <line x1={5} y1={10} x2={33} y2={10} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round"/>
          <circle cx={8}  cy={10} r={4} fill="#1e293b" opacity={0.7}/>
          <circle cx={30} cy={10} r={4} fill="#1e293b" opacity={0.7}/>
        </svg>
      );

    // ── Crossover ──────────────────────────────
    case 'crossover':
      return (
        <svg {...svgProps}>
          <rect x={4}  y={5} width={5} height={28} rx={2} fill={c} opacity={0.85}/>
          <rect x={29} y={5} width={5} height={28} rx={2} fill={c} opacity={0.85}/>
          <line x1={9} y1={5} x2={29} y2={5} stroke={c} strokeWidth={3}/>
          <line x1={9}  y1={14} x2={16} y2={22} stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round"/>
          <line x1={29} y1={14} x2={22} y2={22} stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round"/>
          <rect x={5}  y={20} width={4} height={10} rx={1} fill="#334155" opacity={0.7}/>
          <rect x={29} y={20} width={4} height={10} rx={1} fill="#334155" opacity={0.7}/>
        </svg>
      );

    // ── Gantel stendi ──────────────────────────
    case 'dumbbell_rack':
      return (
        <svg {...svgProps}>
          <rect x={4} y={18} width={30} height={10} rx={2} fill={c} opacity={0.8}/>
          {[9, 19, 29].map((x,i) => (
            <g key={i}>
              <circle cx={x-2} cy={21} r={3} fill="#374151"/>
              <line x1={x-2} y1={21} x2={x+2} y2={21} stroke="#94a3b8" strokeWidth={1.5}/>
              <circle cx={x+2} cy={21} r={3} fill="#374151"/>
            </g>
          ))}
        </svg>
      );

    // ── Shkaf (lockers) ────────────────────────
    case 'lockers':
      return (
        <svg {...svgProps}>
          {[5, 15, 25].map((x,i) => (
            <g key={i}>
              <rect x={x} y={5} width={9} height={28} rx={1} fill={c} opacity={0.8}/>
              <rect x={x+1} y={6} width={7} height={26} rx={1} fill={c} opacity={0.4}/>
              <circle cx={x+7} cy={19} r={1.2} fill="#f1f5f9"/>
            </g>
          ))}
        </svg>
      );

    // ── Grim stoli ─────────────────────────────
    case 'table':
      return (
        <svg {...svgProps}>
          <rect x={5} y={18} width={28} height={10} rx={2} fill={c} opacity={0.8}/>
          <rect x={4} y={15} width={30} height={3} rx={1} fill="#f8fafc"/>
          <rect x={10} y={5} width={18} height={12} rx={2} fill="#e0f2fe" opacity={0.8}/>
          <line x1={10} y1={4} x2={28} y2={4} stroke="#fef08a" strokeWidth={2.5} strokeLinecap="round"/>
        </svg>
      );

    // ── TV devor ───────────────────────────────
    case 'tv_wall':
      return (
        <svg {...svgProps}>
          <rect x={3} y={8} width={32} height={20} rx={2} fill={c} opacity={0.85}/>
          <rect x={6} y={10} width={12} height={7} rx={1} fill="#0f172a"/>
          <rect x={7} y={11} width={10} height={5} rx={1} fill="#3b82f6" opacity={0.7}/>
          <rect x={20} y={10} width={12} height={7} rx={1} fill="#0f172a"/>
          <rect x={21} y={11} width={10} height={5} rx={1} fill="#3b82f6" opacity={0.7}/>
        </svg>
      );

    // ── Stol + stul ────────────────────────────
    case 'seating':
    case 'sofa':
      return (
        <svg {...svgProps}>
          <circle cx={cx} cy={18} r={8} fill="#d97706" opacity={0.7}/>
          <circle cx={cx} cy={18} r={2} fill="#92400e"/>
          {[0, 1, 2, 3].map(i => {
            const a = i * Math.PI / 2;
            return (
              <rect key={i}
                x={cx + Math.sin(a)*10 - 4} y={18 + Math.cos(a)*10 - 5}
                width={8} height={7} rx={2} fill={c} opacity={0.85}/>
            );
          })}
        </svg>
      );

    // ── Dori javoni (drawer) ───────────────────
    case 'drawer':
      return (
        <svg {...svgProps}>
          <rect x={7} y={4} width={24} height={30} rx={2} fill={c} opacity={0.8}/>
          {[7,13,19,25].map((y,i) => (
            <g key={i}>
              <rect x={9} y={y} width={10} height={5} rx={1} fill="#e0f2fe" opacity={0.8}/>
              <rect x={21} y={y} width={8} height={5} rx={1} fill="#e0f2fe" opacity={0.8}/>
              <circle cx={14} cy={y+2.5} r={1} fill="#0d9488"/>
              <circle cx={25} cy={y+2.5} r={1} fill="#0d9488"/>
            </g>
          ))}
        </svg>
      );

    // ── Shinalar ───────────────────────────────
    case 'tire_stand':
      return (
        <svg {...svgProps}>
          <rect x={14} y={4} width={5} height={30} rx={2} fill={c} opacity={0.7}/>
          {[8, 16, 24].map((y,i) => (
            <g key={i}>
              <circle cx={cx} cy={y} r={7} fill="none" stroke="#1e293b" strokeWidth={4}/>
              <circle cx={cx} cy={y} r={3} fill="#475569" opacity={0.6}/>
            </g>
          ))}
        </svg>
      );

    // ── Gul stendi ─────────────────────────────
    case 'flower_stand':
      return (
        <svg {...svgProps}>
          <rect x={8} y={22} width={22} height={4} rx={1} fill={c} opacity={0.8}/>
          <rect x={12} y={14} width={16} height={4} rx={1} fill={c} opacity={0.7}/>
          <rect x={16} y={8} width={10} height={4} rx={1} fill={c} opacity={0.6}/>
          {[[19,6],[14,12],[24,12],[19,20]].map(([x,y],i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={3} fill={['#f43f5e','#84cc16','#ec4899','#f59e0b'][i]} opacity={0.9}/>
            </g>
          ))}
        </svg>
      );

    // ── Sovuq xona ─────────────────────────────
    case 'cold_room':
      return (
        <svg {...svgProps}>
          <rect x={4} y={5} width={30} height={28} rx={3} fill="#e0f2fe" opacity={0.5} stroke={c} strokeWidth={2}/>
          {[10,17,24].map((y,i) => (
            <rect key={i} x={7} y={y} width={24} height={3} rx={1} fill="#f1f5f9" opacity={0.8}/>
          ))}
          <rect x={14} y={15} width={12} height={10} rx={1} fill={c} opacity={0.6}/>
        </svg>
      );

    // ── Kofe bar ───────────────────────────────
    case 'coffee_bar':
      return (
        <svg {...svgProps}>
          <rect x={3} y={16} width={32} height={12} rx={3} fill={c} opacity={0.85}/>
          <rect x={2} y={12} width={34} height={5} rx={2} fill="#f1f5f9"/>
          <rect x={5} y={6} width={10} height={8} rx={2} fill="#1e293b"/>
          <line x1={10} y1={14} x2={10} y2={17} stroke="#94a3b8" strokeWidth={1.5}/>
          {[18,23,28].map((x,i) => (
            <ellipse key={i} cx={x} cy={16} rx={3} ry={3.5} fill={['#f8fafc','#fef9c3','#ffe4e6'][i]} opacity={0.9}/>
          ))}
        </svg>
      );

    // ── Meva-sabzavot ──────────────────────────
    case 'produce':
      return (
        <svg {...svgProps}>
          <rect x={5} y={14} width={28} height={14} rx={3} fill={c} opacity={0.8}/>
          <rect x={4} y={11} width={30} height={4} rx={2} fill="#f1f5f9"/>
          {[10,19,28].map((x,i) => (
            <circle key={i} cx={x} cy={17} r={4} fill={['#f43f5e','#84cc16','#f59e0b'][i]} opacity={0.9}/>
          ))}
          {[15,24].map((x,i) => (
            <circle key={i} cx={x} cy={22} r={3.5} fill={['#22c55e','#f97316'][i]} opacity={0.9}/>
          ))}
        </svg>
      );

    // ── Default ────────────────────────────────
    default:
      return (
        <svg {...svgProps}>
          <rect x={8} y={4} width={22} height={30} rx={3} fill={c} opacity={0.8}/>
          <rect x={10} y={8} width={18} height={4} rx={1} fill="#f1f5f9" opacity={0.7}/>
          <rect x={10} y={15} width={18} height={4} rx={1} fill="#f1f5f9" opacity={0.7}/>
          <rect x={10} y={22} width={18} height={4} rx={1} fill="#f1f5f9" opacity={0.7}/>
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
    removeCustomEquipmentItem
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

        {footTrafficActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <span>Kassaga o'rtacha yurish:</span>
              <strong style={{ color: '#047857' }}>{footTrafficAnalytics.avgWalkTimeSec} soniya</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
              <span>Oqim masofasi:</span>
              <strong style={{ color: '#047857' }}>{footTrafficAnalytics.pathLengthMeters} metr</strong>
            </div>

            {footTrafficAnalytics.warningMessage && (
              <div style={{
                background: footTrafficAnalytics.isWarning ? '#fff1f2' : '#ecfdf5',
                color: footTrafficAnalytics.isWarning ? '#be123c' : '#047857',
                border: `1px solid ${footTrafficAnalytics.isWarning ? '#fda4af' : '#6ee7b7'}`,
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                lineHeight: 1.35
              }}>
                {footTrafficAnalytics.warningMessage}
              </div>
            )}
          </div>
        )}
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
                  onClick={() => {
                    const newLight = {
                      id: 'light_' + Date.now(),
                      x: (Math.random() - 0.5) * (roomDimensions.width * 0.5),
                      z: (Math.random() - 0.5) * (roomDimensions.length * 0.5),
                      color: '#fef08a',
                      intensity: 1.2,
                      unitPrice: 120
                    };
                    addCustomLight(newLight);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #ca8a04',
                    background: '#fef9c3',
                    color: '#854d0e',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> Chiroq qo'shish
                </button>
                {customLights.length > 0 && (
                  <button
                    onClick={clearCustomLights}
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

            {/* Night Lighting Warning */}
            {timeOfDay >= 19 && customLights.length < Math.ceil((roomDimensions.width * roomDimensions.length) / 30) && (
              <div style={{
                background: '#fff1f2',
                color: '#991b1b',
                border: '1px solid #fca5a5',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                lineHeight: 1.35
              }}>
                <strong>Tungi rejim:</strong> Xonada sun'iy yoritish yetarlicha emas! Qo'shimcha LED chiroqlar o'rnatish tavsiya etiladi.
              </div>
            )}
          </div>
        )}
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

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Bosing → xonaga qo'shiladi
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {equipmentList.map((item) => {
            const meta = SHAPE_META[item.type] || SHAPE_META.default;
            return (
              <div
                key={item.id}
                onClick={() => updateEquipmentCount(item.id, 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: item.count > 0 ? meta.bg : '#f8fafc',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${item.count > 0 ? meta.border : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: item.count > 0 ? `0 2px 8px ${meta.border}22` : 'none',
                  userSelect: 'none'
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

                {/* Counter */}
                <div
                  className="item-counter"
                  style={{ flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="count-btn"
                    onClick={(e) => { e.stopPropagation(); updateEquipmentCount(item.id, -1); }}
                    style={{ background: item.count === 0 ? '#f1f5f9' : undefined }}
                  >
                    <Minus size={11} />
                  </button>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    minWidth: '20px',
                    textAlign: 'center',
                    color: item.count > 0 ? meta.border : 'var(--text-muted)'
                  }}>
                    {item.count}
                  </span>
                  <button
                    className="count-btn"
                    onClick={(e) => { e.stopPropagation(); updateEquipmentCount(item.id, 1); }}
                    style={{ background: meta.bg, borderColor: meta.border }}
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Faqat foydalanuvchi qo'shgan custom jihozlar uchun o'chirish tugmasi */}
                {item.custom && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCustomEquipmentItem(item.id); }}
                    title="Kutubxonadan o'chirish"
                    style={{
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '26px', height: '26px',
                      borderRadius: '6px',
                      border: '1px solid #fecdd3',
                      background: '#fff1f2',
                      color: '#be123c',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};