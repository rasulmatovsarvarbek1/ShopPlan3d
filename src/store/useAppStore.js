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

/**
 * Barcha jihozlarni xona devorlari ichida qat'iy saqlash va bir-birining
 * ichiga kirib ketishini to'liq bartaraf etuvchi iterativ ajratish algoritmi.
 */
export const separateAndClampAllItems = (items, positions, rotations, W, L) => {
  const margin = 0.1; // Devordan kamida 10 sm ichkarida
  const gap = 0.1;   // Jihozlar oralig'ida kamida 10 sm bo'sh joy
  const MAX_GLOBAL_ITERS = 15;

  // 1. Boshlang'ich qat'iy chegaralash
  items.forEach(item => {
    const pos = positions[item.uid];
    if (!pos || pos.length < 3) return;
    const rotStep = rotations[item.uid] || 0;
    const isRot = rotStep === 1 || rotStep === 3;
    const effW = isRot ? (item.depth || 0.8) : (item.width || 1.2);
    const effD = isRot ? (item.width || 1.2) : (item.depth || 0.8);

    const minX = -W / 2 + effW / 2 + margin;
    const maxX = W / 2 - effW / 2 - margin;
    const minZ = -L / 2 + effD / 2 + margin;
    const maxZ = L / 2 - effD / 2 - margin;

    pos[0] = Math.max(minX, Math.min(maxX, pos[0]));
    pos[2] = Math.max(minZ, Math.min(maxZ, pos[2]));
  });

  // 2. Bir-birining ichiga kirib qolishini bartaraf etish
  for (let iter = 0; iter < MAX_GLOBAL_ITERS; iter++) {
    let hasConflict = false;

    for (let i = 0; i < items.length; i++) {
      const itemA = items[i];
      const posA = positions[itemA.uid];
      if (!posA) continue;
      const rotA = rotations[itemA.uid] || 0;
      const isRotA = rotA === 1 || rotA === 3;
      const effWA = isRotA ? (itemA.depth || 0.8) : (itemA.width || 1.2);
      const effDA = isRotA ? (itemA.width || 1.2) : (itemA.depth || 0.8);

      for (let j = i + 1; j < items.length; j++) {
        const itemB = items[j];
        const posB = positions[itemB.uid];
        if (!posB) continue;
        const rotB = rotations[itemB.uid] || 0;
        const isRotB = rotB === 1 || rotB === 3;
        const effWB = isRotB ? (itemB.depth || 0.8) : (itemB.width || 1.2);
        const effDB = isRotB ? (itemB.width || 1.2) : (itemB.depth || 0.8);

        const overlapX = (effWA + effWB) / 2 + gap - Math.abs(posA[0] - posB[0]);
        const overlapZ = (effDA + effDB) / 2 + gap - Math.abs(posA[2] - posB[2]);

        if (overlapX > 0 && overlapZ > 0) {
          hasConflict = true;
          if (overlapX < overlapZ) {
            const push = overlapX / 2 + 0.02;
            if (posA[0] >= posB[0]) {
              posA[0] += push;
              posB[0] -= push;
            } else {
              posA[0] -= push;
              posB[0] += push;
            }
          } else {
            const push = overlapZ / 2 + 0.02;
            if (posA[2] >= posB[2]) {
              posA[2] += push;
              posB[2] -= push;
            } else {
              posA[2] -= push;
              posB[2] += push;
            }
          }
        }
      }

      // Har bir itarishdan keyin xona ichida ushlab turish
      const minX = -W / 2 + effWA / 2 + margin;
      const maxX = W / 2 - effWA / 2 - margin;
      const minZ = -L / 2 + effDA / 2 + margin;
      const maxZ = L / 2 - effDA / 2 - margin;

      posA[0] = Math.max(minX, Math.min(maxX, posA[0]));
      posA[2] = Math.max(minZ, Math.min(maxZ, posA[2]));
    }

    if (!hasConflict) break;
  }
};

/**
 * Yangi jihoz qo'shilganda uning joylashuvini aniqlash:
 * Foydalanuvchi oxirgi o'zgartirgan / siljitgan / tanlagan elementining OLDIDAN (front)
 * yoki uning yonidan to'qnashmasdan va xona chegarasidan chiqmasdan joylashtiradi.
 */
export const calculateNewItemPlacement = (state, targetItemId) => {
  const { equipmentList = [], positions = {}, rotations = {}, roomDimensions = { width: 12, length: 14 }, lastInteractedUid } = state;
  const { width: W, length: L } = roomDimensions;
  const targetItem = equipmentList.find(e => e.id === targetItemId);
  const newW = targetItem?.width || 1.0;
  const newD = targetItem?.depth || 1.0;

  const margin = 0.15;
  const minX = -W / 2 + newW / 2 + margin;
  const maxX = W / 2 - newW / 2 - margin;
  const minZ = -L / 2 + newD / 2 + margin;
  const maxZ = L / 2 - newD / 2 - margin;

  const isInsideRoom = (cx, cz) => cx >= minX && cx <= maxX && cz >= minZ && cz <= maxZ;

  const isColliding = (cx, cz, rot) => {
    const isSwapped = (rot % 2 !== 0);
    const nEW = isSwapped ? newD : newW;
    const nED = isSwapped ? newW : newD;

    for (const [otherUid, otherPos] of Object.entries(positions)) {
      if (!otherPos || otherPos.length < 3) continue;
      const otherItemId = otherUid.substring(0, otherUid.lastIndexOf('_'));
      const otherItem = equipmentList.find(e => e.id === otherItemId);
      const otherW = otherItem?.width || 1.0;
      const otherD = otherItem?.depth || 1.0;
      const otherRot = rotations[otherUid] || 0;
      const oSwapped = (otherRot % 2 !== 0);
      const oEW = oSwapped ? otherD : otherW;
      const oED = oSwapped ? otherW : otherD;

      if (
        Math.abs(cx - otherPos[0]) < (nEW + oEW) / 2 + 0.05 &&
        Math.abs(cz - otherPos[2]) < (nED + oED) / 2 + 0.05
      ) {
        return true;
      }
    }
    return false;
  };

  // 1. Foydalanuvchi oxirgi siljitgan / o'zgartirgan / qo'shgan elementni qidiramiz
  let refPos = null;
  let refRot = 0;
  let refItem = null;

  if (lastInteractedUid && positions[lastInteractedUid]) {
    refPos = positions[lastInteractedUid];
    refRot = rotations[lastInteractedUid] || 0;
    const refItemId = lastInteractedUid.substring(0, lastInteractedUid.lastIndexOf('_'));
    refItem = equipmentList.find(e => e.id === refItemId);
  } else {
    // Agar lastInteractedUid belgilanmagan bo'lsa, xonadagi oxirgi mavjud elementni olamiz
    const placedUids = Object.keys(positions);
    if (placedUids.length > 0) {
      const lastUid = placedUids[placedUids.length - 1];
      refPos = positions[lastUid];
      refRot = rotations[lastUid] || 0;
      const refItemId = lastUid.substring(0, lastUid.lastIndexOf('_'));
      refItem = equipmentList.find(e => e.id === refItemId);
    }
  }

  // Agar oldingi o'zgartirilgan element mavjud bo'lsa:
  if (refPos && Array.isArray(refPos) && refPos.length >= 3) {
    const refW = refItem?.width || 1.0;
    const refD = refItem?.depth || 1.0;
    const refAngle = (refRot % 4) * (Math.PI / 2);

    // Oldinga yo'nalish vektori (facing front)
    const forwardX = Math.sin(refAngle);
    const forwardZ = Math.cos(refAngle);
    // Yon taraf vektori (right side)
    const rightX = Math.cos(refAngle);
    const rightZ = -Math.sin(refAngle);

    const distFront = (refD / 2) + (newD / 2) + 0.35; // Oldida 0.35m bo'shliq
    const sideDist = (refW / 2) + (newW / 2) + 0.2;  // Yonida 0.2m bo'shliq

    // Nomzod pozitsiyalar (Aynan OLDIDAN boshlab tekshiriladi)
    const candidates = [
      // 1. To'g'ridan-to'g'ri oldida
      [refPos[0] + forwardX * distFront, 0, refPos[2] + forwardZ * distFront],
      // 2. Oldi o'ng tarafida
      [refPos[0] + forwardX * distFront + rightX * (newW * 0.6), 0, refPos[2] + forwardZ * distFront + rightZ * (newW * 0.6)],
      // 3. Oldi chap tarafida
      [refPos[0] + forwardX * distFront - rightX * (newW * 0.6), 0, refPos[2] + forwardZ * distFront - rightZ * (newW * 0.6)],
      // 4. O'ng yonida
      [refPos[0] + rightX * sideDist, 0, refPos[2] + rightZ * sideDist],
      // 5. Chap yonida
      [refPos[0] - rightX * sideDist, 0, refPos[2] - rightZ * sideDist],
      // 6. Bir qadam oldinroqda
      [refPos[0] + forwardX * (distFront + newD + 0.3), 0, refPos[2] + forwardZ * (distFront + newD + 0.3)],
      // 7. Orqasida
      [refPos[0] - forwardX * distFront, 0, refPos[2] - forwardZ * distFront],
    ];

    for (const cand of candidates) {
      const cx = cand[0];
      const cz = cand[2];
      if (isInsideRoom(cx, cz) && !isColliding(cx, cz, refRot)) {
        return {
          position: [Number(cx.toFixed(3)), 0, Number(cz.toFixed(3))],
          rotation: refRot
        };
      }
    }

    // Agar hamma nomzodlar devorga yetsa, eng ma'qulini xona chegarasida qaytarish
    const fallbackX = Math.max(minX, Math.min(maxX, candidates[0][0]));
    const fallbackZ = Math.max(minZ, Math.min(maxZ, candidates[0][2]));
    return {
      position: [Number(fallbackX.toFixed(3)), 0, Number(fallbackZ.toFixed(3))],
      rotation: refRot
    };
  }

  // Agar xonada hali hech qanday element bo'lmasa, markazga yaqin joylashtiramiz
  const defaultX = 0;
  const defaultZ = Number((L / 4).toFixed(3));
  return {
    position: [defaultX, 0, defaultZ],
    rotation: 0
  };
};

export const useAppStore = create((set, get) => ({
  // Navigation & View
  activePage: 'landing', // 'landing' | 'selector' | 'planner' | 'user-panel' | 'admin-panel'
  viewMode: '3d', // '3d' | 'top2d'

  // Xonani qulflash rejimi
  roomLocked: false,
  roomRotationAngle: 0,
  toggleRoomLocked: () => set((state) => ({ roomLocked: !state.roomLocked })),
  rotateRoomAngle: (delta) => set((state) => ({ roomRotationAngle: state.roomRotationAngle + delta })),

  // ── Kamera/Controls'ga to'g'ridan-to'g'ri (imperativ) murojaat — PDF eksport uchun ──
  cameraApi: null, // { camera, controls }
  setCameraApi: (camera, controls) => set({ cameraApi: { camera, controls } }),

  // Business Category
  selectedCategory: BUSINESS_CATEGORIES[0],

  // Room & Budget Parameters
  roomDimensions: { width: 12, length: 14, height: 3.2 },
  userBudget: '',
  currency: 'USD', // 'USD' | 'UZS'

  // Equipment & Inventory
  equipmentList: BUSINESS_CATEGORIES[0].equipmentPresets.standard.map(item => ({ ...item })),
  autoFillInventory: true,
  positions: {},
  rotations: {},
  lastInteractedUid: null,

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
  setLastInteractedUid: (uid) => set({ lastInteractedUid: uid }),
  updatePosition: (uid, pos) => set(state => ({
    positions: { ...state.positions, [uid]: pos },
    lastInteractedUid: uid
  })),
  updateRotation: (uid, rot) => set(state => ({
    rotations: { ...state.rotations, [uid]: rot },
    lastInteractedUid: uid
  })),

  // Simulation Toggles & Handlers
  toggleFootTraffic: () => set(state => ({ footTrafficActive: !state.footTrafficActive })),
  setFootTrafficAnalytics: (analytics) => set({ footTrafficAnalytics: analytics }),

  toggleLighting: () => set({ lightingActive: !get().lightingActive }),
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
      lastInteractedUid: null,
      activePage: 'planner',
    });
  },

  setRoomDimensions: (dims) => set((state) => {
    const nextDims = { ...state.roomDimensions, ...dims };
    const nextW = nextDims.width;
    const nextL = nextDims.length;
    const margin = 0.1;

    // Position larni yangi o'lcham chegarasida saqlash
    const nextPositions = { ...state.positions };
    const flatItems = [];
    state.equipmentList.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flatItems.push({
          uid: `${item.id}_${i}`,
          width: item.width || 1.0,
          depth: item.depth || 0.8,
        });
      }
    });

    separateAndClampAllItems(flatItems, nextPositions, state.rotations, nextW, nextL);

    return {
      roomDimensions: nextDims,
      positions: nextPositions
    };
  }),

  setUserBudget: (budget) => set({ userBudget: Number(budget) }),
  setCurrency: (curr) => set({ currency: curr }),
  toggleAutoFill: () => set((state) => ({ autoFillInventory: !state.autoFillInventory })),

  updateEquipmentCount: (id, change) => set((state) => {
    let nextPositions = { ...state.positions };
    let nextRotations = { ...state.rotations };
    let lastUid = state.lastInteractedUid;

    const nextEquipmentList = state.equipmentList.map(item => {
      if (item.id === id) {
        const oldCount = item.count;
        const newCount = Math.max(0, oldCount + change);

        if (newCount > oldCount) {
          // Yangi qo'shilayotgan elementlarni foydalanuvchi oxirgi o'zgartirgan/siljitgan elementining OLDIDAN joylashtiramiz
          for (let i = oldCount; i < newCount; i++) {
            const newUid = `${id}_${i}`;
            const placement = calculateNewItemPlacement(
              {
                equipmentList: state.equipmentList,
                positions: nextPositions,
                rotations: nextRotations,
                roomDimensions: state.roomDimensions,
                lastInteractedUid: lastUid
              },
              id
            );
            nextPositions[newUid] = placement.position;
            nextRotations[newUid] = placement.rotation;
            lastUid = newUid;
          }
        } else if (newCount < oldCount) {
          for (let i = newCount; i < oldCount; i++) {
            delete nextPositions[`${id}_${i}`];
            delete nextRotations[`${id}_${i}`];
          }
          if (lastUid && lastUid.startsWith(`${id}_`)) {
            lastUid = null;
          }
        }
        return { ...item, count: newCount };
      }
      return item;
    });

    return {
      equipmentList: nextEquipmentList,
      positions: nextPositions,
      rotations: nextRotations,
      lastInteractedUid: lastUid
    };
  }),

  setEquipmentCount: (id, count) => set((state) => {
    const parsed = parseInt(count, 10);
    const newCount = isNaN(parsed) ? 0 : Math.max(0, parsed);

    let nextPositions = { ...state.positions };
    let nextRotations = { ...state.rotations };
    let lastUid = state.lastInteractedUid;

    const nextEquipmentList = state.equipmentList.map(item => {
      if (item.id === id) {
        const oldCount = item.count;
        if (newCount > oldCount) {
          for (let i = oldCount; i < newCount; i++) {
            const newUid = `${id}_${i}`;
            const placement = calculateNewItemPlacement(
              {
                equipmentList: state.equipmentList,
                positions: nextPositions,
                rotations: nextRotations,
                roomDimensions: state.roomDimensions,
                lastInteractedUid: lastUid
              },
              id
            );
            nextPositions[newUid] = placement.position;
            nextRotations[newUid] = placement.rotation;
            lastUid = newUid;
          }
        } else if (newCount < oldCount) {
          for (let i = newCount; i < oldCount; i++) {
            delete nextPositions[`${id}_${i}`];
            delete nextRotations[`${id}_${i}`];
          }
          if (lastUid && lastUid.startsWith(`${id}_`)) {
            lastUid = null;
          }
        }
        return { ...item, count: newCount };
      }
      return item;
    });

    return {
      equipmentList: nextEquipmentList,
      positions: nextPositions,
      rotations: nextRotations,
      lastInteractedUid: lastUid
    };
  }),

  // ── Foydalanuvchi qo'shgan maxsus (custom) jihozlar ──
  addCustomEquipmentItem: (item) => set((state) => ({
    equipmentList: [...state.equipmentList, item]
  })),

  removeCustomEquipmentItem: (id) => set((state) => ({
    equipmentList: state.equipmentList.filter(item => item.id !== id)
  })),

  // ── Xonadagi barcha elementlarni tozalash ──
  clearAllEquipment: () => set((state) => ({
    equipmentList: state.equipmentList.map(item => ({ ...item, count: 0 })),
    positions: {},
    rotations: {},
    lastInteractedUid: null
  })),

  applyLayoutTemplate: (layoutType) => {
    const { roomDimensions, equipmentList, selectedCategory } = get();
    const { width: W, length: L } = roomDimensions;

    let activeEquipment = equipmentList.map(item => ({ ...item }));
    const totalCount = activeEquipment.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) {
      const preset = selectedCategory.equipmentPresets.standard;
      activeEquipment = preset.map(item => ({ ...item, count: 1 }));
    }

    const flatItems = [];
    activeEquipment.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flatItems.push({
          uid: `${item.id}_${i}`,
          type: item.type,
          width: item.width || 1.0,
          depth: item.depth || 0.8,
          height: item.height || 2.0
        });
      }
    });

    const newPositions = {};
    const newRotations = {};

    // ── Elementlarni turlariga ko'ra ajratamiz ──
    const counters = flatItems.filter(item => item.type === 'counter');
    const seatings = flatItems.filter(item => item.type === 'seating' || item.type === 'sofa');
    const wallsAndIslands = flatItems.filter(item => item.type !== 'counter' && item.type !== 'seating' && item.type !== 'sofa');

    const wallOffset = 0.15; // Devor ichki chegarasi
    const itemGap = 0.35;   // Jihozlar oralig'i

    if (layoutType === 'linear') {
      // 1. LINEAR: Devorlar va tartibli markaziy qatorlar
      counters.forEach((c, idx) => {
        const cWidth = c.width || 1.8;
        const totalCountersW = counters.length * (cWidth + 0.5);
        const startX = -totalCountersW / 2 + cWidth / 2;
        newPositions[c.uid] = [startX + idx * (cWidth + 0.5), 0, L / 2 - (c.depth || 0.85) / 2 - 0.8];
        newRotations[c.uid] = 2; // Janub/kirishga qaragan
      });

      seatings.forEach((s, idx) => {
        const sWidth = s.width || 1.8;
        newPositions[s.uid] = [-W / 2 + (s.depth || 0.8) / 2 + wallOffset, 0, L / 2 - 2.0 - (idx * (sWidth + 0.5))];
        newRotations[s.uid] = 1;
      });

      let curSide = 0; // 0: orqa devor, 1: chap devor, 2: o'ng devor, 3: markaz
      let curBackX = -W / 2 + 1.2;
      let curLeftZ = -L / 2 + 1.2;
      let curRightZ = -L / 2 + 1.2;
      let centerIdx = 0;

      wallsAndIslands.forEach((item) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;

        if (curSide === 0) {
          if (curBackX + w / 2 <= W / 2 - 1.2) {
            newPositions[item.uid] = [curBackX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
            newRotations[item.uid] = 0;
            curBackX += w + itemGap;
          } else {
            curSide = 1;
          }
        }
        if (curSide === 1) {
          if (curLeftZ + w / 2 <= L / 2 - 2.8) {
            newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curLeftZ + w / 2];
            newRotations[item.uid] = 1;
            curLeftZ += w + itemGap;
          } else {
            curSide = 2;
          }
        }
        if (curSide === 2) {
          if (curRightZ + w / 2 <= L / 2 - 2.8) {
            newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curRightZ + w / 2];
            newRotations[item.uid] = 3;
            curRightZ += w + itemGap;
          } else {
            curSide = 3;
          }
        }
        if (curSide === 3) {
          const cols = Math.max(1, Math.floor((W - 5.0) / (w + 1.2)));
          const row = Math.floor(centerIdx / cols);
          const col = centerIdx % cols;
          const startX = -((cols - 1) * (w + 1.2)) / 2;
          newPositions[item.uid] = [
            startX + col * (w + 1.2),
            0,
            -L / 4 + row * (d + 1.6)
          ];
          newRotations[item.uid] = 0;
          centerIdx++;
        }
      });
    } else if (layoutType === 'island') {
      // 2. ISLAND: Markaziy orolchalar va erkin yo'laklar
      counters.forEach((c, idx) => {
        const cWidth = c.width || 1.8;
        newPositions[c.uid] = [W / 2 - (c.depth || 0.85) / 2 - wallOffset, 0, L / 2 - 1.5 - (idx * (cWidth + 0.5))];
        newRotations[c.uid] = 3;
      });

      const centerCount = Math.ceil(wallsAndIslands.length * 0.55);
      const centerItems = wallsAndIslands.slice(0, centerCount);
      const wallItems = wallsAndIslands.slice(centerCount);

      const cols = Math.max(1, Math.floor((W - 5.0) / 2.4));
      centerItems.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const startX = -((cols - 1) * 2.4) / 2;
        const x = startX + col * 2.4;
        const z = -L / 4 + row * 2.5;
        newPositions[item.uid] = [x, 0, z];
        newRotations[item.uid] = (row % 2 === 0) ? 0 : 2;
      });

      let curX = -W / 2 + 1.2;
      let curZ = -L / 2 + 1.2;
      wallItems.forEach((item, idx) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;
        if (idx % 2 === 0 && curX + w / 2 <= W / 2 - 1.2) {
          newPositions[item.uid] = [curX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
          newRotations[item.uid] = 0;
          curX += w + itemGap;
        } else if (curZ + w / 2 <= L / 2 - 2.8) {
          newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curZ + w / 2];
          newRotations[item.uid] = 1;
          curZ += w + itemGap;
        } else {
          newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curZ - 1.5];
          newRotations[item.uid] = 3;
        }
      });

      seatings.forEach((s, idx) => {
        const sWidth = s.width || 1.8;
        newPositions[s.uid] = [-W / 3 + (idx * (sWidth + 0.6)), 0, L / 2 - 1.8];
        newRotations[s.uid] = 0;
      });
    } else if (layoutType === 'perimeter') {
      // 3. PERIMETER: Devorlar bo'ylab aylana tartib
      counters.forEach((c, idx) => {
        const cWidth = c.width || 1.8;
        newPositions[c.uid] = [0 + idx * (cWidth + 0.6), 0, L / 2 - (c.depth || 0.85) / 2 - 0.8];
        newRotations[c.uid] = 2;
      });

      let curLeftZ = -L / 2 + 1.2;
      let curBackX = -W / 2 + 1.2;
      let curRightZ = -L / 2 + 1.2;
      let wallStep = 0;

      wallsAndIslands.forEach((item) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;

        if (wallStep === 0) {
          if (curLeftZ + w / 2 <= L / 2 - 2.8) {
            newPositions[item.uid] = [-W / 2 + d / 2 + wallOffset, 0, curLeftZ + w / 2];
            newRotations[item.uid] = 1;
            curLeftZ += w + itemGap;
          } else {
            wallStep = 1;
          }
        }
        if (wallStep === 1) {
          if (curBackX + w / 2 <= W / 2 - 1.2) {
            newPositions[item.uid] = [curBackX + w / 2, 0, -L / 2 + d / 2 + wallOffset];
            newRotations[item.uid] = 0;
            curBackX += w + itemGap;
          } else {
            wallStep = 2;
          }
        }
        if (wallStep === 2) {
          if (curRightZ + w / 2 <= L / 2 - 2.8) {
            newPositions[item.uid] = [W / 2 - d / 2 - wallOffset, 0, curRightZ + w / 2];
            newRotations[item.uid] = 3;
            curRightZ += w + itemGap;
          } else {
            newPositions[item.uid] = [0, 0, -L / 4];
            newRotations[item.uid] = 0;
          }
        }
      });

      seatings.forEach((s, idx) => {
        const sWidth = s.width || 1.8;
        newPositions[s.uid] = [W / 2 - (s.depth || 0.8) / 2 - wallOffset, 0, L / 2 - 2.2 - (idx * (sWidth + 0.6))];
        newRotations[s.uid] = 3;
      });
    }

    // ── Qat'iy to'qnashuvlarni bartaraf etish va devorlar ichiga sig'dirish ──
    separateAndClampAllItems(flatItems, newPositions, newRotations, W, L);

    set({
      equipmentList: activeEquipment,
      positions: newPositions,
      rotations: newRotations,
      lastInteractedUid: flatItems.length > 0 ? flatItems[0].uid : null
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