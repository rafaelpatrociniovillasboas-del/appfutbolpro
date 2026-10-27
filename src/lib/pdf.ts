import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logger } from './logger';
import { LOGO_BASE64 } from './logoData';
import { getSettings } from './settingsStore';
import { isActiveStatus } from './athleteStore';

// Finance statuses are stored in Portuguese ('Pago', 'Pendente'); PDFs are read by Spanish-speaking parents
function financeStatusLabel(status?: string): string {
  if (status === 'Pago' || status === 'Pagado') return 'Pagado';
  if (status === 'Atrasado') return 'Atrasado';
  return 'Pendiente';
}

// Configuración estándar
function createPDF(title: string) {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  // Header
  doc.setFillColor(5, 10, 7); // zinc-950
  doc.rect(0, 0, 210, 30, 'F');
  
  if (LOGO_BASE64) {
    try {
      doc.addImage(LOGO_BASE64, 'PNG', 12, 4, 22, 22);
    } catch (e) {
      logger.error('system', 'Error rendering logo in PDF', e);
    }
  }

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FútbolPro', 38, 20);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 195, 20, { align: 'right' });
  
  return doc;
}

export function generateDrillPDF(drill: any) {
  const doc = createPDF('Informe de Entrenamiento');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(drill.title || 'Ejercicio Sin Nombre', 15, 45);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Duración: ${drill.durationMinutes || drill.duration || 'N/A'} min`, 15, 55);
  doc.text(`Dificultad: ${drill.difficulty || drill.intensity || 'N/A'}`, 80, 55);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Objetivos y Descripción:', 15, 70);
  doc.setFont('helvetica', 'normal');
  const splitObj = doc.splitTextToSize(drill.description || '', 180);
  doc.text(splitObj, 15, 78);
  
  let startY = 80 + (splitObj.length * 6) + 10;
  
  if (drill.setup && drill.setup.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Organización / Material:', 15, startY);
    doc.setFont('helvetica', 'normal');
    drill.setup.forEach((s: string, i: number) => {
      doc.text(`\u2022 ${s}`, 20, startY + 8 + (i * 6));
    });
    startY += 15 + (drill.setup.length * 6);
  }

  const stepsList = drill.instructions || drill.steps || [];
  if (stepsList && stepsList.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Ejecución paso a paso:', 15, startY);
    doc.setFont('helvetica', 'normal');
    stepsList.forEach((s: string, i: number) => {
      const splitStep = doc.splitTextToSize(`${i+1}. ${s}`, 175);
      doc.text(splitStep, 15, startY + 8);
      startY += 4 + (splitStep.length * 6);
    });
  }

  if (drill.coachingPoints && drill.coachingPoints.length > 0) {
    startY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('Puntos Clave de Corrección:', 15, startY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    drill.coachingPoints.forEach((s: string, i: number) => {
      doc.text(`\u2022 ${s}`, 20, startY + 8 + (i * 6));
    });
  }

  doc.save(`Ejercicio_${(drill.title || 'drill').replace(/\s+/g, '_')}.pdf`);
}

export function generateFinancePDF(transactions: any[], totalBalance: number) {
  const doc = createPDF('Informe Financiero');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const currencyCode = getSettings().currencyCode;
  doc.text(`Saldo Total: ${currencyCode} ${totalBalance.toFixed(2)}`, 15, 45);
  
  const tableData = transactions.map(t => [
    t.date,
    t.desc,
    t.type === 'in' ? 'Ingreso' : 'Gasto',
    `${currencyCode} ${Math.abs(t.amount).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Fecha', 'Descripción', 'Tipo', 'Monto']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 10, 7], textColor: [255,255,255] },
    columnStyles: {
      0: { cellWidth: 30 },
      2: { cellWidth: 30, textColor: [0, 0, 0] },
      3: { cellWidth: 35, halign: 'right' },
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 2) {
         if (data.cell.raw === 'Ingreso' || data.cell.raw === 'Receita') {
            data.cell.styles.textColor = [16, 185, 129]; // emerald-500
         } else {
            data.cell.styles.textColor = [244, 63, 94]; // rose-500
         }
      }
    }
  });

  doc.save(`Informe_Financiero.pdf`);
}

export function generateSessionPDF(sessionData: any[], metadata?: { title: string; category: string; duration: string }) {
  const doc = createPDF('Planificación de Sesión');
  
  const title = metadata?.title || 'Planificación de Sesión de Entrenamiento';
  const category = metadata?.category || 'Sub-15';
  const duration = metadata?.duration || '90 minutos';
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  
  const splitTitle = doc.splitTextToSize(title, 180);
  doc.text(splitTitle, 15, 45);
  
  let startY = 45 + (splitTitle.length * 6);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 15, startY);
  doc.text(`Categoría: ${category}`, 75, startY);
  doc.text(`Duración Total: ${duration}`, 135, startY);

  const tableData = sessionData.map((part, index) => {
    const drillDuration = part.durationMinutes ? `${part.durationMinutes} min` : (part.duration || 'N/A');
    const desc = part.description || part.desc || 'Sin descripción adicional.';
    return [
      `${index + 1}`,
      part.type || 'N/A',
      part.title || 'N/A',
      drillDuration,
      desc
    ];
  });
  
  autoTable(doc, {
    startY: startY + 6,
    head: [['#', 'Tipo', 'Ejercicio (Título)', 'Duración', 'Descripción / Enfoque']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 10, 7], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 45, fontStyle: 'bold' },
      3: { cellWidth: 20 },
      4: { cellWidth: 90 }
    },
    styles: { overflow: 'linebreak', fontSize: 9 }
  });

  const sanitizedTitle = title.replace(/\s+/g, '_').substring(0, 30);
  doc.save(`Sesion_${sanitizedTitle}.pdf`);
}

function getCircularImageDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        // Circular clip
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate aspect ratio cover
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function generateAthleteReportPDF(athlete: any) {
  const doc = createPDF('Ficha Individual del Jugador');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ficha Técnica: ${athlete.name}`, 15, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Categoría: ${athlete.category}`, 15, 52);
  doc.text(`Posición: ${athlete.position}`, 80, 52);
  doc.text(`Nacimiento: ${athlete.birthDate ? athlete.birthDate.split('-').reverse().join('/') : 'No registrado'}`, 15, 58);
  doc.text(`Contacto: ${athlete.phone || 'N/A'}`, 100, 58);

  if (athlete.photo) {
    try {
      const circularPhoto = await getCircularImageDataUrl(athlete.photo);
      // Photo is 28x28 starting at X=165, Y=34 (Center: X=179, Y=48, Radius=14)
      doc.addImage(circularPhoto, 'PNG', 165, 34, 28, 28);

      // Elegant emerald border ring
      doc.setDrawColor(16, 185, 129); // emerald-500
      doc.setLineWidth(1);
      doc.circle(179, 48, 14, 'S');

      // Subtle outer accent ring
      doc.setDrawColor(209, 250, 229); // emerald-100
      doc.setLineWidth(0.4);
      doc.circle(179, 48, 14.8, 'S');
    } catch {
      try {
        doc.addImage(athlete.photo, 'PNG', 165, 34, 28, 28);
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(1);
        doc.circle(179, 48, 14, 'S');
      } catch (e) {
        logger.error('system', 'Error rendering athlete photo in PDF', e);
      }
    }
  }

  // Stats table
  const ratings = athlete.ratings || { speed: 70, passing: 70, shooting: 70, agility: 70, tactics: 70, tackling: 70 };
  const avg = ((ratings.speed + ratings.passing + ratings.shooting + ratings.agility + ratings.tactics + ratings.tackling) / 6).toFixed(1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Evaluación de Competencias Técnicas y Físicas (0-100)', 15, 66);
  
  autoTable(doc, {
    startY: 72,
    head: [['Atributo', 'Puntuación', 'Promedio de Referencia']],
    body: [
      ['Velocidad y Aceleración', `${ratings.speed}`, '75'],
      ['Pase y Control', `${ratings.passing}`, '75'],
      ['Finalización (Tiro / Cabeceo)', `${ratings.shooting}`, '75'],
      ['Agilidad y Coordinación', `${ratings.agility}`, '75'],
      ['Posicionamiento Táctico', `${ratings.tactics}`, '75'],
      ['Recuperación y Marcaje', `${ratings.tackling}`, '75'],
      ['PROMEDIO GLOBAL', `${avg}`, '75']
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 10, 7] },
    columnStyles: {
      1: { fontStyle: 'bold' }
    }
  });

  let startY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 12 : 155;

  // Highlights
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Análisis de Rendimiento y Desarrollo', 15, startY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`Mayor Evolución (+${athlete.evolution || 0}%):`, 15, startY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const splitEvol = doc.splitTextToSize(athlete.evolutionComment || 'Progreso constante en el desarrollo general.', 180);
  doc.text(splitEvol, 15, startY + 14);

  startY += 16 + (splitEvol.length * 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(244, 63, 94); // rose
  doc.text('Punto de Atención / Siguiente Acción:', 15, startY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const splitAtten = doc.splitTextToSize(athlete.attenComment || 'Mantener el enfoque en la planificación deportiva.', 180);
  doc.text(splitAtten, 15, startY + 6);

  // Footer / Status
  startY += 15 + (splitAtten.length * 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Estado de Registro: ${!athlete.status || isActiveStatus(athlete.status) ? 'Activo' : 'Inactivo'}`, 15, startY);
  
  const currencyCode = getSettings().currencyCode;
  const finance = athlete.finance || { status: 'Pagado', amount: `${currencyCode} 150.00` };
  doc.text(`Cuota Mensual: ${financeStatusLabel(finance.status)} (${finance.amount})`, 100, startY);

  doc.save(`Ficha_${athlete.name.replace(/\s+/g, '_')}.pdf`);
}

export function generateCategoryAttendancePDF(category: string, athletes: any[]) {
  const doc = createPDF('Asistencia de Jugadores');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Informe de Asistencia Mensual - Categoría: ${category}`, 15, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 15, 52);

  const tableData = athletes.map(a => {
    const history = a.presenceHistory || [];
    const total = history.length;
    const presents = history.filter((h: any) => h.present).length;
    const absents = total - presents;
    const percentage = total > 0 ? `${Math.round((presents / total) * 100)}%` : '100%';
    
    return [
      a.name,
      a.position,
      `${presents} sesiones`,
      `${absents} faltas`,
      percentage
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [['Jugador', 'Posición', 'Asistencias', 'Faltas', 'Rendimiento %']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 10, 7] }
  });

  doc.save(`Asistencia_${category.replace(/\s+/g, '_')}.pdf`);
}

export function generateCategoryEvolutionPDF(category: string, athletes: any[]) {
  const doc = createPDF('Evolución Técnica General');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Métricas de Evolución Técnica - Categoría: ${category}`, 15, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Análisis de Competencias y Rendimiento de la Plantilla`, 15, 52);

  const tableData = athletes.map(a => {
    const ratings = a.ratings || { speed: 70, passing: 70, shooting: 70, agility: 70, tactics: 70, tackling: 70 };
    const avg = ((ratings.speed + ratings.passing + ratings.shooting + ratings.agility + ratings.tactics + ratings.tackling) / 6).toFixed(1);
    
    return [
      a.name,
      `${ratings.speed}`,
      `${ratings.passing}`,
      `${ratings.shooting}`,
      `${ratings.agility}`,
      `${ratings.tactics}`,
      `${ratings.tackling}`,
      `${avg}`
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [['Jugador', 'Velocidad', 'Pase', 'Tiro', 'Agilidad', 'Táctica', 'Recuperación', 'Promedio']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 10, 7] },
    columnStyles: {
      7: { fontStyle: 'bold' }
    }
  });

  doc.save(`Evolucion_Plantilla_${category.replace(/\s+/g, '_')}.pdf`);
}

export function generateCategoryBillingPDF(category: string, athletes: any[]) {
  const doc = createPDF('Informe de Cobros y Cuotas');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Informe de Pagos CRM - Categoría: ${category}`, 15, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Estado consolidado de cuotas mensuales`, 15, 52);

  const currencyCode = getSettings().currencyCode;
  const tableData = athletes.map(a => {
    const finance = a.finance || { responsible: 'N/A', dueDate: '10/06/2026', amount: `${currencyCode} 150.00`, status: 'Pagado' };
    return [
      a.name,
      finance.responsible,
      finance.dueDate,
      finance.amount,
      financeStatusLabel(finance.status)
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [['Jugador', 'Tutor / Responsable', 'Vencimiento', 'Monto Cuota', 'Estado de Pago']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [5, 10, 7] },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Atrasado' || data.cell.raw === 'Pendiente') {
          data.cell.styles.textColor = [244, 63, 94]; // rose-500
        } else if (data.cell.raw === 'Pagado' || data.cell.raw === 'Pago') {
          data.cell.styles.textColor = [16, 185, 129]; // emerald-500
        } else {
          data.cell.styles.textColor = [245, 158, 11]; // amber-500
        }
      }
    }
  });

  doc.save(`Financiero_CRM_${category.replace(/\s+/g, '_')}.pdf`);
}
