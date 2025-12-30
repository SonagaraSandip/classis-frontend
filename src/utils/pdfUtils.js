import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// Convert raw marks → class-wise structure
export const buildClassWiseData = (marksData) => {
  const result = {};

  marksData.forEach((item) => {
    const std = item.studentId.standard;

    if (!result[std]) {
      result[std] = [];
    }

    result[std].push({
      name: item.studentId.name,
      subject: item.testId.subject,
      marks: `${item.obtainedMarks} / ${item.testId.totalMarks}`,
    });
  });

  return result;
};

// Generate PDF
export const generateClassWisePDF = (classData) => {
  const doc = new jsPDF();

  let currentY = 20;
  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 20;

  Object.keys(classData).forEach((std) => {
    const rows = classData[std];
    const estimatedHeight = 10 + rows.length * 8 + 15;

    if (currentY + estimatedHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.text(`Class ${std}`, 14, currentY);
    currentY += 6;

    autoTable(doc , {
      startY: currentY,
      head: [["Student", "Subject", "Marks"]],
      body: rows.map((r) => [r.name, r.subject, r.marks]),
      styles: { fontSize: 10 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  });

  doc.save("Class_Wise_Report.pdf");
};
