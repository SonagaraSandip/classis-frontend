// Convert raw marks → class-wise structure
export const buildClassWiseDataWithAbsent = ({ tests = [], marks = [], students = [] }) => {
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
