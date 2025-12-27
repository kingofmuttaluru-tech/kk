
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TestResult } from '../types';

export const generatePDFReport = (result: TestResult) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header - Letterhead
  doc.setFillColor(30, 58, 138); // Blue-900
  doc.rect(0, 0, pageWidth, 42, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SRI VENKATESWAR DIGITAL X-RAY', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('& CLINICAL LABORATORY', pageWidth / 2, 28, { align: 'center' });
  
  doc.setFontSize(9);
  doc.text('Plot No. 45, Beside City Hospital, Main Road | Tel: +91 98765 43210 | Email: balu.diagnostics@gmail.com', pageWidth / 2, 36, { align: 'center' });

  // Patient Info Header
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 50, pageWidth - 30, 20, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient Name:`, 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(`${result.patientName}`, 55, 58);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient ID:`, 20, 64);
  doc.setFont('helvetica', 'normal');
  doc.text(`${result.patientId.substring(0, 8)}`, 55, 64);

  doc.setFont('helvetica', 'bold');
  doc.text(`Test Name:`, 115, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(`${result.testName}`, 145, 58);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Report Date:`, 115, 64);
  doc.setFont('helvetica', 'normal');
  doc.text(`${result.date}`, 145, 64);

  // Results Table
  const tableData = result.parameters.map(p => [
    p.name,
    p.value,
    p.unit,
    p.referenceRange
  ]);

  (doc as any).autoTable({
    startY: 80,
    head: [['ANALYSES / PARAMETERS', 'RESULT', 'UNIT', 'REFERENCE INTERVAL']],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [30, 58, 138], 
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: { 
      fontSize: 10,
      textColor: [50, 50, 50]
    },
    columnStyles: {
      1: { fontStyle: 'bold', halign: 'center', textColor: [30, 58, 138] },
      2: { halign: 'center' },
      3: { fontStyle: 'italic', fontSize: 9 }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  // Footer / Remarks
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setDrawColor(230, 230, 230);
  doc.line(15, finalY - 5, pageWidth - 15, finalY - 5);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Clinical Observations & Remarks:", 15, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const splitRemarks = doc.splitTextToSize(result.doctorRemarks || 'The results provided relate only to the sample tested. Clinical correlation is recommended.', pageWidth - 30);
  doc.text(splitRemarks, 15, finalY + 8);

  // Disclaimers
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('* End of Report *', pageWidth / 2, finalY + 35, { align: 'center' });

  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('__________________________', pageWidth - 75, finalY + 50);
  doc.text('AUTHORIZED SIGNATORY', pageWidth - 68, finalY + 56);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Dr. Balu, MBBS, MD (Pathology)', pageWidth - 70, finalY + 62);
  doc.text('Registration No: 54932', pageWidth - 58, finalY + 66);

  // Save the PDF
  doc.save(`SRI_VENKATESWAR_LAB_REPORT_${result.patientName.replace(/\s+/g, '_')}.pdf`);
};
