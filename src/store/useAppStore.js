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

  selectCategory: (category) => {
    const defaultTier = 'standard';
    const initialEquipment = category.equipmentPresets[defaultTier].map(item => ({ ...item }));
    set({
      selectedCategory: category,
      activeTier: defaultTier,
      roomDimensions: { ...category.defaultDimensions },
      userBudget: category.defaultBudget,
      equipmentList: initialEquipment,
      activePage: 'planner',
    });
  },

  setActiveTier: (tier) => {
    const { selectedCategory } = get();
    if (selectedCategory && selectedCategory.equipmentPresets[tier]) {
      const newEquipment = selectedCategory.equipmentPresets[tier].map(item => ({ ...item }));
      set({
        activeTier: tier,
        equipmentList: newEquipment
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
