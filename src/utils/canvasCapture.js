import { useAppStore } from '../store/useAppStore';

const VIEWPORT_SELECTOR = '#room-canvas-viewport canvas';
const RENDER_WAIT_MS = 350;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function captureViewportScreenshot() {
  const canvas = document.querySelector(VIEWPORT_SELECTOR);
  if (!canvas) return null;
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

/**
 * 3D va 2D ko'rinish screenshot'larini ketma-ket oladi.
 *
 * MUHIM: bu funksiya endi global `viewMode` state'ini o'zgartirmaydi —
 * kamerani to'g'ridan-to'g'ri (imperativ) `cameraApi` orqali boshqaradi.
 * Shu tufayli:
 *  - Birinchi (3D) screenshot foydalanuvchi hozir qanday burchakda
 *    o'tirgan bo'lsa, aynan o'sha holatda olinadi (hech narsa ko'chmaydi).
 *  - Ikkinchi (2D) screenshot uchun kamera vaqtincha haqiqiy tepadan
 *    ko'rinishga olib boriladi.
 *  - Eksport tugagach, kamera aniq oldingi joyiga (pozitsiya + target)
 *    qaytariladi — foydalanuvchi hech qanday sakrashni sezmaydi.
 */
export async function captureRoomScreenshots() {
  const { cameraApi } = useAppStore.getState();

  // Fallback: agar biror sababdan cameraApi hali ulanmagan bo'lsa,
  // faqat joriy ko'rinishning bitta screenshot'ini qaytaramiz.
  if (!cameraApi?.camera || !cameraApi?.controls) {
    await wait(100);
    const only = captureViewportScreenshot();
    return { screenshot3d: only, screenshot2d: null };
  }

  const { camera, controls } = cameraApi;

  // 1) Joriy holatni ("3D") — hech narsani o'zgartirmasdan darhol olamiz
  await wait(80);
  const screenshot3d = captureViewportScreenshot();

  // Qaytarish uchun aniq joriy pozitsiya/target saqlab qo'yamiz
  const savedPosition = camera.position.clone();
  const savedTarget = controls.target.clone();

  // 2) Kamerani haqiqiy tepadan ko'rinishga olib boramiz
  camera.position.set(0, 25, 0.01);
  controls.target.set(0, 1, 0);
  camera.lookAt(0, 1, 0);
  camera.updateProjectionMatrix();
  controls.update();

  await wait(RENDER_WAIT_MS);
  const screenshot2d = captureViewportScreenshot();

  // 3) Kamerani AYNAN oldingi holatiga qaytaramiz
  camera.position.copy(savedPosition);
  controls.target.copy(savedTarget);
  camera.updateProjectionMatrix();
  controls.update();

  await wait(80);

  return { screenshot3d, screenshot2d };
}