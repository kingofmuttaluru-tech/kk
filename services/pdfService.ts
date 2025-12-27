
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestResult, TestParameter } from '../types';

export const generatePDFReport = (result: TestResult) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header - Modern Laboratory Letterhead
  doc.setFillColor(30, 58, 138); 
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // White accent bar
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 45, pageWidth, 2, 'F');
  
  // Logo / Branding (Apollo Style)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI VENKATESWAR', 15, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('DIGITAL X-RAY & CLINICAL LABORATORY', 15, 25);
  
  doc.setFontSize(7);
  doc.text('An ISO 9001:2015 Certified Diagnostic Center', 15, 30);
  doc.text('T.B. Road, Allagadda, Nandyal (Dist), AP - 518543', 15, 34);

  // NABL Badge Area
  doc.setFillColor(255, 255, 255);
  doc.rect(pageWidth - 55, 8, 40, 30, 'F');
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - 55, 8, 40, 30, 'S');
  
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NABL', pageWidth - 35, 18, { align: 'center' });
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('ACCREDITED LABORATORY', pageWidth - 35, 22, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('MC-1234', pageWidth - 35, 30, { align: 'center' });

  // Patient Info Header Bar
  doc.setFillColor(248, 250, 252);
  doc.rect(10, 52, pageWidth - 20, 30, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(10, 52, pageWidth - 20, 30, 'S');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  
  // Column 1
  doc.setFont('helvetica', 'bold'); doc.text('Patient Name', 15, 60);
  doc.setTextColor(0, 0, 0); doc.setFontSize(10); doc.text(`: ${result.patientName.toUpperCase()}`, 40, 60);
  
  doc.setTextColor(51, 65, 85); doc.setFontSize(8); doc.text('Age / Gender', 15, 67);
  doc.setTextColor(0, 0, 0); doc.setFontSize(9); doc.text(`: ${result.age || '---'} / ${result.gender}`, 40, 67);

  doc.setTextColor(51, 65, 85); doc.setFontSize(8); doc.text('Ref. By', 15, 74);
  doc.setTextColor(0, 0, 0); doc.setFontSize(9); doc.text(`: ${result.refDoctor}`, 40, 74);

  // Column 2
  doc.setTextColor(51, 65, 85); doc.setFontSize(8); doc.text('Registered On', 110, 60);
  doc.setTextColor(0, 0, 0); doc.text(`: ${new Date(result.collectedAt).toLocaleString()}`, 140, 60);

  doc.setTextColor(51, 65, 85); doc.setFontSize(8); doc.text('Collected On', 110, 67);
  doc.setTextColor(0, 0, 0); doc.text(`: ${new Date(result.collectedAt).toLocaleString()}`, 140, 67);

  doc.setTextColor(51, 65, 85); doc.setFontSize(8); doc.text('Reported On', 110, 74);
  doc.setTextColor(0, 0, 0); doc.text(`: ${new Date().toLocaleString()}`, 140, 74);

  // Report Title Bar
  doc.setFillColor(30, 58, 138);
  doc.rect(10, 88, pageWidth - 20, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTMENT OF ' + (result.testName.includes('Blood') ? 'HEMATOLOGY' : 'BIOCHEMISTRY'), pageWidth / 2, 93.5, { align: 'center' });

  // Main Test Header
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(result.testName.toUpperCase(), 15, 104);

  // Table Data Preparation
  const tableData: any[] = [];
  let currentSection = '';

  result.parameters.forEach(p => {
    if (p.section && p.section !== currentSection) {
      currentSection = p.section;
      tableData.push([{ content: currentSection, colSpan: 4, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8 } }]);
    }
    tableData.push([
      { content: p.name, styles: { fontStyle: 'normal' } },
      { content: p.value, styles: { fontStyle: 'bold', halign: 'center' } },
      { content: p.unit, styles: { halign: 'center' } },
      { content: p.referenceRange, styles: { halign: 'center', fontSize: 7, textColor: [100, 116, 139] } }
    ]);
  });

  autoTable(doc, {
    startY: 108,
    head: [['Investigation', 'Result', 'Unit', 'Reference Interval']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fontSize: 8, 
      fontStyle: 'bold', 
      textColor: [30, 58, 138],
      fillColor: [255, 255, 255],
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    bodyStyles: { 
      fontSize: 8, 
      textColor: [0, 0, 0],
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 55 }
    },
    margin: { left: 10, right: 10 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 12;

  // Peripheral Smear / Morphology
  if (result.morphology) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PERIPHERAL SMEAR FINDINGS:', 12, currentY);
    doc.setFont('helvetica', 'normal');
    const morphText = doc.splitTextToSize(result.morphology, pageWidth - 25);
    doc.text(morphText, 12, currentY + 5);
    currentY += 10 + (morphText.length * 4);
  }

  // Clinical Remarks
  doc.setFillColor(254, 252, 232);
  doc.rect(10, currentY, pageWidth - 20, 15, 'F');
  doc.setDrawColor(254, 240, 138);
  doc.rect(10, currentY, pageWidth - 20, 15, 'S');
  
  doc.setTextColor(133, 77, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL REMARKS:', 15, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(result.doctorRemarks || 'Clinical correlation suggested.', 15, currentY + 11);

  // Footer / Verification QR
  const footerY = pageHeight - 50;
  
  // Mock QR Code Area
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, footerY, 25, 25, 'S');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text('SCAN TO VERIFY', 15, footerY + 28);
  doc.setFontSize(6);
  doc.text('REPORT ID: ' + result.id, 15, footerY + 31);

  // Signatures
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Dr. BALU, MD (Pathology)', pageWidth - 60, footerY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Consultant Pathologist', pageWidth - 60, footerY + 14, { align: 'center' });
  doc.text('Medical Council Reg: 54321', pageWidth - 60, footerY + 18, { align: 'center' });

  // Page numbering / End of report
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text('--- End of Report ---', pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text('This is a computer generated report and does not require physical signature.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`LabReport_${result.patientName.replace(/\s+/g, '_')}_${result.id}.pdf`);
};
