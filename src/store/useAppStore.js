import { create } from 'zustand';
import { BUSINESS_CATEGORIES } from '../data/businessCategories';
import { clearAutosaveDraft } from '../utils/autosaveStorage';

export const UZS_RATE = 12800; // 1 USD = 12,800 UZS

export const DEFAULT_MONTHLY_EXPENSES = {
  rent: 0,
  utilities: 0,
  staffSalary: 0,
  staffCount: 1,
  otherExpenses: 0,
};

export const useAppStore = create((set, get) => ({
  // Navigation & View
  activePage: 'landing', // 'landing' | 'selector' | 'planner' | 'user-panel' | 'admin-panel'
  viewMode: '3d', // '3d' | 'top2d'

  // ── Kamera/Controls'ga to'g'ridan-to'g'ri (imperativ) murojaat — PDF eksport uchun ──
  cameraApi: null, // { camera, controls }
  setCameraApi: (camera, controls) => set({ cameraApi: { camera, controls } }),

  // Business Category
  selectedCategory: BUSINESS_CATEGORIES[0],

  // Room & Budget Parameters
  roomDimensions: { width: 10, length: 12, height: 3.2 },
  userBudget: '',
  currency: 'USD', // 'USD' | 'UZS'

  // Equipment & Inventory
  equipmentList: BUSINESS_CATEGORIES[0].equipmentPresets.standard.map(item => ({ ...item })),
  autoFillInventory: true,
  positions: {},
  rotations: {},

  // ── Foot Traffic Simulation State ──
  footTrafficActive: false,
  footTrafficAnalytics: { avgWalkTimeSec: 0, pathLengthMeters: 0, warningMessage: '', isWarning: false },

  // ── Lighting & Time Simulation State ──
  lightingActive: false,
  timeOfDay: 13.0, // 6.0 to 22.0
  customLights: [], // array of { id, x, z, color, intensity, unitPrice: 120 }

  // ── Oylik xarajatlar va ROI ──
  monthlyExpenses: { ...DEFAULT_MONTHLY_EXPENSES },
  expectedMonthlyRevenue: 0,

  // ── Auto-save UI ──
  lastAutosaveAt: null,
  autosaveJustSaved: false,
  pendingAutosaveDraft: null, // { savedAt, state } — restore prompt uchun

  // Saved Projects
  savedProjects: [
    {
      id: 'demo_proj_1',
      title: 'Toshkent Oziq-ovqat Do\'koni',
      categoryName: 'Oziq-ovqat va Supermarket',
      dimensions: { width: 10, length: 12, height: 3.2 },
      totalCost: 24850,
      createdAt: '2026-08-18'
    }
  ],

  // Actions
  setActivePage: (page) => set({ activePage: page }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPositions: (positions) => set({ positions }),
  setRotations: (rotations) => set({ rotations }),
  updatePosition: (uid, pos) => set(state => ({ positions: { ...state.positions, [uid]: pos } })),
  updateRotation: (uid, rot) => set(state => ({ rotations: { ...state.rotations, [uid]: rot } })),

  // Simulation Toggles & Handlers
  toggleFootTraffic: () => set(state => ({ footTrafficActive: !state.footTrafficActive })),
  setFootTrafficAnalytics: (analytics) => set({ footTrafficAnalytics: analytics }),

  toggleLighting: () => set(state => ({ lightingActive: !state.lightingActive })),
  setTimeOfDay: (time) => set({ timeOfDay: Number(time) }),
  addCustomLight: (light) => set(state => ({ customLights: [...state.customLights, light] })),
  removeCustomLight: (id) => set(state => ({ customLights: state.customLights.filter(l => l.id !== id) })),
  updateCustomLightPos: (id, x, z) => set(state => ({
    customLights: state.customLights.map(l => l.id === id ? { ...l, x, z } : l)
  })),
  clearCustomLights: () => set({ customLights: [] }),

  selectCategory: (category) => {
    const defaultTier = 'standard';
    const initialEquipment = category.equipmentPresets[defaultTier].map(item => ({ ...item, count: 0 }));
    set({
      selectedCategory: category,
      roomDimensions: { ...category.defaultDimensions },
      userBudget: '',
      equipmentList: initialEquipment,
      positions: {},
      rotations: {},
      activePage: 'planner',
    });
  },



  setRoomDimensions: (dims) => set((state) => ({
    roomDimensions: { ...state.roomDimensions, ...dims }
  })),

  setUserBudget: (budget) => set({ userBudget: Number(budget) }),
  setCurrency: (curr) => set({ currency: curr }),
  toggleAutoFill: () => set((state) => ({ autoFillInventory: !state.autoFillInventory })),

  updateEquipmentCount: (id, change) => set((state) => ({
    equipmentList: state.equipmentList.map(item => {
      if (item.id === id) {
        const newCount = Math.max(0, item.count + change);
        return { ...item, count: newCount };
      }
      return item;
    })
  })),

  // ── Foydalanuvchi qo'shgan maxsus (custom) jihozlar ──
  addCustomEquipmentItem: (item) => set((state) => ({
    equipmentList: [...state.equipmentList, item]
  })),

  removeCustomEquipmentItem: (id) => set((state) => ({
    equipmentList: state.equipmentList.filter(item => item.id !== id)
  })),

  applyLayoutTemplate: (layoutType) => {
    const { roomDimensions, equipmentList, selectedCategory } = get();
    const { width: W, length: L } = roomDimensions;

    // Shablon tanlanganda, agar jihozlar soni 0 bo'lsa, standard preset dagi default miqdorlarni yuklaymiz
    let activeEquipment = equipmentList.map(item => ({ ...item }));
    const totalCount = activeEquipment.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) {
      const preset = selectedCategory.equipmentPresets.standard;
      activeEquipment = preset.map(item => ({ ...item }));
    }

    const flatItems = [];
    activeEquipment.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flatItems.push({
          uid: `${item.id}_${i}`,
          type: item.type,
          width: item.width,
          depth: item.depth || 0.8,
          height: item.height || 2.0
        });
      }
    });

    const newPositions = {};
    const newRotations = {};

    // ── Elementlarni vazifasiga ko'ra ajratamiz ──
    const counters = flatItems.filter(item => item.type === 'counter');
    const seatings = flatItems.filter(item => item.type === 'seating' || item.type === 'sofa');
    const wallsAndIslands = flatItems.filter(item => item.type !== 'counter' && item.type !== 'seating' && item.type !== 'sofa');

    const wallOffset = 0.05; // Devor bilan oraliq (yopishib turishi uchun)

    if (layoutType === 'linear') {
      // 1. LINEAR: Xona uzunligi va kengligi bo'ylab devorlarga ketma-ket yopishtirib joylashtirish
      counters.forEach((c, idx) => {
        const cWidth = c.width || 1.8;
        const totalCountersW = counters.length * (cWidth + 0.3);
        const startX = -totalCountersW / 2 + cWidth / 2;
        newPositions[c.uid] = [startX + idx * (cWidth + 0.3), 0, L / 2 - (c.depth || 0.85) / 2 - 0.5];
        newRotations[c.uid] = 2; // Face south / entrance
      });

      seatings.forEach((s, idx) => {
        newPositions[s.uid] = [-W / 2 + 1.2 + (idx * 1.4), 0, L / 2 - 1.8];
        newRotations[s.uid] = 0;
      });

      let curSide = 0; // 0: orqa devor, 1: chap devor, 2: o'ng devor, 3: markaz
      let curX = -W / 2 + 0.8;
      let curZLeft = -L / 2 + 0.8;
      let curZRight = -L / 2 + 0.8;
      let centerIdx = 0;

      wallsAndIslands.forEach((item) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.4;

        if (curSide === 0) {
          if (curX + w / 2 <= W / 2 - 0.8) {
            newPositions[item.uid] = [curX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
            newRotations[item.uid] = 0;
            curX += w + 0.1;
          } else {
            curSide = 1;
          }
        }
        if (curSide === 1) {
          if (curZLeft + w / 2 <= L / 2 - 1.8) {
            newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curZLeft + w / 2];
            newRotations[item.uid] = 1; // 90 deg (chap devorga yopishgan)
            curZLeft += w + 0.1;
          } else {
            curSide = 2;
          }
        }
        if (curSide === 2) {
          if (curZRight + w / 2 <= L / 2 - 1.8) {
            newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curZRight + w / 2];
            newRotations[item.uid] = 3; // 270 deg (o'ng devorga yopishgan)
            curZRight += w + 0.1;
          } else {
            curSide = 3;
          }
        }
        if (curSide === 3) {
          // Xona uzun bo'lsa markazga qator qilib joylaymiz
          const row = Math.floor(centerIdx / 4);
          const col = centerIdx % 4;
          newPositions[item.uid] = [
            -W / 4 + col * (w + 0.3),
            0,
            -L / 4 + row * (d + 1.2)
          ];
          newRotations[item.uid] = 0;
          centerIdx++;
        }
      });
    } else if (layoutType === 'island') {
      // 2. ISLAND: Markaziy orolchalar va perimeter devorlar xona o'lchamiga mos
      counters.forEach((c, idx) => {
        newPositions[c.uid] = [W / 2 - (c.width || 1.8) / 2 - 0.6, 0, L / 2 - 1.5 - (idx * 1.5)];
        newRotations[c.uid] = 3;
      });

      const centerCount = Math.ceil(wallsAndIslands.length * 0.5);
      const centerItems = wallsAndIslands.slice(0, centerCount);
      const wallItems = wallsAndIslands.slice(centerCount);

      // Orolchalar markazda
      const cols = Math.max(1, Math.floor((W - 3) / 1.8));
      centerItems.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const startX = -((cols - 1) * 1.6) / 2;
        const x = startX + col * 1.6;
        const z = -L / 6 + row * 1.8;
        newPositions[item.uid] = [x, 0, z];
        newRotations[item.uid] = (row % 2 === 0) ? 0 : 2;
      });

      // Devorlar bo'ylab
      let curX = -W / 2 + 0.8;
      let curZ = -L / 2 + 0.8;
      wallItems.forEach((item, idx) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.4;
        if (idx % 2 === 0 && curX + w / 2 <= W / 2 - 0.8) {
          newPositions[item.uid] = [curX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
          newRotations[item.uid] = 0;
          curX += w + 0.15;
        } else if (curZ + w / 2 <= L / 2 - 1.8) {
          newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curZ + w / 2];
          newRotations[item.uid] = 1;
          curZ += w + 0.15;
        } else {
          newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curZ - 1.5];
          newRotations[item.uid] = 3;
        }
      });

      seatings.forEach((s, idx) => {
        newPositions[s.uid] = [-W / 3, 0, L / 3 + (idx * 1.3)];
        newRotations[s.uid] = 0;
      });
    } else if (layoutType === 'ushape') {
      // 3. U-SHAPE: U-simon tartib (chap devor, orqa devor, o'ng devor)
      counters.forEach((c, idx) => {
        newPositions[c.uid] = [0, 0, L / 2 - (c.depth || 0.85) / 2 - 0.5];
        newRotations[c.uid] = 2;
      });

      let curLeftZ = -L / 2 + 0.8;
      let curBackX = -W / 2 + 0.8;
      let curRightZ = -L / 2 + 0.8;
      let wallStep = 0;

      wallsAndIslands.forEach((item) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.4;

        if (wallStep === 0) {
          if (curLeftZ + w / 2 <= L / 2 - 1.8) {
            newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curLeftZ + w / 2];
            newRotations[item.uid] = 1;
            curLeftZ += w + 0.1;
          } else {
            wallStep = 1;
          }
        }
        if (wallStep === 1) {
          if (curBackX + w / 2 <= W / 2 - 0.8) {
            newPositions[item.uid] = [curBackX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
            newRotations[item.uid] = 0;
            curBackX += w + 0.1;
          } else {
            wallStep = 2;
          }
        }
        if (wallStep === 2) {
          if (curRightZ + w / 2 <= L / 2 - 1.8) {
            newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curRightZ + w / 2];
            newRotations[item.uid] = 3;
            curRightZ += w + 0.1;
          } else {
            // O'rtaga
            newPositions[item.uid] = [0, 0, curLeftZ - 2.0];
            newRotations[item.uid] = 0;
          }
        }
      });

      seatings.forEach((s, idx) => {
        newPositions[s.uid] = [W / 2 - 1.6, 0, L / 2 - 1.8 - (idx * 1.3)];
        newRotations[s.uid] = 3;
      });
    } else {
      // 4. CORNER: L-simon tartib (orqa devor va chap devor)
      counters.forEach((c, idx) => {
        newPositions[c.uid] = [W / 4, 0, L / 2 - (c.depth || 0.85) / 2 - 0.5];
        newRotations[c.uid] = 2;
      });

      let curLeftZ = -L / 2 + 0.8;
      let curBackX = -W / 2 + 0.8;
      let wallStep = 0;

      wallsAndIslands.forEach((item) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.4;

        if (wallStep === 0) {
          if (curLeftZ + w / 2 <= L / 2 - 1.8) {
            newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curLeftZ + w / 2];
            newRotations[item.uid] = 1;
            curLeftZ += w + 0.1;
          } else {
            wallStep = 1;
          }
        }
        if (wallStep === 1) {
          if (curBackX + w / 2 <= W / 2 - 0.8) {
            newPositions[item.uid] = [curBackX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
            newRotations[item.uid] = 0;
            curBackX += w + 0.1;
          } else {
            // Qolganlari o'ng tomonga
            newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curLeftZ - 2.5];
            newRotations[item.uid] = 3;
          }
        }
      });

      seatings.forEach((s, idx) => {
        const sW = s.width || 1.2;
        const cols = Math.max(1, Math.floor((W - 2) / 1.6));
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        newPositions[s.uid] = [
          -W / 2 + 1.2 + col * 1.6,
          0,
          L / 2 - 1.6 - row * 1.6
        ];
        newRotations[s.uid] = 0;
      });
    }

    // ── Xona chegaralariga majburiy sig'dirish (Strict Clamp) ──
    // Har bir jihoz o'z o'lchamini hisobga olgan holda devor ichida qolishini kafolatlaydi
    flatItems.forEach(item => {
      const pos = newPositions[item.uid];
      if (pos) {
        const rotStep = newRotations[item.uid] || 0;
        const isRot = rotStep === 1 || rotStep === 3;
        const effW = isRot ? (item.depth || 0.8) : (item.width || 1.2);
        const effD = isRot ? (item.width || 1.2) : (item.depth || 0.8);

        const minX = -W / 2 + effW / 2 + 0.05;
        const maxX = W / 2 - effW / 2 - 0.05;
        const minZ = -L / 2 + effD / 2 + 0.05;
        const maxZ = L / 2 - effD / 2 - 0.05;

        pos[0] = Math.max(minX, Math.min(maxX, pos[0]));
        pos[2] = Math.max(minZ, Math.min(maxZ, pos[2]));
      }
    });

    set({
      equipmentList: activeEquipment,
      positions: newPositions,
      rotations: newRotations
    });
  },

  saveCurrentProject: (title) => {
    const state = get();
    const area = state.roomDimensions.width * state.roomDimensions.length;
    const equipmentTotal = state.equipmentList.reduce((sum, item) => sum + (item.unitPrice * item.count), 0);
    const inventoryTotal = state.autoFillInventory ? Math.round(area * state.selectedCategory.inventoryPricePerM2) : 0;
    const renovationTotal = Math.round(area * state.selectedCategory.renovationPricePerM2);
    const grandTotal = equipmentTotal + inventoryTotal + renovationTotal;

    const newProj = {
      id: 'proj_' + Date.now(),
      title: title || `${state.selectedCategory.name} (${area} m²)`,
      categoryName: state.selectedCategory.name,
      categoryId: state.selectedCategory.id,
      dimensions: JSON.parse(JSON.stringify(state.roomDimensions)),
      equipmentList: JSON.parse(JSON.stringify(state.equipmentList)),
      positions: JSON.parse(JSON.stringify(state.positions)),
      rotations: JSON.parse(JSON.stringify(state.rotations)),
      customLights: JSON.parse(JSON.stringify(state.customLights)),
      autoFillInventory: state.autoFillInventory,
      totalCost: grandTotal,
      createdAt: new Date().toISOString().split('T')[0]
    };

    set((s) => ({ savedProjects: [newProj, ...s.savedProjects] }));
  },

  loadSavedProject: (proj) => {
    const cat = BUSINESS_CATEGORIES.find(c => c.id === proj.categoryId) || BUSINESS_CATEGORIES[0];
    set({
      selectedCategory: cat,
      roomDimensions: proj.dimensions ? JSON.parse(JSON.stringify(proj.dimensions)) : { ...cat.defaultDimensions },
      equipmentList: proj.equipmentList ? JSON.parse(JSON.stringify(proj.equipmentList)) : cat.equipmentPresets.standard.map(i => ({ ...i })),
      positions: proj.positions ? JSON.parse(JSON.stringify(proj.positions)) : {},
      rotations: proj.rotations ? JSON.parse(JSON.stringify(proj.rotations)) : {},
      customLights: proj.customLights ? JSON.parse(JSON.stringify(proj.customLights)) : [],
      autoFillInventory: proj.autoFillInventory !== undefined ? proj.autoFillInventory : true,
      lightingActive: (proj.customLights && proj.customLights.length > 0) ? true : get().lightingActive,
      activePage: 'planner'
    });
  },

  deleteProject: (id) => set((state) => ({
    savedProjects: state.savedProjects.filter(p => p.id !== id)
  })),

  // ── Oylik xarajatlar ──
  setMonthlyExpense: (field, value) => set((state) => ({
    monthlyExpenses: { ...state.monthlyExpenses, [field]: value },
  })),
  setExpectedMonthlyRevenue: (value) => set({ expectedMonthlyRevenue: value }),

  // ── Auto-save ──
  setLastAutosaveAt: (iso) => set({ lastAutosaveAt: iso }),
  flashAutosaveSaved: () => {
    set({ autosaveJustSaved: true });
    setTimeout(() => set({ autosaveJustSaved: false }), 2000);
  },
  checkPendingAutosaveDraft: () => {
    try {
      const raw = localStorage.getItem('shopplan_autosave_draft');
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.savedAt && draft?.state) {
        set({ pendingAutosaveDraft: draft });
      }
    } catch { /* ignore */ }
  },
  restoreFromAutosaveDraft: () => {
    const draft = get().pendingAutosaveDraft;
    if (!draft?.state) return;
    const cat = BUSINESS_CATEGORIES.find(c => c.id === draft.state.selectedCategoryId) || BUSINESS_CATEGORIES[0];
    set({
      selectedCategory: cat,
      roomDimensions: draft.state.roomDimensions || { ...cat.defaultDimensions },
      equipmentList: draft.state.equipmentList || cat.equipmentPresets.standard.map(i => ({ ...i })),
      positions: draft.state.positions || {},
      rotations: draft.state.rotations || {},
      customLights: draft.state.customLights || [],
      autoFillInventory: draft.state.autoFillInventory ?? true,
      userBudget: draft.state.userBudget ?? '',
      monthlyExpenses: draft.state.monthlyExpenses || { ...DEFAULT_MONTHLY_EXPENSES },
      expectedMonthlyRevenue: draft.state.expectedMonthlyRevenue ?? 0,
      pendingAutosaveDraft: null,
      activePage: 'planner',
    });
  },
  dismissAutosaveDraft: () => {
    clearAutosaveDraft();
    set({ pendingAutosaveDraft: null });
  },

  // Faqat bannerni yopadi — saqlangan loyiha localStorage'da qolaveradi,
  // sahifa qayta ochilganda banner yana chiqadi
  hideAutosaveDraftBanner: () => set({ pendingAutosaveDraft: null }),
}));