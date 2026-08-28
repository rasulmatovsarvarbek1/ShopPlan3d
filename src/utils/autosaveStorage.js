export const AUTOSAVE_KEY = 'shopplan_autosave_draft';

export function readAutosaveDraft() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || !parsed?.state) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAutosaveDraft(state) {
  const payload = {
    savedAt: new Date().toISOString(),
    state,
  };
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
  return payload.savedAt;
}

export function clearAutosaveDraft() {
  localStorage.removeItem(AUTOSAVE_KEY);
}

export function formatDraftAge(savedAt) {
  const diffMs = Date.now() - new Date(savedAt).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'hozirgina';
  if (mins === 1) return '1 daqiqa oldin';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 soat oldin';
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 kun oldin' : `${days} kun oldin`;
}

/** Planner autosave uchun saqlanadigan maydonlar */
export function pickAutosaveState(store) {
  return {
    selectedCategoryId: store.selectedCategory?.id,
    roomDimensions: store.roomDimensions,
    equipmentList: store.equipmentList,
    positions: store.positions,
    rotations: store.rotations,
    customLights: store.customLights,
    autoFillInventory: store.autoFillInventory,
    userBudget: store.userBudget,
    monthlyExpenses: store.monthlyExpenses,
    expectedMonthlyRevenue: store.expectedMonthlyRevenue,
  };
}
