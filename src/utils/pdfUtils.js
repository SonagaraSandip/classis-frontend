import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// PREVIEW BUILDER – shows "-" instead of Absent
export const buildPreviewClassWiseData = ({ students, marks }) => {
  const result = {};

  students.forEach((student) => {
    const std = student.standard;
    if (!result[std]) result[std] = [];

    const markEntry = marks.find(
      (m) => m.studentId?._id?.toString() === student._id.toString()
    );

    result[std].push({
      name: student.name,
      subject: markEntry?.testId?.subject || "-",
      markId: markEntry?._id || null,
      marks: markEntry
        ? `${markEntry.obtainedMarks} / ${markEntry.testId.totalMarks}`
        : "Absent", // 👈 THIS IS THE KEY
      obtainedMarks: markEntry?.obtainedMarks ?? null,
    });
  });

  return result;
};

// Convert raw marks → class-wise structure
export const buildClassWiseDataWithAbsent = ({ tests, marks, students }) => {
  const result = {};

  tests.forEach((test) => {
    const std = test.standard;
    if (!result[std]) result[std] = [];

    const classStudents = students.filter((s) => s.standard === std);

    classStudents.forEach((student) => {
      const markEntry = marks.find(
        (m) =>
          m.studentId._id.toString() === student._id.toString() &&
          m.testId._id.toString() === test._id.toString()
      );

      result[std].push({
        name: student.name,
        subject: test.subject,
        markId: markEntry?._id || null,
        marks: markEntry
          ? `${markEntry.obtainedMarks} / ${test.totalMarks}`
          : "Absent",

        testDate: test.testDate,
      });
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

    autoTable(doc, {
      startY: currentY,
      head: [["Student", "Subject", "Marks"]],
      body: rows.map((r) => [r.name, r.subject, r.marks]),
      styles: { fontSize: 10 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  });

  doc.save("Class_Wise_Report.pdf");
};
