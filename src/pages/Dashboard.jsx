import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { Link } from "react-router-dom";
import {
  buildClassWiseDataWithAbsent,
  buildPreviewClassWiseData,
  generateClassWisePDF,
} from "../utils/pdfUtils";
import API from "../api/api";

const standards = ["2", "5", "7", "8"];
const subjects = ["Maths", "Science", "English"];

const Dashboard = () => {
  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [testDate, setTestDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [marks, setMarks] = useState({});
  const [previewData, setPreviewData] = useState({});
  const [loading, setLoading] = useState(false);
  const [absentMap, setAbsentMap] = useState({});
  const [existingTestId, setExistingTestId] = useState(null);

  const [editingRow, setEditingRow] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!standard || !subject) return;

    const fetchStudent = async () => {
      setLoading(true);
      try {
        const res = await API.get(
          `/students?standard=${standard}&subject=${subject}`
        );
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [standard, subject]);

  //check data exists on selected date
  useEffect(() => {
    if (!testDate) return;

    const fetchExistingData = async () => {
      try {
        const res = await API.get(`/marks/pdf-by-date?testDate=${testDate}`);

        if (!res.data || !res.data.tests || res.data.tests.length === 0) {
          setExistingTestId(null);
          setPreviewData({});
          setMarks({});
          setAbsentMap({});
          return;
        }

        // ✅ THIS is the correct place
        const test = res.data.tests.find(
          (t) => t.standard === standard && t.subject === subject
        );

        if (test) {
          setExistingTestId(test._id);
          setTotalMarks(test.totalMarks);
        } else {
          setExistingTestId(null);
        }

        // build preview
        setPreviewData(buildClassWiseDataWithAbsent(res.data));

        // hydrate marks + absentMap
        const newMarks = {};
        const newAbsentMap = {};

        res.data.marks.forEach((m) => {
          if (
            m.testId.subject === subject &&
            m.studentId.standard === standard
          ) {
            if (m.status === "ABSENT") {
              newAbsentMap[m.studentId._id] = true;
            } else {
              newMarks[m.studentId._id] = m.obtainedMarks;
            }
          }
        });

        setMarks(newMarks);
        setAbsentMap(newAbsentMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchExistingData();
  }, [testDate, standard, subject]);

  const handleMarkChange = (studentId, value) => {
    const numValue = Number(value);
    if (numValue < 0) return;
    setMarks((prev) => ({ ...prev, [studentId]: numValue }));
  };

  const handleSubmit = async () => {
    if (!testDate) {
      toast.error("Test Date required");
      return;
    }

    if (!existingTestId && !totalMarks) {
      toast.error("Total marks is required");
      return;
    }

    if (students.length === 0) {
      toast.error("No students found");
      return;
    }

    // 🔒 PRE-VALIDATION (ALL OR NOTHING)
    for (let student of students) {
      if (absentMap[student._id]) continue;

      const obtainedMarks = marks[student._id];
      if (!Number.isFinite(obtainedMarks)) continue;

      if (obtainedMarks > Number(totalMarks)) {
        toast.error(
          `${student.name}: Marks cannot be greater than ${totalMarks}`
        );
        return; // ⛔ STOP BEFORE ANY SAVE
      }
    }

    setLoading(true);

    try {
      let testId = existingTestId;

      // ✅ CREATE MODE: only if test does NOT exist
      if (!existingTestId) {
        const testRes = await API.post("/tests", {
          standard,
          subject,
          testDate,
          totalMarks: Number(totalMarks),
        });

        testId = testRes.data._id;

        if (!testId) {
          toast.error("Test creation failed");
          return;
        }
      }

      // ✅ SAVE / UPDATE MARKS
      for (let student of students) {
        const isAbsent = absentMap[student._id];

        // find existing mark (if any) from previewData
        const existingRow =
          previewData?.[standard]?.find((r) => r.studentId === student._id) ||
          null;

        // ABSENT
        if (isAbsent) {
          if (existingRow?.markId) {
            await API.put(`/marks/${existingRow.markId}`, {
              status: "ABSENT",
            });
          } else {
            await API.post("/marks", {
              studentId: student._id,
              testId,
              status: "ABSENT",
            });
          }
          continue;
        }

        const obtainedMarks = marks[student._id];

        //skip if absent
        if (absentMap[student._id]) continue;

        //skip id empty
        if (!Number.isFinite(obtainedMarks)) continue;
        // Hard block

        // PRESENT
        if (existingRow?.markId) {
          // update
          await API.put(`/marks/${existingRow.markId}`, {
            obtainedMarks,
          });
        } else {
          // create
          await API.post("/marks", {
            studentId: student._id,
            testId,
            obtainedMarks,
            status: "PRESENT",
          });
        }
      }

      // 🔄 Refresh preview
      const previewRes = await API.get(
        `/marks/pdf-by-date?testDate=${testDate}`
      );

      setPreviewData(buildClassWiseDataWithAbsent(previewRes.data));

      toast.success(
        existingTestId
          ? "Marks updated successfully"
          : "Marks saved successfully"
      );

      setMarks({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  //download pdf
  const handleDownloadPDF = async () => {
    if (!testDate) {
      toast.error("Please select test date");
      return;
    }

    try {
      //fetxh row mark data from backend
      const res = await API.get(`marks/pdf-by-date?testDate=${testDate}`);

      // 2️⃣ Convert raw data → class-wise structure
      const classWiseData = buildClassWiseDataWithAbsent(res.data);

      // 3️⃣ Generate PDF
      generateClassWisePDF(classWiseData);
      toast.success("PDF downloaded successfully", { id: "pdf" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  //edit marks
  const startEdit = (row) => {
    if (row.status === "ABSENT") {
      toast.error("Cannot edit absent student");
      return;
    }
    setEditingRow(row);
    setEditValue(row.obtainedMarks ?? "");
  };

  const saveEdit = async () => {
    if (!editingRow) return;

    if (Number(editValue) > Number(editingRow.totalMarks)) {
      toast.error("Marks cannot exceed total marks");
      return;
    }

    await API.put(`/marks/${editingRow.markId}`, {
      obtainedMarks: Number(editValue),
    });

    toast.success("Marks updated");

    setEditingRow(null);

    const previewRes = await API.get(`/marks/by-date?testDate=${testDate}`);
    setPreviewData(
      buildPreviewClassWiseData({
        students,
        marks: previewRes.data,
      })
    );
  };

  const toggleAbsent = (studentId) => {
    setAbsentMap((prev) => {
      const isAbsent = !prev[studentId];

      return {
        ...prev,
        [studentId]: isAbsent,
      };
    });

    //clear marks if absent
    setMarks((prev) => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  // const markAbsent = async (row) => {
  //   try {
  //     await API.put(`marks/${row.markId}`, {
  //       status: "ABSENT",
  //     });

  //     toast.success(`${row.name} marked absent`);

  //     const previewRes = await API.get(
  //       `/marks/pdf-by-date?testDate=${testDate}`
  //     );

  //     setPreviewData(buildClassWiseDataWithAbsent(previewRes.data));

  //     // eslint-disable-next-line no-unused-vars
  //   } catch (error) {
  //     toast.error("Failed to mark absent");
  //   }
  // };

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
          <p className="text-gray-600 mt-1">Enter marks for students</p>

          <Link
            to="/add-student"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add New Student
          </Link>
          <Link
            to="/students"
            className="inline-flex items-center ml-20 mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            + Student list
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Select Class & Subject
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Standard</option>
                {standards.map((s) => (
                  <option key={s} value={s}>
                    Class {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-2">Loading students...</p>
          </div>
        )}

        {existingTestId && (
          <div className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
            ℹ️ You are editing an existing test. Total marks are locked.
          </div>
        )}

        {/* Students List */}
        {students.length > 0 && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Test Details */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Test Details
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="date"
                    placeholder="Test Date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Total marks"
                    value={totalMarks}
                    disabled={!!existingTestId}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Students ({students.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Class {standard} • {subject}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Student Name
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                        Marks Obtained
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {student._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={marks[student._id] || ""}
                              onChange={(e) =>
                                handleMarkChange(student._id, e.target.value)
                              }
                              disabled={absentMap[student._id]}
                              className={`w-24 px-3 py-2 border rounded-lg ${
                                absentMap[student._id]
                                  ? "bg-red-200 cursor-not-allowed"
                                  : "border-gray-300"
                              }`}
                            />

                            <label className="flex items-center gap-1 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!absentMap[student._id]}
                                onChange={() => toggleAbsent(student._id)}
                              />
                              Absent
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "Saving..." : "Save All Marks"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && students.length === 0 && standard && subject && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">
              No students found for this class and subject
            </p>
            <Link
              to="/add-student"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Add Students
            </Link>
          </div>
        )}

        {Object.keys(previewData).length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">
              Entered Marks Preview (Test Date: {testDate})
            </h2>

            {Object.entries(previewData).map(([std, rows]) => (
              <div key={std} className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Class {std}
                </h3>

                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Student</th>
                      <th className="p-2 text-left">Subject</th>
                      <th className="p-2 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={i}
                        className={`border-t ${
                          r.marks === "ABSENT" ? "bg-red-200" : ""
                        }`}
                      >
                        <td className="p-2">{r.name}</td>
                        <td className="p-2">{r.subject}</td>
                        <td className="p-2">
                          {r.marks === "ABSENT" || r.marks === "-"
                            ? "-"
                            : r.marks}
                        </td>

                        <td>
                          {/* {r.status !== "ABSENT" && (
                            <input
                              type="checkbox"
                              onChange={() => markAbsent(r)}
                            />
                          )} */}
                        </td>

                        <td className="p-2">
                          <button
                            onClick={() => startEdit(r)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleDownloadPDF}
          style={{ marginTop: 10 }}
          className="px-4 py-2 bg-green-700 rounded-lg text-white"
        >
          Download Class-wise PDF
        </button>
      </div>
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          {/* Modal box */}
          <div className="w-72 p-4 border rounded-lg bg-blue-100 shadow-lg">
            <h3 className="font-semibold mb-3 text-gray-800">
              Edit Marks – {editingRow.name}
            </h3>

            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <div className="flex justify-between gap-3">
              <button
                onClick={saveEdit}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Save
              </button>

              <button
                onClick={() => setEditingRow(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
