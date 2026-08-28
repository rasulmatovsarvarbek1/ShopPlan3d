import { jsPDF } from 'jspdf';

function sanitizeFilename(name) {
  return (name || 'loyiha')
    .replace(/[^\w\s\-]/gi, '')
    .replace(/\s+/g, '_')
    .slice(0, 60) || 'loyiha';
}

function formatDate() {
  return new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function addImageFit(doc, dataUrl, x, y, maxW, maxH) {
  if (!dataUrl) return y;
  try {
    const props = doc.getImageProperties(dataUrl);
    const ratio = Math.min(maxW / props.width, maxH / props.height);
    const w = props.width * ratio;
    const h = props.height * ratio;
    doc.addImage(dataUrl, 'PNG', x + (maxW - w) / 2, y, w, h);
    return y + h + 6;
  } catch {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Rasm yuklanmadi', x, y + 10);
    doc.setTextColor(0, 0, 0);
    return y + 16;
  }
}

function ensureSpace(doc, y, needed, margin) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}

/**
 * @param {object} params
 */
export async function generateSmetaPdf({
  projectName,
  categoryName,
  currency,
  formatPrice,
  equipmentList,
  customLights = [],
  equipmentTotal,
  inventoryTotal,
  renovationTotal,
  grandTotal,
  autoFillInventory,
  area,
  screenshot3d,
  screenshot2d,
  roomDimensions,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Sarlavha ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text('ShopPlan — Biznes Smetasi', margin, y);
  y += 9;

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(projectName || 'Nomsiz loyiha', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Biznes turi: ${categoryName}`, margin, y);
  y += 5;
  doc.text(`Sana: ${formatDate()}`, margin, y);
  y += 5;
  doc.text(
    `Xona: ${roomDimensions.width}m × ${roomDimensions.length}m × ${roomDimensions.height}m (${area} m²)`,
    margin,
    y
  );
  y += 8;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── 3D screenshot ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3D Ko\'rinish', margin, y);
  y += 4;
  y = addImageFit(doc, screenshot3d, margin, y, contentW, 55);
  y += 4;

  // ── 2D screenshot ──
  y = ensureSpace(doc, y, 65, margin);
  doc.setFont('helvetica', 'bold');
  doc.text('2D Tepadan Ko\'rinish', margin, y);
  y += 4;
  y = addImageFit(doc, screenshot2d, margin, y, contentW, 50);
  y += 6;

  // ── Jihozlar jadvali ──
  y = ensureSpace(doc, y, 30, margin);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Jihozlar Ro\'yxati', margin, y);
  y += 6;

  const colX = [margin, margin + 72, margin + 88, margin + 118, margin + 148];
  doc.setFontSize(8);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 4, contentW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Nomi', colX[0], y);
  doc.text('Soni', colX[1], y);
  doc.text('Dona narxi', colX[2], y);
  doc.text('Jami', colX[3], y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  const rows = equipmentList.filter((item) => item.count > 0);

  if (customLights?.length) {
    customLights.forEach((light, i) => {
      y = ensureSpace(doc, y, 8, margin);
      const price = light.unitPrice || 120;
      doc.text(`Yoritgich #${i + 1}`, colX[0], y);
      doc.text('1', colX[1], y);
      doc.text(formatPrice(price), colX[2], y);
      doc.text(formatPrice(price), colX[3], y);
      y += 5;
    });
  }

  if (rows.length === 0 && !customLights?.length) {
    doc.setTextColor(148, 163, 184);
    doc.text('Jihozlar qo\'shilmagan', margin, y);
    y += 6;
  } else {
    rows.forEach((item) => {
      y = ensureSpace(doc, y, 8, margin);
      const lineTotal = item.unitPrice * item.count;
      const name = item.name.length > 32 ? item.name.slice(0, 30) + '…' : item.name;
      doc.setTextColor(15, 23, 42);
      doc.text(name, colX[0], y);
      doc.text(String(item.count), colX[1], y);
      doc.text(formatPrice(item.unitPrice), colX[2], y);
      doc.text(formatPrice(lineTotal), colX[3], y);
      y += 5;
    });
  }

  y += 4;

  // ── Xarajatlar breakdown ──
  y = ensureSpace(doc, y, 40, margin);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Xarajatlar Tahlili', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const breakdown = [
    ['1. Jihozlar', formatPrice(equipmentTotal)],
    [
      '2. Tovar zaxirasi',
      autoFillInventory ? formatPrice(inventoryTotal) : 'O\'chirilgan',
    ],
    ['3. Ta\'mirlash va yoritish', formatPrice(renovationTotal)],
  ];

  breakdown.forEach(([label, value]) => {
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, pageW - margin, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  y += 4;
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, y - 2, contentW, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('UMUMIY SMETA', margin + 4, y + 5);
  doc.setFontSize(14);
  doc.text(formatPrice(grandTotal), pageW - margin - 4, y + 10, { align: 'right' });
  y += 22;

  // ── Footer ──
  y = ensureSpace(doc, y, 15, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `ShopPlan orqali yaratilgan • ${formatDate()} • Valyuta: ${currency}`,
    pageW / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${sanitizeFilename(projectName)}_smeta_${dateStr}.pdf`;
  doc.save(filename);
}
