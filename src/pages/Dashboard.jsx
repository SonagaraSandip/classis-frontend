import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import toast from "react-hot-toast";
import API from "../api/api";
import { subjectsByStandard } from "../utils/subjectsByStandard";
import { buildClassWiseDataWithAbsent } from "../utils/pdfUtils";
import {
  Calendar,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  XCircle,
  Download,
  Save,
  UserPlus,
} from "lucide-react";

const Dashboard = () => {
  const [standard, setStandard] = useState("");
  const [testDate, setTestDate] = useState("");
  const [globalSubject, setGlobalSubject] = useState("");
  const [globalTotalMarks, setGlobalTotalMarks] = useState("");

  const [students, setStudents] = useState([]);
  const [marksByStudent, setMarksByStudent] = useState({});
  const [absentByStudent, setAbsentByStudent] = useState({});
  const [specialByStudent, setSpecialByStudent] = useState({});
  const [subjectByStudent, setSubjectByStudent] = useState({});
  const [totalMarksByStudent, setTotalMarksByStudent] = useState({});

  const [previewData, setPreviewData] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  /* ---------------- FETCH STUDENTS ---------------- */
  useEffect(() => {
    if (!standard) return;

    setLoadingStudents(true);
    API.get(`/students?standard=${standard}`)
      .then((res) => {
        setStudents(res.data);
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoadingStudents(false));
  }, [standard]);

  useEffect(() => {
    setGlobalSubject("");
    setGlobalTotalMarks("");
  }, [standard]);

  /* ---------------- FETCH PREVIEW BY DATE ---------------- */
  useEffect(() => {
    if (!testDate) return;

    const fetchPreview = async () => {
      try {
        const res = await API.get(`/marks/pdf-by-date?testDate=${testDate}`);
        if (!res.data?.tests?.length) {
          setPreviewData({});
          return;
        }
        setPreviewData(buildClassWiseDataWithAbsent(res.data));
      } catch {
        toast.error("Failed to load preview");
      }
    };
    fetchPreview();
  }, [testDate]);

  /* ---------------- HANDLERS ---------------- */
  const handleMarkChange = (studentId, value) => {
    const numValue = Number(value);
    if (numValue < 0) return;

    setMarksByStudent((prev) => ({
      ...prev,
      [studentId]: numValue,
    }));

    setAbsentByStudent((prev) => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  const toggleAbsent = (studentId) => {
    setAbsentByStudent((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));

    setMarksByStudent((prev) => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  const toggleSpecial = (studentId) => {
    const newSpecial = !specialByStudent[studentId];
    setSpecialByStudent((prev) => ({
      ...prev,
      [studentId]: newSpecial,
    }));

    if (!newSpecial) {
      setSubjectByStudent((prev) => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
      setTotalMarksByStudent((prev) => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
  if (!standard || !testDate) {
    toast.error("Class and date required");
    return;
  }

  if (!globalSubject || !globalTotalMarks) {
    toast.error("Global subject & total marks required");
    return;
  }

  setSavingMarks(true);

  try {
    // 1️⃣ Create / reuse test
    const testRes = await API.post("/tests", {
      standard,
      testDate,
    });

    const testId = testRes.data._id;

    // 2️⃣ Build all mark requests (PARALLEL)
    const requests = students.map((student) => {
      const isAbsent = absentByStudent[student._id];

      const subject = specialByStudent[student._id]
        ? subjectByStudent[student._id]
        : globalSubject;

      const totalMarks = specialByStudent[student._id]
        ? totalMarksByStudent[student._id]
        : globalTotalMarks;

      const existingRow =
        previewData?.[standard]?.find(
          (row) => row.studentId === student._id
        ) || null;

      if (!subject || !totalMarks) {
        throw new Error(`${student.name}: Subject / total missing`);
      }

      if (!isAbsent && !Number.isFinite(marksByStudent[student._id])) {
        throw new Error(`${student.name}: Marks required`);
      }

      const payload = {
        studentId: student._id,
        testId,
        subject,
        totalMarks,
        obtainedMarks: isAbsent ? null : marksByStudent[student._id],
        status: isAbsent ? "ABSENT" : "PRESENT",
      };

      // return promise (DO NOT await here)
      if (existingRow?.markId) {
        return API.put(`/marks/${existingRow.markId}`, payload);
      }

      return API.post("/marks", payload);
    });

    // 3️⃣ Execute all requests together 🚀
    await Promise.all(requests);

    // 4️⃣ Refresh preview
    const previewRes = await API.get(
      `/marks/pdf-by-date?testDate=${testDate}`
    );

    setPreviewData(buildClassWiseDataWithAbsent(previewRes.data));

    toast.success("Marks saved successfully");
  } catch (err) {
    toast.error(err.message || "Save failed");
  } finally {
    setSavingMarks(false);
  }
};


  const downloadPDF = async () => {
    const toastId = toast.loading("Generating PDF…");
    setDownloadingPDF(true);
    try {
      const response = await API.get(
        `/pdf/classwise-pdf?testDate=${testDate}`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Marks_${testDate}.pdf`; // ✅ custom filename
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded", { id: toastId });
    } catch {
      toast.error("Failed to download PDF", { id: toastId });
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                Marks Dashboard
              </h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">
                Enter and manage test marks
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <Link
                to="/add-student"
                className="inline-flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Link>
              <Link
                to="/students"
                className="inline-flex items-center px-3 md:px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">View Students</span>
                <span className="sm:hidden">Students</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Global Controls Card */}
        <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Test Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Class
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Class</option>
                {Object.keys(subjectsByStandard).map((std) => (
                  <option key={std} value={std}>
                    {std}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Test Date
              </label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="h-4 w-4 inline mr-1" />
                Global Subject
              </label>
              <select
                value={globalSubject}
                onChange={(e) => setGlobalSubject(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Subject</option>
                {subjectsByStandard[standard]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                placeholder="Enter total marks"
                value={globalTotalMarks}
                onChange={(e) => setGlobalTotalMarks(Number(e.target.value))}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Students List Card */}
        {standard && (
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Students List
                <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {students.length} students
                </span>
              </h2>
              {loadingStudents && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  No students found in Class {standard}
                </p>
                <Link
                  to="/add-student"
                  className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 text-sm md:text-base"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add students
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const isAbsent = absentByStudent[student._id];
                  const isSpecial = specialByStudent[student._id];
                  const obtainedMarks = marksByStudent[student._id];
                  const totalMarks = isSpecial
                    ? totalMarksByStudent[student._id]
                    : globalTotalMarks;
                  const subject = isSpecial
                    ? subjectByStudent[student._id]
                    : globalSubject;

                  return (
                    <div
                      key={student._id}
                      className={`p-3 md:p-4 border rounded-lg transition-all ${
                        isAbsent
                          ? "border-red-200 bg-red-50"
                          : isSpecial
                            ? "border-purple-200 bg-purple-50"
                            : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
                        {/* Student Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                            <h3 className="font-medium text-gray-900 text-sm md:text-base">
                              {student.name}
                            </h3>
                            {student.isWeak && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                Weak
                              </span>
                            )}
                          </div>
                          {subject && (
                            <span className="text-xs md:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                              {subject}
                            </span>
                          )}
                        </div>

                        {/* Marks Input and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          {!isAbsent && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                placeholder="Marks"
                                value={obtainedMarks || ""}
                                onChange={(e) =>
                                  handleMarkChange(student._id, e.target.value)
                                }
                                min="0"
                                max={totalMarks || 100}
                                className="w-20 md:w-24 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                              />
                              {totalMarks && (
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                  / {totalMarks}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleAbsent(student._id)}
                              className={`inline-flex items-center px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                                isAbsent
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {isAbsent ? (
                                <>
                                  <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                  <span className="hidden sm:inline">
                                    Absent
                                  </span>
                                  <span className="sm:hidden">Absent</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                  <span className="hidden sm:inline">
                                    Present
                                  </span>
                                  <span className="sm:hidden">Present</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => toggleSpecial(student._id)}
                              className={`inline-flex items-center px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                                isSpecial
                                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <Award className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span className="hidden sm:inline">Special</span>
                              <span className="sm:hidden">Special</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Special Settings */}
                      {isSpecial && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Custom Subject
                              </label>
                              <select
                                value={subjectByStudent[student._id] || ""}
                                onChange={(e) =>
                                  setSubjectByStudent((prev) => ({
                                    ...prev,
                                    [student._id]: e.target.value,
                                  }))
                                }
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm outline-none"
                              >
                                <option value="">Select subject</option>
                                {subjectsByStandard[standard]?.map((sub) => (
                                  <option key={sub} value={sub}>
                                    {sub}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Custom Total Marks
                              </label>
                              <input
                                type="number"
                                placeholder="Total marks"
                                value={totalMarksByStudent[student._id] || ""}
                                onChange={(e) =>
                                  setTotalMarksByStudent((prev) => ({
                                    ...prev,
                                    [student._id]: Number(e.target.value),
                                  }))
                                }
                                className="w-full px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm outline-none"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Current Entry
                              </label>
                              <div className="text-xs md:text-sm font-medium text-gray-900 px-2 md:px-3 py-1.5 md:py-2 bg-gray-50 rounded-lg">
                                {obtainedMarks || "0"}/
                                {totalMarksByStudent[student._id] || "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <button
            onClick={handleSubmit}
            disabled={
              savingMarks ||
              !standard ||
              !testDate ||
              !globalSubject ||
              !globalTotalMarks
            }
            className="inline-flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
          >
            {savingMarks ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Save All Marks
              </>
            )}
          </button>

          {Object.keys(previewData).length > 0 && (
            <button
              onClick={downloadPDF}
              disabled={downloadingPDF || !testDate || loadingStudents}
              className="inline-flex items-center justify-center px-4 md:px-5 py-2.5 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
            >
              {downloadingPDF ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Download PDF
                </>
              )}
            </button>
          )}
        </div>

        {/* Preview Section - Shows ALL Students */}
        {Object.keys(previewData).length > 0 && (
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Preview for {testDate}
              </h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-1 rounded">
                {Object.keys(previewData).length} class
                {Object.keys(previewData).length !== 1 ? "es" : ""}
              </span>
            </div>

            {Object.entries(previewData).map(([std, rows]) => (
              <div key={std} className="mb-6 last:mb-0">
                <div className="flex items-center mb-3">
                  <h3 className="font-medium text-gray-900 text-base md:text-lg">
                    {std}
                  </h3>
                  <span className="ml-3 text-sm text-gray-500">
                    {rows.length} student{rows.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 md:p-3 text-left text-sm font-medium text-gray-700">
                          Student
                        </th>
                        <th className="p-2 md:p-3 text-left text-sm font-medium text-gray-700">
                          Subject
                        </th>
                        <th className="p-2 md:p-3 text-left text-sm font-medium text-gray-700">
                          Marks
                        </th>
                        <th className="p-2 md:p-3 text-left text-sm font-medium text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 md:p-3">
                            <div className="font-medium text-gray-900 text-sm md:text-base">
                              {row.name}
                            </div>
                          </td>
                          <td className="p-2 md:p-3 text-gray-600 text-sm md:text-base">
                            {row.subject}
                          </td>
                          <td className="p-2 md:p-3">
                            {row.marks === "ABSENT" ? (
                              <span className="text-gray-400 text-sm md:text-base">
                                -
                              </span>
                            ) : (
                              <span className="font-medium text-gray-900 text-sm md:text-base">
                                {row.marks}
                              </span>
                            )}
                          </td>
                          <td className="p-2 md:p-3">
                            {row.marks === "ABSENT" ? (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs md:text-sm font-medium">
                                <XCircle className="h-3 w-3 mr-1" />
                                Absent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs md:text-sm font-medium">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Present
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
