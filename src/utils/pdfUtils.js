import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import gujaratiFont from "./gujaratiFont";

// PREVIEW BUILDER – shows "-" instead of Absent
export const buildPreviewClassWiseData = ({ students, marks }) => {
  const result = {};

  students.forEach((student) => {
    const std = student.standard;
    if (!result[std]) result[std] = [];

    const markEntry = marks.find(
      (m) => m.studentId._id.toString() === student._id.toString()
    );

    let display;
    let editable = true;

    if (!markEntry) {
      display = "-"; //not entered
    } else if (markEntry.status === "ABSENT") {
      display = "Absent";
      editable = false;
    } else {
      display = `${markEntry.obtainedMarks} / ${markEntry.testId.totalMarks}`;
    }

    result[std].push({
      name: student.name,
      subject: markEntry?.testId?.subject || "-",
      markId: markEntry?._id || null,
      status: markEntry?.status || "NOT_ENTERED",
      marks: display,
      editable,
      totalMarks: markEntry?.testId?.totalMarks || 0,
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
        studentId: student._id,
        name: student.name,
        subject: test.subject,
        markId: markEntry?._id || null,
        marks: markEntry
          ? markEntry.status === "ABSENT"
            ? "ABSENT"
            : `${markEntry.obtainedMarks} / ${test.totalMarks}`
          : "ABSENT",

        testDate: test.testDate,
      });
    });
  });

  return result;
};

// Generate PDF
export const generateClassWisePDF = (classData) => {
  const doc = new jsPDF();

  //register gujrati font
  doc.addFileToVFS("Gujarati.ttf", gujaratiFont);
  doc.addFont("Gujarati.ttf", "Gujarati", "normal");
  doc.setFont("Gujarati");

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
    doc.text(`ધોરણ  ${std}`, 14, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [["Name", "Subjects", "Marks "]],
      body: rows.map((r) => [r.name, r.subject, r.marks]),
      styles: { font: "Gujarati", fontSize: 10 },
      headStyles: {
        font: "Gujarati",
        fontStyle : "normal"
      },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  });

  doc.save("Class_Wise_Report.pdf");
};
