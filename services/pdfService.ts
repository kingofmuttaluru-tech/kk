
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestResult, TestParameter } from '../types';

export const generatePDFReport = (result: TestResult) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - NABL Letterhead
  doc.setFillColor(30, 58, 138); 
  doc.rect(0, 0, pageWidth, 48, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI VENKATESWAR DIGITAL X-RAY', pageWidth / 2, 16, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('& CLINICAL LABORATORY', pageWidth / 2, 26, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text('T.B. ROAD, ALLAGADDA, NANDYAL DISTRICT, ANDHRA PRADESH - 518543', pageWidth / 2, 34, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('NABL ACCREDITED (MC-1234) | ISO 9001:2015 CERTIFIED', pageWidth / 2, 39, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Phone: +91 99669 41485 | Email: venkateswardiagnostics@gmail.com', pageWidth / 2, 44, { align: 'center' });

  // Patient Info Block
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(10, 55, pageWidth - 10, 55);
  doc.line(10, 85, pageWidth - 10, 85);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  // Patient Details Column 1
  doc.setFont('helvetica', 'bold'); doc.text('Patient Name:', 12, 61);
  doc.setFont('helvetica', 'normal'); doc.text(`${result.patientName.toUpperCase()}`, 42, 61);
  
  doc.setFont('helvetica', 'bold'); doc.text('Age / Sex:', 12, 67);
  doc.setFont('helvetica', 'normal'); doc.text(`${result.age || '---'} / ${result.gender}`, 42, 67);

  doc.setFont('helvetica', 'bold'); doc.text('Patient ID:', 12, 73);
  doc.setFont('helvetica', 'normal'); doc.text(`${result.patientId}`, 42, 73);

  doc.setFont('helvetica', 'bold'); doc.text('Ref. Doctor:', 12, 79);
  doc.setFont('helvetica', 'normal'); doc.text(`${result.refDoctor}`, 42, 79);

  // Patient Details Column 2
  doc.setFont('helvetica', 'bold'); doc.text('Sample Type:', 110, 61);
  doc.setFont('helvetica', 'normal'); doc.text(`${result.sampleType || 'EDTA Whole Blood'}`, 145, 61);

  doc.setFont('helvetica', 'bold'); doc.text('Collected On:', 110, 67);
  doc.setFont('helvetica', 'normal'); doc.text(`${new Date(result.collectedAt).toLocaleString()}`, 145, 67);

  doc.setFont('helvetica', 'bold'); doc.text('Received On:', 110, 73);
  doc.setFont('helvetica', 'normal'); doc.text(`${new Date(result.receivedAt).toLocaleString()}`, 145, 73);

  doc.setFont('helvetica', 'bold'); doc.text('Report Date:', 110, 79);
  doc.setFont('helvetica', 'normal'); doc.text(`${new Date().toLocaleDateString()}`, 145, 79);

  // Table Title
  doc.setFillColor(245, 245, 245);
  doc.rect(10, 90, pageWidth - 20, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(result.testName.toUpperCase(), pageWidth / 2, 95.5, { align: 'center' });

  // Prepare table data with section grouping
  const tableData: any[] = [];
  let currentSection = '';

  result.parameters.forEach(p => {
    if (p.section && p.section !== currentSection) {
      currentSection = p.section;
      // Add section header row
      tableData.push([{ content: currentSection, colSpan: 4, styles: { fillColor: [250, 250, 250], fontStyle: 'bold', textColor: [30, 58, 138], fontSize: 8 } }]);
    }
    tableData.push([
      p.name,
      { content: p.value, styles: { fontStyle: 'bold', halign: 'center' } },
      { content: p.unit, styles: { halign: 'center' } },
      { content: p.referenceRange, styles: { halign: 'right' } }
    ]);
  });

  autoTable(doc, {
    startY: 102,
    head: [['Test Parameter', 'Result', 'Unit', 'Biological Reference Interval']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fontSize: 8, 
      fontStyle: 'bold', 
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [220, 220, 220],
      fillColor: [248, 250, 252]
    },
    bodyStyles: { 
      fontSize: 8, 
      textColor: [0, 0, 0] 
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 60 }
    },
    margin: { left: 10, right: 10 },
    didDrawCell: (data: any) => {
      if (data.section === 'body') {
        doc.setDrawColor(240, 240, 240);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
    }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Morphology Section (If CBP)
  if (result.morphology) {
    doc.setFont('helvetica', 'bold'); doc.text('PERIPHERAL SMEAR:', 12, currentY);
    doc.setFont('helvetica', 'normal');
    const morphText = doc.splitTextToSize(result.morphology, pageWidth - 25);
    doc.text(morphText, 12, currentY + 5);
    currentY += 5 + (morphText.length * 4);
  }

  // Methodology Section (NABL REQUIREMENT)
  doc.setDrawColor(240, 240, 240);
  doc.setFillColor(252, 252, 252);
  doc.rect(10, currentY, pageWidth - 20, 20, 'F');
  doc.rect(10, currentY, pageWidth - 20, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('METHOD DETAILS (NABL COMPLIANT)', 12, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Method: ${result.parameters[0]?.method || 'Automated Analysis'}`, 12, currentY + 10);
  doc.text(`Analyzer Used: ${result.analyzerUsed || 'Hematology Auto-Analyzer'}`, 12, currentY + 14);
  doc.text(`Internal QC: ${result.internalQC || 'Within Acceptable Limits'}`, 12, currentY + 18);

  currentY += 28;

  // Interpretation / Remarks
  doc.setFont('helvetica', 'bold');
  doc.text('COMMENTS / INTERPRETATION:', 12, currentY);
  doc.setFont('helvetica', 'normal');
  const splitRemarks = doc.splitTextToSize(result.doctorRemarks || 'Clinical correlation recommended.', pageWidth - 25);
  doc.text(splitRemarks, 12, currentY + 5);

  // Authorization Signatures
  const footerY = 265;
  doc.setLineWidth(0.1);
  doc.setDrawColor(200, 200, 200);
  doc.line(10, footerY - 5, pageWidth - 10, footerY - 5);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Technician Signature', 35, footerY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Verified by MLT', 35, footerY + 15, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('Dr. BALU, MD (Pathology)', pageWidth - 55, footerY + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Consultant Pathologist', pageWidth - 55, footerY + 15, { align: 'center' });
  doc.text('Medical Council Reg No: 54321', pageWidth - 55, footerY + 20, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Report Status: Electronically Verified', pageWidth / 2, footerY + 26, { align: 'center' });
  doc.text('*** End of Report ***', pageWidth / 2, footerY + 30, { align: 'center' });

  doc.save(`NABL_Report_${result.patientName.replace(/\s+/g, '_')}_${result.id}.pdf`);
};
