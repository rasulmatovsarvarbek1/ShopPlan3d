import { create } from 'zustand';
import { BUSINESS_CATEGORIES } from '../data/businessCategories';

export const UZS_RATE = 12800; // 1 USD = 12,800 UZS

export const useAppStore = create((set, get) => ({
  // Navigation & View
  activePage: 'landing', // 'landing' | 'selector' | 'planner' | 'user-panel' | 'admin-panel'
  viewMode: '3d', // '3d' | 'top2d'

  // Business Category & Package Tier
  selectedCategory: BUSINESS_CATEGORIES[0],
  activeTier: 'standard', // 'economy' | 'standard' | 'premium'

  // Room & Budget Parameters
  roomDimensions: { width: 10, length: 12, height: 3.2 },
  userBudget: 25000,
  currency: 'USD', // 'USD' | 'UZS'

  // Equipment & Inventory
  equipmentList: BUSINESS_CATEGORIES[0].equipmentPresets.standard.map(item => ({ ...item })),
  autoFillInventory: true,
  positions: {},
  rotations: {},

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

  selectCategory: (category) => {
    const defaultTier = 'standard';
    const initialEquipment = category.equipmentPresets[defaultTier].map(item => ({ ...item, count: 0 }));
    set({
      selectedCategory: category,
      activeTier: defaultTier,
      roomDimensions: { ...category.defaultDimensions },
      userBudget: category.defaultBudget,
      equipmentList: initialEquipment,
      positions: {},
      rotations: {},
      activePage: 'planner',
    });
  },

  setActiveTier: (tier) => {
    const { selectedCategory } = get();
    if (selectedCategory && selectedCategory.equipmentPresets[tier]) {
      const newEquipment = selectedCategory.equipmentPresets[tier].map(item => ({ ...item, count: 0 }));
      set({
        activeTier: tier,
        equipmentList: newEquipment,
        positions: {},
        rotations: {},
      });
    }
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

  applyLayoutTemplate: (layoutType) => {
    const { roomDimensions, equipmentList, selectedCategory, activeTier } = get();
    const { width: W, length: L } = roomDimensions;

    // Shablon tanlanganda, agar jihozlar soni 0 bo'lsa, activePreset dagi default miqdorlarni yuklaymiz
    let activeEquipment = equipmentList.map(item => ({ ...item }));
    const totalCount = activeEquipment.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) {
      const preset = selectedCategory.equipmentPresets[activeTier] || selectedCategory.equipmentPresets.standard;
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
        newPositions[s.uid] = [W / 2 - 1.6, 0, -L / 2 + 1.8 + (idx * 1.6)];
        newRotations[s.uid] = 3;
      });
    }

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
      dimensions: { ...state.roomDimensions },
      totalCost: grandTotal,
      createdAt: new Date().toISOString().split('T')[0]
    };

    set((s) => ({ savedProjects: [newProj, ...s.savedProjects] }));
  },

  deleteProject: (id) => set((state) => ({
    savedProjects: state.savedProjects.filter(p => p.id !== id)
  })),
}));
