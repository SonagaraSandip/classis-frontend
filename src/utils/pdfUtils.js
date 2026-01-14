import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import gujaratiFont from "./gujaratiFont";

// Convert raw marks → class-wise structure
export const buildClassWiseDataWithAbsent = ({ tests, marks, students }) => {
  const result = {};

  tests.forEach((test) => {
    const standard = test.standard;
    if (!result[standard]) result[standard] = [];

    const classStudents = students.filter(
      (student) => student.standard === standard
    );

    classStudents.forEach((student) => {
      const mark = marks.find(
        (m) =>
          m.studentId._id.toString() === student._id.toString() &&
          m.testId._id.toString() === test._id.toString()
      );

      result[standard].push({
        studentId: student._id,
        name: student.name,
        subject: mark?.subject || "-",
        marks: mark
          ? mark.status === "ABSENT"
            ? "ABSENT"
            : `${mark.obtainedMarks} / ${mark.totalMarks}`
          : "-",
        markId: mark?._id || null,
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
    doc.text(`${std}`, 14, currentY);
    currentY += 6;

    autoTable(doc, {
      startY: currentY,
      head: [["Name", "Subjects", "Marks "]],
      body: rows.map((r) => [r.name, r.subject, r.marks]),
      styles: { font: "Gujarati", fontSize: 10, cellPadding: 3 },
      headStyles: {
        font: "Gujarati",
        fontStyle: "normal",
      },
      didParseCell: function (data) {
        data.cell.styles.font = "Gujarati";
      },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  });

  doc.save("Class_Wise_Report.pdf");
};
