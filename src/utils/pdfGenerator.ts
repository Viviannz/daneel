import jsPDF from 'jspdf';
import type { PrescriptionEntry, AuditReport, Medication } from '../types/prescription';

export function generateAuditReport(
  prescriptions: Map<number, PrescriptionEntry>
): AuditReport {
  const entries = Array.from(prescriptions.values());

  // Calculate medication counts
  const medicationCounts: Record<Medication, number> = {
    Amoxicillin: 0,
    Metronidazole: 0,
    Dihydrocodeine: 0,
    Duraphat: 0,
  };

  // Calculate daily breakdown
  const dailyBreakdown: Record<string, number> = {};

  entries.forEach((entry) => {
    medicationCounts[entry.medication]++;

    if (!dailyBreakdown[entry.date]) {
      dailyBreakdown[entry.date] = 0;
    }
    dailyBreakdown[entry.date]++;
  });

  return {
    totalPrescriptions: entries.length,
    medicationCounts,
    dailyBreakdown,
    prescriptions: entries.sort((a, b) => a.prescriptionNumber - b.prescriptionNumber),
  };
}

export function generatePDF(
  padNumber: number,
  prescriptions: Map<number, PrescriptionEntry>,
  practitionerName: string
): Blob {
  const doc = new jsPDF();
  const audit = generateAuditReport(prescriptions);

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 141); // NHS Blue
  doc.text('NHS Dental Prescription Report', 15, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Prescription Pad #${padNumber}`, 15, 30);
  doc.text(`Practitioner: ${practitionerName}`, 15, 37);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB')}`,
    15,
    44
  );

  // Audit Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 141);
  doc.text('Audit Summary', 15, 60);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  let yPos = 70;
  doc.text(`Total Prescriptions: ${audit.totalPrescriptions}`, 20, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.text('Medication Breakdown:', 20, yPos);

  doc.setFontSize(10);
  yPos += 7;
  Object.entries(audit.medicationCounts).forEach(([medication, count]) => {
    if (count > 0) {
      const percentage = ((count / audit.totalPrescriptions) * 100).toFixed(1);
      doc.text(`  • ${medication}: ${count} (${percentage}%)`, 25, yPos);
      yPos += 6;
    }
  });

  yPos += 5;
  doc.setFontSize(12);
  doc.text('Daily Breakdown:', 20, yPos);

  doc.setFontSize(10);
  yPos += 7;
  const sortedDates = Object.keys(audit.dailyBreakdown).sort();
  sortedDates.forEach((date) => {
    const count = audit.dailyBreakdown[date];
    const formattedDate = new Date(date).toLocaleDateString('en-GB');
    doc.text(`  • ${formattedDate}: ${count} prescriptions`, 25, yPos);
    yPos += 6;
  });

  // Prescription Details
  yPos += 10;
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 51, 141);
  doc.text('Prescription Details', 15, yPos);

  yPos += 10;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.text('#', 15, yPos);
  doc.text('Date', 25, yPos);
  doc.text('Serial Number', 50, yPos);
  doc.text('Medication', 85, yPos);
  doc.text('Patient', 120, yPos);
  doc.text('Surgery', 145, yPos);
  doc.text('Pract.', 170, yPos);

  yPos += 5;
  doc.setFont('helvetica', 'normal');

  audit.prescriptions.forEach((prescription) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
      // Repeat header on new page
      doc.setFont('helvetica', 'bold');
      doc.text('#', 15, yPos);
      doc.text('Date', 25, yPos);
      doc.text('Serial Number', 50, yPos);
      doc.text('Medication', 85, yPos);
      doc.text('Patient', 120, yPos);
      doc.text('Surgery', 145, yPos);
      doc.text('Pract.', 170, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
    }

    const formattedDate = new Date(prescription.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

    doc.text(prescription.prescriptionNumber.toString(), 15, yPos);
    doc.text(formattedDate, 25, yPos);
    doc.text(prescription.serialNumber, 50, yPos);
    doc.text(prescription.medication, 85, yPos);
    doc.text(prescription.patientInitials, 120, yPos);
    doc.text(prescription.surgeryNumber, 145, yPos);
    doc.text(prescription.practitionerInitials, 170, yPos);

    yPos += 5;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
