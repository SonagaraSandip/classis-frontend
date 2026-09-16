// Helper to compare and sort standards: "બાલ મંદિર" first, then Std 1, 2, 3, ..., 10
export const compareStandards = (stdA = "", stdB = "") => {
  const a = String(stdA).trim();
  const b = String(stdB).trim();

  // Bal Mandir / KG should always come first
  const isBalA = /બાલ|bal|kg|nursery/i.test(a);
  const isBalB = /બાલ|bal|kg|nursery/i.test(b);
  if (isBalA && !isBalB) return -1;
  if (!isBalA && isBalB) return 1;

  // Extract numbers from standards (e.g. "ધોરણ 1" -> 1, "ધોરણ 10" -> 10)
  const numA = parseInt(a.replace(/\D/g, ""), 10);
  const numB = parseInt(b.replace(/\D/g, ""), 10);

  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA !== numB) return numA - numB;
  } else if (!isNaN(numA)) {
    return -1;
  } else if (!isNaN(numB)) {
    return 1;
  }

  return a.localeCompare(b, "gu-IN", { numeric: true });
};

// Convert raw marks → class-wise structure
export const buildClassWiseDataWithAbsent = ({ tests = [], marks = [], students = [] }) => {
  const result = {};

  const sortedTests = [...tests].sort((t1, t2) =>
    compareStandards(t1.standard, t2.standard)
  );

  sortedTests.forEach((test) => {
    const standard = test.standard;
    if (!result[standard]) result[standard] = [];

    const classStudents = students.filter(
      (student) => student.standard === standard
    );

    classStudents.forEach((student) => {
      const mark = marks.find(
        (m) =>
          m.studentId &&
          student._id &&
          (m.studentId._id || m.studentId).toString() === student._id.toString() &&
          m.testId &&
          test._id &&
          (m.testId._id || m.testId).toString() === test._id.toString()
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
