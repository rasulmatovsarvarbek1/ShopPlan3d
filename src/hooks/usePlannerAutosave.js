import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { debounce } from '../utils/debounce';
import { pickAutosaveState, writeAutosaveDraft } from '../utils/autosaveStorage';

const DEBOUNCE_MS = 2500;        // sokinlikdan (yozishni to'xtatgandan) keyin saqlanadi
const TOAST_MIN_GAP_MS = 6000;   // "Saqlandi" belgisi bundan tezroq qayta chiqmaydi

/**
 * PlannerPage ichida ishlatiladi — faqat planner sahifasida autosave yoqiladi.
 *
 * MUHIM: Ma'lumot har doim saqlanadi (hech narsa yo'qolmaydi), lekin
 * "Saqlandi" bildirishnomasi (toast) formaga yozayotganda har bir maydon/
 * harf uchun emas, balki eng ko'pi bilan TOAST_MIN_GAP_MS oralig'ida bir
 * marta ko'rsatiladi — shu bilan yozish paytida ortiqcha chalg'itmaydi.
 */
export function usePlannerAutosave() {
  const debouncedSaveRef = useRef(null);
  const lastToastAtRef = useRef(0);

  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      const state = useAppStore.getState();
      const savedAt = writeAutosaveDraft(pickAutosaveState(state));
      state.setLastAutosaveAt(savedAt);

      const now = Date.now();
      if (now - lastToastAtRef.current >= TOAST_MIN_GAP_MS) {
        lastToastAtRef.current = now;
        state.flashAutosaveSaved();
      }
    }, DEBOUNCE_MS);

    const unsubscribe = useAppStore.subscribe((state, prev) => {
      const watched = [
        'equipmentList', 'positions', 'rotations', 'roomDimensions',
        'customLights', 'monthlyExpenses', 'expectedMonthlyRevenue',
        'autoFillInventory', 'userBudget',
      ];
      const changed = watched.some((key) => state[key] !== prev[key]);
      if (changed) {
        debouncedSaveRef.current?.();
      }
    });

    return () => {
      debouncedSaveRef.current?.cancel?.();
      unsubscribe();
    };
  }, []);
}