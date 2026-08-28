import React, { useState } from 'react';
import { useAppStore, UZS_RATE } from '../../store/useAppStore';
import { captureRoomScreenshots } from '../../utils/canvasCapture';
import { generateSmetaPdf } from '../../utils/generateSmetaPdf';
import { Download, Loader2 } from 'lucide-react';

export const PdfExportButton = ({
  projectName,
  area,
  equipmentTotal,
  inventoryTotal,
  renovationTotal,
  grandTotal,
  autoFillInventory,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const {
    selectedCategory,
    equipmentList,
    customLights,
    roomDimensions,
    currency,
  } = useAppStore();

  const formatPrice = (usd) => {
    if (currency === 'UZS') {
      return (usd * UZS_RATE).toLocaleString('uz-UZ') + " So'm";
    }
    return '$' + usd.toLocaleString('en-US');
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      // Endi kamera to'g'ridan-to'g'ri (cameraApi orqali) boshqariladi —
      // viewMode global state'ini o'zgartirish shart emas.
      const { screenshot3d, screenshot2d } = await captureRoomScreenshots();

      await generateSmetaPdf({
        projectName: projectName || `${selectedCategory.name} (${area} m²)`,
        categoryName: selectedCategory.name,
        currency,
        formatPrice,
        equipmentList,
        customLights,
        equipmentTotal,
        inventoryTotal,
        renovationTotal,
        grandTotal,
        autoFillInventory,
        area,
        screenshot3d,
        screenshot2d,
        roomDimensions,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF yaratishda xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="btn-primary"
      style={{
        justifyContent: 'center',
        width: '100%',
        padding: '12px',
        opacity: isExporting ? 0.75 : 1,
        cursor: isExporting ? 'wait' : 'pointer',
      }}
      onClick={handlePdfExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          PDF yaratilmoqda...
        </>
      ) : (
        <>
          <Download size={16} />
          PDF Yuklab Olish
        </>
      )}
    </button>
  );
};