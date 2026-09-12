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

  const margin = 0.2;

  const isInsideRoom = (cx, cz, rot = 0) => {
    const isSwapped = (rot % 2 !== 0);
    const effW = isSwapped ? newD : newW;
    const effD = isSwapped ? newW : newD;
    const minX = -W / 2 + effW / 2 + margin;
    const maxX = W / 2 - effW / 2 - margin;
    const minZ = -L / 2 + effD / 2 + margin;
    const maxZ = L / 2 - effD / 2 - margin;
    return cx >= minX && cx <= maxX && cz >= minZ && cz <= maxZ;
  };

  const isColliding = (cx, cz, rot = 0) => {
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

      // 0.15m xavfsiz oraliq — elementlar bir-biriga teginmasligi uchun
      if (
        Math.abs(cx - otherPos[0]) < (nEW + oEW) / 2 + 0.15 &&
        Math.abs(cz - otherPos[2]) < (nED + oED) / 2 + 0.15
      ) {
        return true;
      }
    }
    return false;
  };

  // 1. Oxirgi o'zgartirilgan element atrofidagi nomzodlarni tekshiramiz
  let refPos = null;
  let refRot = 0;
  let refItem = null;

  if (lastInteractedUid && positions[lastInteractedUid]) {
    refPos = positions[lastInteractedUid];
    refRot = rotations[lastInteractedUid] || 0;
    const refItemId = lastInteractedUid.substring(0, lastInteractedUid.lastIndexOf('_'));
    refItem = equipmentList.find(e => e.id === refItemId);
  }

  if (refPos && Array.isArray(refPos) && refPos.length >= 3) {
    const refW = refItem?.width || 1.0;
    const refD = refItem?.depth || 1.0;
    const refAngle = (refRot % 4) * (Math.PI / 2);

    const forwardX = Math.sin(refAngle);
    const forwardZ = Math.cos(refAngle);
    const rightX = Math.cos(refAngle);
    const rightZ = -Math.sin(refAngle);

    const distFront = (refD / 2) + (newD / 2) + 0.4;
    const sideDist = (refW / 2) + (newW / 2) + 0.3;

    const candidates = [
      [refPos[0] + forwardX * distFront, 0, refPos[2] + forwardZ * distFront],
      [refPos[0] + rightX * sideDist, 0, refPos[2] + rightZ * sideDist],
      [refPos[0] - rightX * sideDist, 0, refPos[2] - rightZ * sideDist],
      [refPos[0] + forwardX * distFront + rightX * (newW * 0.6), 0, refPos[2] + forwardZ * distFront + rightZ * (newW * 0.6)],
      [refPos[0] + forwardX * distFront - rightX * (newW * 0.6), 0, refPos[2] + forwardZ * distFront - rightZ * (newW * 0.6)],
      [refPos[0] - forwardX * distFront, 0, refPos[2] - forwardZ * distFront],
    ];

    for (const cand of candidates) {
      const cx = cand[0];
      const cz = cand[2];
      if (isInsideRoom(cx, cz, refRot) && !isColliding(cx, cz, refRot)) {
        return {
          position: [Number(cx.toFixed(3)), 0, Number(cz.toFixed(3))],
          rotation: refRot
        };
      }
    }
  }

  // 2. Agar refPos atrofida xavfsiz bo'sh joy bo'lmasa,
  // butun xona bo'yicha to'qnashuvsiz, boshqa elementlarga halaqit bermaydigan haqiqiy BO'SH JOY qidiramiz
  let bestSpot = null;
  let maxClearance = -1;
  const step = 0.4;

  for (let rot of [0, 1]) {
    const isSwapped = (rot % 2 !== 0);
    const effW = isSwapped ? newD : newW;
    const effD = isSwapped ? newW : newD;
    const minX = -W / 2 + effW / 2 + margin;
    const maxX = W / 2 - effW / 2 - margin;
    const minZ = -L / 2 + effD / 2 + margin;
    const maxZ = L / 2 - effD / 2 - margin;

    for (let x = minX; x <= maxX; x += step) {
      for (let z = minZ; z <= maxZ; z += step) {
        if (!isColliding(x, z, rot)) {
          // Barcha mavjud elementlardan eng uzoq (eng keng va bo'sh) joyni tanlash
          let minDist = Infinity;
          const placedPositions = Object.values(positions);
          if (placedPositions.length === 0) {
            minDist = 10;
          } else {
            for (const otherPos of placedPositions) {
              if (!otherPos || otherPos.length < 3) continue;
              const d = Math.hypot(x - otherPos[0], z - otherPos[2]);
              if (d < minDist) minDist = d;
            }
          }

          if (minDist > maxClearance) {
            maxClearance = minDist;
            bestSpot = {
              position: [Number(x.toFixed(3)), 0, Number(z.toFixed(3))],
              rotation: rot
            };
          }
        }
      }
    }
  }

  if (bestSpot) {
    return bestSpot;
  }

  // 3. Agar mutlaqo bo'sh joy topilmasa
  return {
    position: [0, 0, 0],
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
  hasSelectedCategory: false,

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
  savedProjects: [],

  // ── Undo / Redo tarixi (positions + rotations) ──
  positionHistory: [],   // [{positions, rotations}, ...]
  positionFuture: [],    // redo uchun

  // Actions
  setActivePage: (page) => set({ activePage: page }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setPositions: (positions) => set({ positions }),
  setRotations: (rotations) => set({ rotations }),
  setLastInteractedUid: (uid) => set({ lastInteractedUid: uid }),

  // Bitta elementni yangilash — undo history saqlab
  updatePosition: (uid, pos) => set(state => {
    const snapshot = { positions: state.positions, rotations: state.rotations };
    return {
      positionHistory: [...state.positionHistory.slice(-49), snapshot],
      positionFuture: [],
      positions: { ...state.positions, [uid]: pos },
      lastInteractedUid: uid
    };
  }),
  updateRotation: (uid, rot) => set(state => {
    const snapshot = { positions: state.positions, rotations: state.rotations };
    return {
      positionHistory: [...state.positionHistory.slice(-49), snapshot],
      positionFuture: [],
      rotations: { ...state.rotations, [uid]: rot },
      lastInteractedUid: uid
    };
  }),

  // Undo: oxirgi o'zgarishni bekor qilish
  undoPosition: () => set(state => {
    if (state.positionHistory.length === 0) return {};
    const prev = state.positionHistory[state.positionHistory.length - 1];
    const current = { positions: state.positions, rotations: state.rotations };
    return {
      positionHistory: state.positionHistory.slice(0, -1),
      positionFuture: [current, ...state.positionFuture.slice(0, 49)],
      positions: prev.positions,
      rotations: prev.rotations,
    };
  }),

  // Redo: bekor qilingan o'zgarishni qaytarish
  redoPosition: () => set(state => {
    if (state.positionFuture.length === 0) return {};
    const next = state.positionFuture[0];
    const current = { positions: state.positions, rotations: state.rotations };
    return {
      positionHistory: [...state.positionHistory.slice(-49), current],
      positionFuture: state.positionFuture.slice(1),
      positions: next.positions,
      rotations: next.rotations,
    };
  }),

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
      hasSelectedCategory: true,
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
    const margin = 0.12;

    // Har bir mavjud element o'z o'rnida saqlanadi, faqat devordan tashqariga chiqib ketmasligi uchun chegaralanadi
    // Boshqa elementlarning o'zaro joylashuviga mutlaqo ta'sir qilmaydi
    const nextPositions = { ...state.positions };
    state.equipmentList.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        const uid = `${item.id}_${i}`;
        const pos = nextPositions[uid];
        if (pos && Array.isArray(pos) && pos.length >= 3) {
          const rotStep = ((state.rotations[uid] || 0) % 4 + 4) % 4;
          const isSwapped = rotStep === 1 || rotStep === 3;
          const effW = isSwapped ? (item.depth || 0.8) : (item.width || 1.0);
          const effD = isSwapped ? (item.width || 1.0) : (item.depth || 0.8);
          const hw = effW / 2;
          const hd = effD / 2;
          const clampedX = Math.max(-nextW / 2 + hw + margin, Math.min(nextW / 2 - hw - margin, pos[0]));
          const clampedZ = Math.max(-nextL / 2 + hd + margin, Math.min(nextL / 2 - hd - margin, pos[2]));
          nextPositions[uid] = [clampedX, pos[1] || 0, clampedZ];
        }
      }
    });

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
    const snapshot = { positions: state.positions, rotations: state.rotations };

    const nextEquipmentList = state.equipmentList.map(item => {
      if (item.id === id) {
        const oldCount = item.count;
        const newCount = Math.max(0, oldCount + change);

        if (newCount > oldCount) {
          // Yangi elementlarni mavjud elementlarga teginmasdan, bo'sh joyga joylashtirish
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
      positionHistory: [...state.positionHistory.slice(-49), snapshot],
      positionFuture: [],
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
    const snapshot = { positions: state.positions, rotations: state.rotations };

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
      positionHistory: [...state.positionHistory.slice(-49), snapshot],
      positionFuture: [],
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
    const state = get();
    const { roomDimensions, equipmentList, selectedCategory } = state;
    const { width: W, length: L } = roomDimensions;

    let activeEquipment = equipmentList.map(item => ({ ...item }));
    const totalCount = activeEquipment.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) {
      const presetMap = new Map((selectedCategory?.equipmentPresets?.standard || []).map(p => [p.id, p.count || 1]));
      activeEquipment = equipmentList.map(item => ({
        ...item,
        count: presetMap.get(item.id) || (presetMap.size === 0 ? 1 : 0)
      }));
      if (activeEquipment.reduce((s, it) => s + it.count, 0) === 0) {
        activeEquipment = equipmentList.map((item, idx) => ({ ...item, count: idx < 6 ? 1 : 0 }));
      }
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

    // ── Bounding box to'qnashuvini qat'iy nazorat qiluvchi reestr ──
    const placedBoxes = []; // { x, z, hw, hd }

    const isBoxOverlapping = (x, z, hw, hd, gap = 0.18) => {
      for (const b of placedBoxes) {
        if (
          Math.abs(x - b.x) < (hw + b.hw) + gap &&
          Math.abs(z - b.z) < (hd + b.hd) + gap
        ) {
          return true;
        }
      }
      return false;
    };

    const registerItem = (uid, x, z, rot, w, d) => {
      const rotStep = ((rot % 4) + 4) % 4;
      const isSwapped = rotStep === 1 || rotStep === 3;
      const effW = isSwapped ? d : w;
      const effD = isSwapped ? w : d;
      const hw = effW / 2;
      const hd = effD / 2;
      const margin = 0.12;

      const clampedX = Math.max(-W / 2 + hw + margin, Math.min(W / 2 - hw - margin, x));
      const clampedZ = Math.max(-L / 2 + hd + margin, Math.min(L / 2 - hd - margin, z));

      newPositions[uid] = [Number(clampedX.toFixed(3)), 0, Number(clampedZ.toFixed(3))];
      newRotations[uid] = rotStep;
      placedBoxes.push({ x: clampedX, z: clampedZ, hw, hd });
    };

    const findSafeSpot = (preferredX, preferredZ, rot, w, d) => {
      const rotStep = ((rot % 4) + 4) % 4;
      const isSwapped = rotStep === 1 || rotStep === 3;
      const effW = isSwapped ? d : w;
      const effD = isSwapped ? w : d;
      const hw = effW / 2;
      const hd = effD / 2;
      const margin = 0.14;

      const clampX = (val) => Math.max(-W / 2 + hw + margin, Math.min(W / 2 - hw - margin, val));
      const clampZ = (val) => Math.max(-L / 2 + hd + margin, Math.min(L / 2 - hd - margin, val));

      const px = clampX(preferredX);
      const pz = clampZ(preferredZ);

      // 1. Agar taklif qilingan joy to'liq bo'sh bo'lsa
      if (!isBoxOverlapping(px, pz, hw, hd)) {
        return { x: px, z: pz, rot: rotStep };
      }

      // 2. Spiral qidiruv: yaqin atrofidagi bo'sh nuqtalarni tekshirish
      const step = 0.35;
      for (let r = 1; r <= 18; r++) {
        const dist = r * step;
        const candidates = [
          [px + dist, pz], [px - dist, pz],
          [px, pz + dist], [px, pz - dist],
          [px + dist, pz + dist], [px - dist, pz + dist],
          [px + dist, pz - dist], [px - dist, pz - dist]
        ];
        for (const [cx, cz] of candidates) {
          const clampedCX = clampX(cx);
          const clampedCZ = clampZ(cz);
          if (!isBoxOverlapping(clampedCX, clampedCZ, hw, hd)) {
            return { x: clampedCX, z: clampedCZ, rot: rotStep };
          }
        }
      }

      // 3. Xona bo'ylab to'liq bo'sh joy qidirish
      let best = null;
      let maxDist = -1;
      for (let x = -W / 2 + hw + margin; x <= W / 2 - hw - margin; x += 0.35) {
        for (let z = -L / 2 + hd + margin; z <= L / 2 - hd - margin; z += 0.35) {
          if (!isBoxOverlapping(x, z, hw, hd)) {
            let minD = Infinity;
            for (const b of placedBoxes) {
              const dVal = Math.hypot(x - b.x, z - b.z);
              if (dVal < minD) minD = dVal;
            }
            if (minD > maxDist) {
              maxDist = minD;
              best = { x, z, rot: rotStep };
            }
          }
        }
      }

      if (best) return best;
      return { x: px, z: pz, rot: rotStep };
    };

    // ── Elementlarni turlariga ko'ra ajratamiz ──
    const counters = flatItems.filter(item => item.type === 'counter');
    const seatings = flatItems.filter(item => item.type === 'seating' || item.type === 'sofa');
    const wallsAndIslands = flatItems.filter(item => item.type !== 'counter' && item.type !== 'seating' && item.type !== 'sofa');

    // 1. Kassalarni (counter) joylashtiramiz — har doim old tomon (chiqish/kirish)
    counters.forEach((c, idx) => {
      const w = c.width || 1.8;
      const d = c.depth || 0.85;
      const totalW = counters.length * (w + 0.4);
      const startX = -totalW / 2 + w / 2;
      const candX = startX + idx * (w + 0.4);
      const candZ = L / 2 - d / 2 - 0.7;
      const safe = findSafeSpot(candX, candZ, 2, w, d);
      registerItem(c.uid, safe.x, safe.z, safe.rot, w, d);
    });

    // 2. Katta mebel / divan / o'rindiqlarni joylashtiramiz
    seatings.forEach((s, idx) => {
      const w = s.width || 1.8;
      const d = s.depth || 0.8;
      let candX, candZ, candRot;
      if (layoutType === 'corner') {
        candX = -W / 2 + d / 2 + 0.2;
        candZ = L / 2 - 2.2 - idx * (w + 0.5);
        candRot = 1;
      } else {
        candX = -W / 3 + idx * (w + 0.5);
        candZ = L / 2 - 2.0;
        candRot = 0;
      }
      const safe = findSafeSpot(candX, candZ, candRot, w, d);
      registerItem(s.uid, safe.x, safe.z, safe.rot, w, d);
    });

    // 3. Asosiy javonlar va orolchalarni shablon bo'yicha joylashtiramiz
    if (layoutType === 'linear') {
      let curBackX = -W / 2 + 1.2;
      let curLeftZ = -L / 2 + 1.2;
      let curRightZ = -L / 2 + 1.2;
      let centerIdx = 0;

      wallsAndIslands.forEach(item => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;
        let candX, candZ, candRot;

        if (curBackX + w / 2 <= W / 2 - 1.2) {
          candX = curBackX + w / 2;
          candZ = -L / 2 + d / 2 + 0.15;
          candRot = 0;
          curBackX += w + 0.35;
        } else if (curLeftZ + w / 2 <= L / 2 - 2.4) {
          candX = -W / 2 + d / 2 + 0.15;
          candZ = curLeftZ + w / 2;
          candRot = 1;
          curLeftZ += w + 0.35;
        } else if (curRightZ + w / 2 <= L / 2 - 2.4) {
          candX = W / 2 - d / 2 - 0.15;
          candZ = curRightZ + w / 2;
          candRot = 3;
          curRightZ += w + 0.35;
        } else {
          const cols = Math.max(1, Math.floor((W - 4.5) / (w + 1.4)));
          const col = centerIdx % cols;
          const row = Math.floor(centerIdx / cols);
          const startX = -((cols - 1) * (w + 1.4)) / 2;
          candX = startX + col * (w + 1.4);
          candZ = -L / 4 + row * (d + 1.6);
          candRot = 0;
          centerIdx++;
        }

        const safe = findSafeSpot(candX, candZ, candRot, w, d);
        registerItem(item.uid, safe.x, safe.z, safe.rot, w, d);
      });
    } else if (layoutType === 'island') {
      const centerCount = Math.ceil(wallsAndIslands.length * 0.55);
      const centerItems = wallsAndIslands.slice(0, centerCount);
      const wallItems = wallsAndIslands.slice(centerCount);

      const cols = Math.max(1, Math.floor((W - 4.5) / 2.5));
      centerItems.forEach((item, idx) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const startX = -((cols - 1) * 2.5) / 2;
        const candX = startX + col * 2.5;
        const candZ = -L / 4 + row * 2.4;
        const candRot = (row % 2 === 0) ? 0 : 2;
        const safe = findSafeSpot(candX, candZ, candRot, w, d);
        registerItem(item.uid, safe.x, safe.z, safe.rot, w, d);
      });

      let curBackX = -W / 2 + 1.2;
      let curLeftZ = -L / 2 + 1.2;
      wallItems.forEach((item, idx) => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;
        let candX, candZ, candRot;
        if (idx % 2 === 0 && curBackX + w / 2 <= W / 2 - 1.2) {
          candX = curBackX + w / 2;
          candZ = -L / 2 + d / 2 + 0.15;
          candRot = 0;
          curBackX += w + 0.35;
        } else if (curLeftZ + w / 2 <= L / 2 - 2.4) {
          candX = -W / 2 + d / 2 + 0.15;
          candZ = curLeftZ + w / 2;
          candRot = 1;
          curLeftZ += w + 0.35;
        } else {
          candX = W / 2 - d / 2 - 0.15;
          candZ = -L / 4 + (idx % 3) * (w + 0.4);
          candRot = 3;
        }
        const safe = findSafeSpot(candX, candZ, candRot, w, d);
        registerItem(item.uid, safe.x, safe.z, safe.rot, w, d);
      });
    } else if (layoutType === 'ushape' || layoutType === 'perimeter') {
      let curLeftZ = -L / 2 + 1.2;
      let curBackX = -W / 2 + 1.2;
      let curRightZ = -L / 2 + 1.2;
      let centerCount = 0;

      wallsAndIslands.forEach(item => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;
        let candX, candZ, candRot;

        if (curLeftZ + w / 2 <= L / 2 - 2.4) {
          candX = -W / 2 + d / 2 + 0.15;
          candZ = curLeftZ + w / 2;
          candRot = 1;
          curLeftZ += w + 0.35;
        } else if (curBackX + w / 2 <= W / 2 - 1.2) {
          candX = curBackX + w / 2;
          candZ = -L / 2 + d / 2 + 0.15;
          candRot = 0;
          curBackX += w + 0.35;
        } else if (curRightZ + w / 2 <= L / 2 - 2.4) {
          candX = W / 2 - d / 2 - 0.15;
          candZ = curRightZ + w / 2;
          candRot = 3;
          curRightZ += w + 0.35;
        } else {
          candX = 0;
          candZ = -L / 4 + centerCount * (d + 1.6);
          candRot = 0;
          centerCount++;
        }

        const safe = findSafeSpot(candX, candZ, candRot, w, d);
        registerItem(item.uid, safe.x, safe.z, safe.rot, w, d);
      });
    } else if (layoutType === 'corner') {
      let curBackX = -W / 2 + 1.2;
      let curLeftZ = -L / 2 + 1.2;
      let openIdx = 0;

      wallsAndIslands.forEach(item => {
        const w = item.width || 1.2;
        const d = item.depth || 0.6;
        let candX, candZ, candRot;

        if (curBackX + w / 2 <= W / 2 - 1.2) {
          candX = curBackX + w / 2;
          candZ = -L / 2 + d / 2 + 0.15;
          candRot = 0;
          curBackX += w + 0.35;
        } else if (curLeftZ + w / 2 <= L / 2 - 2.4) {
          candX = -W / 2 + d / 2 + 0.15;
          candZ = curLeftZ + w / 2;
          candRot = 1;
          curLeftZ += w + 0.35;
        } else {
          candX = 0.5;
          candZ = -L / 4 + openIdx * (d + 1.6);
          candRot = 0;
          openIdx++;
        }

        const safe = findSafeSpot(candX, candZ, candRot, w, d);
        registerItem(item.uid, safe.x, safe.z, safe.rot, w, d);
      });
    }

    set((s) => ({
      positionHistory: [...s.positionHistory.slice(-49), { positions: s.positions, rotations: s.rotations }],
      positionFuture: [],
      equipmentList: activeEquipment,
      positions: newPositions,
      rotations: newRotations,
      lastInteractedUid: flatItems.length > 0 ? flatItems[0].uid : null
    }));
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
      hasSelectedCategory: true,
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
      hasSelectedCategory: true,
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