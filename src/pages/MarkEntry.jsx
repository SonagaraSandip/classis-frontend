import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { buildClassWiseData, generateClassWisePDF } from "../utils/pdfUtils";
import API from "../api/api";

const standards = ["2", "5", "7", "8"];
const subjects = ["Maths", "Science", "English"];

const MarkEntry = () => {
  const [standard, setStandard] = useState("");
  const [subject, setSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [testName, setTestName] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [createdTestId, setCreatedTestId] = useState(null);

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
        setMessage("Error fetching students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [standard, subject]);

  const handleMarkChange = (studentId, value) => {
    const numValue = Number(value);
    if (numValue < 0) return;
    setMarks((prev) => ({ ...prev, [studentId]: numValue }));
  };

  const handleSubmit = async () => {
    setMessage("");

    if (!testName || !totalMarks) {
      setMessage("Test name and total marks required");
      return;
    }

    if (students.length === 0) {
      setMessage("No students found");
      return;
    }

    setLoading(true);
    try {
      const testRes = await API.post("/tests", {
        standard,
        subject,
        testName,
        totalMarks: Number(totalMarks),
      });

      const testId = testRes.data._id;

      if (!testId) {
        setMessage("Test creation failed");
        return;
      }

      setCreatedTestId(testId);

      // Save marks for each student
      for (let student of students) {
        const obtainedMarks = marks[student._id];
        if (!Number.isFinite(obtainedMarks)) continue;

        await API.post("/marks", {
          studentId: student._id,
          testId,
          obtainedMarks,
        });
      }

      setMessage("Marks saved successfully");
      setTestName("");
      setTotalMarks("");
      setMarks({});
    } catch (err) {
      console.error(err);
      setMessage("Error saving marks");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!createdTestId) {
      setMessage("Please save marks before downloading PDF");
      return;
    }

    try {
      //fetxh row mark data from backend
      const res = await API.get(`marks/pdf-data?testId=${createdTestId}`);

      // 2️⃣ Convert raw data → class-wise structure
      const classWiseData = buildClassWiseData(res.data);

      // 3️⃣ Generate PDF
      generateClassWisePDF(classWiseData);
    } catch (err) {
      console.error(err);
      setMessage("Failed to generate PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
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

        {/* Message Display */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-700"
                : message.includes("required") ||
                  message.includes("No students")
                ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 mt-2">Loading students...</p>
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
                    type="text"
                    placeholder="Test name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Total marks"
                    value={totalMarks}
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
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={marks[student._id] || ""}
                              onChange={(e) =>
                                handleMarkChange(student._id, e.target.value)
                              }
                              min="0"
                              max={totalMarks || 100}
                              placeholder="Enter marks"
                              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {totalMarks && (
                              <span className="text-gray-500 text-sm">
                                / {totalMarks}
                              </span>
                            )}
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

        <button
          onClick={handleDownloadPDF}
          style={{ marginTop: 10 }}
          className="px-4 py-2 bg-green-700 rounded-lg text-white"
        >
          Download Class-wise PDF
        </button>
      </div>
    </div>
  );
};

export default MarkEntry;
