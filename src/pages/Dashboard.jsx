import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import toast from "react-hot-toast";
import API from "../api/api";
import { buildClassWiseDataWithAbsent } from "../utils/pdfUtils";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";
import { useStandards } from "../context/StandardContext";
import ManageStandardsModal from "../components/ManageStandardsModal";
import InstallPwaBanner from "../components/InstallPwaBanner";
import RecentTestHistory from "../components/RecentTestHistory";
import TestPreviewModal from "../components/TestPreviewModal";
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
  Layers,
  Sparkles,
  ChevronDown,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  const { subjectsByStandard, standardNames } = useStandards();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

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

  // Recent 3 Test History & Preview Modal States 🕒
  const [previewModalDate, setPreviewModalDate] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [downloadingHistoryDate, setDownloadingHistoryDate] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  // In-memory caching for super-fast standard switching ⚡
  const studentsCacheRef = useRef({});

  /* ---------------- FETCH STUDENTS WITH CACHE ---------------- */
  useEffect(() => {
    if (!standard) {
      setStudents([]);
      return;
    }

    // Check cache first for instant UI response
    if (studentsCacheRef.current[standard]) {
      setStudents(studentsCacheRef.current[standard]);
      return;
    }

    setLoadingStudents(true);
    API.get(`/students?standard=${encodeURIComponent(standard)}`)
      .then((res) => {
        studentsCacheRef.current[standard] = res.data;
        setStudents(res.data);
      })
      .catch((err) =>
        toast.error(getGujaratiErrorMessage(err, gujaratiToast.studentLoadError))
      )
      .finally(() => setLoadingStudents(false));
  }, [standard]);

  useEffect(() => {
    setGlobalSubject("");
    setGlobalTotalMarks("");
    setMarksByStudent({});
    setAbsentByStudent({});
    setSpecialByStudent({});
    setSubjectByStudent({});
    setTotalMarksByStudent({});
  }, [standard]);

  /* ---------------- FETCH PREVIEW BY DATE ---------------- */
  useEffect(() => {
    if (!testDate) {
      setPreviewData({});
      return;
    }

    let isMounted = true;
    const fetchPreview = async () => {
      try {
        const res = await API.get(`/marks/pdf-by-date?testDate=${testDate}`);
        if (!isMounted) return;
        if (!res.data?.tests?.length) {
          setPreviewData({});
          return;
        }
        setPreviewData(buildClassWiseDataWithAbsent(res.data));
      } catch (err) {
        if (isMounted) {
          toast.error(getGujaratiErrorMessage(err, "પ્રીવ્યૂ લાવવામાં સમસ્યા આવી."));
        }
      }
    };
    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [testDate]);

  /* ---------------- HANDLERS ---------------- */
  const handleMarkChange = useCallback((studentId, value) => {
    if (value === "") {
      setMarksByStudent((prev) => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return;

    setMarksByStudent((prev) => ({
      ...prev,
      [studentId]: numValue,
    }));

    setAbsentByStudent((prev) => {
      if (!prev[studentId]) return prev;
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  }, []);

  const toggleAbsent = useCallback((studentId) => {
    setAbsentByStudent((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));

    setMarksByStudent((prev) => {
      if (prev[studentId] === undefined) return prev;
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  }, []);

  const toggleSpecial = useCallback((studentId) => {
    setSpecialByStudent((prev) => {
      const nextVal = !prev[studentId];
      if (!nextVal) {
        setSubjectByStudent((sPrev) => {
          const sCopy = { ...sPrev };
          delete sCopy[studentId];
          return sCopy;
        });
        setTotalMarksByStudent((tPrev) => {
          const tCopy = { ...tPrev };
          delete tCopy[studentId];
          return tCopy;
        });
      }
      return {
        ...prev,
        [studentId]: nextVal,
      };
    });
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!standard || !testDate) {
      toast.error(gujaratiToast.selectStandard + " અને તારીખ પસંદ કરો.");
      return;
    }

    if (!globalSubject || !globalTotalMarks) {
      toast.error(gujaratiToast.selectSubject + " અને કુલ ગુણ દાખલ કરો.");
      return;
    }

    if (students.length === 0) {
      toast.error("આ ધોરણમાં કોઈ વિદ્યાર્થી નથી.");
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

      // 2️⃣ Build all mark entries
      const payloadMarks = students.map((student) => {
        const isAbsent = Boolean(absentByStudent[student._id]);

        const subject = specialByStudent[student._id]
          ? subjectByStudent[student._id]
          : globalSubject;

        const totalMarks = specialByStudent[student._id]
          ? totalMarksByStudent[student._id]
          : globalTotalMarks;

        if (!subject || !totalMarks) {
          throw new Error(`${student.name}: વિષય અથવા કુલ ગુણ બાકી છે.`);
        }

        const studentMark = marksByStudent[student._id];
        if (
          !isAbsent &&
          (studentMark === undefined ||
            studentMark === null ||
            !Number.isFinite(studentMark))
        ) {
          throw new Error(`${student.name}: મેળવેલ ગુણ દાખલ કરો અથવા હાજર/ગેરહાજર સેટ કરો.`);
        }

        if (!isAbsent && studentMark > totalMarks) {
          throw new Error(
            `${student.name}: ગુણ કુલ ગુણ (${totalMarks}) કરતા વધુ ન હોઈ શકે.`
          );
        }

        return {
          studentId: student._id,
          subject,
          totalMarks: Number(totalMarks),
          obtainedMarks: isAbsent ? null : Number(studentMark),
          status: isAbsent ? "ABSENT" : "PRESENT",
        };
      });

      // 3️⃣ Fast atomic bulk save ⚡
      await API.post("/marks/bulk", {
        testId,
        marks: payloadMarks,
      });

      // 4️⃣ Refresh preview & history
      const previewRes = await API.get(
        `/marks/pdf-by-date?testDate=${encodeURIComponent(testDate)}`
      );

      setPreviewData(buildClassWiseDataWithAbsent(previewRes.data));
      setHistoryRefreshTrigger((prev) => prev + 1);

      toast.success(gujaratiToast.marksSaved);
    } catch (err) {
      toast.error(getGujaratiErrorMessage(err, gujaratiToast.marksSaveError));
    } finally {
      setSavingMarks(false);
    }
  };

  const downloadPDFForDate = async (targetDate) => {
    const dateToUse = targetDate || testDate;
    if (!dateToUse) {
      toast.error("તારીખ પસંદ કરો.");
      return;
    }

    const toastId = toast.loading(gujaratiToast.pdfGenerating);
    setDownloadingHistoryDate(dateToUse);
    if (dateToUse === testDate) {
      setDownloadingPDF(true);
    }

    try {
      const response = await API.get(
        `/pdf/classwise-pdf?testDate=${encodeURIComponent(dateToUse)}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Marks_${dateToUse}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success(gujaratiToast.pdfSuccess, { id: toastId });
    } catch (err) {
      toast.error(getGujaratiErrorMessage(err, gujaratiToast.pdfError), {
        id: toastId,
      });
    } finally {
      setDownloadingHistoryDate(null);
      setDownloadingPDF(false);
    }
  };

  const downloadPDF = () => {
    downloadPDFForDate(testDate);
  };

  const handleViewHistoryTest = (date) => {
    setPreviewModalDate(date);
    setIsPreviewModalOpen(true);
  };

  const canSave =
    Boolean(standard) &&
    Boolean(testDate) &&
    Boolean(globalSubject) &&
    Boolean(globalTotalMarks) &&
    students.length > 0 &&
    !savingMarks;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 pb-28 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* PWA Mobile Install Banner */}
        <InstallPwaBanner />

        {/* Navigation & Header Bar */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & Brand */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    માર્ક્સ એન્ટ્રી ડેશબોર્ડ
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    વર્ગ મુજબ ટેસ્ટના ગુણ અને હાજરી મેનેજ કરો
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Grid (2x2 on Mobile, 4-Across on Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full lg:w-auto">
              {/* Button 1: Standards & Subjects */}
              <button
                type="button"
                onClick={() => setIsManageModalOpen(true)}
                className="h-11 px-3 inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200/80 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer touch-target whitespace-nowrap"
                title="ધોરણ અને વિષય મેનેજ કરો"
              >
                <Layers className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                <span>ધોરણ / વિષય</span>
              </button>

              {/* Button 2: Add Student */}
              <Link
                to="/add-student"
                className="h-11 px-3 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer touch-target whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4 flex-shrink-0" />
                <span>વિદ્યાર્થી ઉમેરો</span>
              </Link>

              {/* Button 3: View Students List */}
              <Link
                to="/students"
                className="h-11 px-3 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200/90 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer touch-target whitespace-nowrap"
              >
                <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>વિદ્યાર્થી યાદી</span>
              </Link>

              {/* Button 4: Logout */}
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Global Controls Card (Responsive Grid) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="h-4 w-4" />
              </span>
              <span>ટેસ્ટ વિગતો (Test Configuration)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Class Standard Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ધોરણ (Class) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full h-11 px-3.5 pr-9 border border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="">ધોરણ પસંદ કરો</option>
                  {standardNames.map((std) => (
                    <option key={std} value={std}>
                      {std}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Test Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ટેસ્ટ તારીખ (Date) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full h-11 px-3.5 border border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Global Subject Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                વિષય (Subject) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={globalSubject}
                  onChange={(e) => setGlobalSubject(e.target.value)}
                  disabled={!standard}
                  className="w-full h-11 px-3.5 pr-9 border border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all appearance-none disabled:opacity-50 disabled:bg-slate-100 cursor-pointer"
                >
                  <option value="">વિષય પસંદ કરો</option>
                  {subjectsByStandard[standard]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Global Total Marks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                કુલ ગુણ (Total Marks) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="દા.ત. 25, 50, 100"
                value={globalTotalMarks}
                onChange={(e) =>
                  setGlobalTotalMarks(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                min="1"
                className="w-full h-11 px-3.5 border border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Students List Card */}
        {standard && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>વિદ્યાર્થીઓની યાદી ({standard})</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {students.length} વિદ્યાર્થીઓ
                </span>
              </h2>
              {loadingStudents && (
                <div className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1.5" />
                  લોડ થઈ રહ્યું છે...
                </div>
              )}
            </div>

            {students.length === 0 && !loadingStudents ? (
              <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-700 font-semibold text-sm">
                  ધોરણ {standard} માં કોઈ વિદ્યાર્થી મળ્યા નથી
                </p>
                <p className="text-slate-400 text-xs mt-1 mb-4">
                  માર્ક્સ દાખલ કરવા માટે પહેલા વિદ્યાર્થીઓ ઉમેરો
                </p>
                <Link
                  to="/add-student"
                  className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  વિદ્યાર્થી ઉમેરો
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student, index) => {
                  const isAbsent = Boolean(absentByStudent[student._id]);
                  const isSpecial = Boolean(specialByStudent[student._id]);
                  const obtainedMarks = marksByStudent[student._id];
                  const totalMarks = isSpecial
                    ? totalMarksByStudent[student._id] || globalTotalMarks
                    : globalTotalMarks;
                  const subject = isSpecial
                    ? subjectByStudent[student._id] || globalSubject
                    : globalSubject;

                  return (
                    <div
                      key={student._id}
                      className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                        isAbsent
                          ? "border-rose-200 bg-rose-50/60 shadow-xs"
                          : isSpecial
                          ? "border-purple-200 bg-purple-50/50 shadow-xs"
                          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/30"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                        {/* Student Name & Index */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs sm:text-sm font-bold text-slate-700 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                {student.name}
                              </h3>
                              {student.isWeak && (
                                <span className="text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex-shrink-0">
                                  સુધારો જરૂરી
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              {subject && (
                                <span className="text-slate-600 bg-slate-100/90 font-medium px-2 py-0.5 rounded">
                                  {subject}
                                </span>
                              )}
                              {isAbsent && (
                                <span className="text-rose-700 font-bold">
                                  ગેરહાજર (Absent)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Marks Input and Toggle Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {/* Marks Input */}
                          {!isAbsent && (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                placeholder="ગુણ"
                                value={
                                  obtainedMarks !== undefined &&
                                  obtainedMarks !== null
                                    ? obtainedMarks
                                    : ""
                                }
                                onChange={(e) =>
                                  handleMarkChange(student._id, e.target.value)
                                }
                                min="0"
                                max={totalMarks || 100}
                                className="w-20 sm:w-24 h-10 px-2.5 text-center border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-sm font-extrabold text-slate-900 bg-white shadow-2xs"
                              />
                              {totalMarks && (
                                <span className="text-xs sm:text-sm font-semibold text-slate-500 whitespace-nowrap">
                                  / {totalMarks}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Buttons with Proper Sizes */}
                          <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            {/* Absent Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleAbsent(student._id)}
                              className={`h-10 px-3 sm:px-3.5 inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all border active:scale-[0.98] cursor-pointer touch-target ${
                                isAbsent
                                  ? "bg-rose-100/90 text-rose-800 border-rose-300 shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                              }`}
                              title={isAbsent ? "હાજર તરીકે સેટ કરો" : "ગેરહાજર તરીકે સેટ કરો"}
                            >
                              {isAbsent ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-1 text-rose-600" />
                                  <span>ગેરહાજર</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1 text-emerald-600" />
                                  <span>હાજર</span>
                                </>
                              )}
                            </button>

                            {/* Special Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleSpecial(student._id)}
                              className={`h-10 px-3 sm:px-3.5 inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all border active:scale-[0.98] cursor-pointer touch-target ${
                                isSpecial
                                  ? "bg-purple-100/90 text-purple-800 border-purple-300 shadow-xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                              }`}
                              title="કસ્ટમ વિષય કે ગુણ"
                            >
                              <Award className="h-4 w-4 mr-1 text-purple-600" />
                              <span>ખાસ (Special)</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Special Settings Drawer */}
                      {isSpecial && (
                        <div className="mt-3 pt-3 border-t border-purple-200/80">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-purple-900 mb-1">
                                અલગ વિષય (Custom Subject)
                              </label>
                              <select
                                value={subjectByStudent[student._id] || ""}
                                onChange={(e) =>
                                  setSubjectByStudent((prev) => ({
                                    ...prev,
                                    [student._id]: e.target.value,
                                  }))
                                }
                                className="w-full h-9 px-2.5 border border-purple-300 rounded-lg text-xs font-medium bg-white outline-none"
                              >
                                <option value="">વિષય પસંદ કરો</option>
                                {subjectsByStandard[standard]?.map((sub) => (
                                  <option key={sub} value={sub}>
                                    {sub}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-purple-900 mb-1">
                                અલગ કુલ ગુણ (Custom Total)
                              </label>
                              <input
                                type="number"
                                placeholder="દા.ત. 50"
                                value={totalMarksByStudent[student._id] || ""}
                                onChange={(e) =>
                                  setTotalMarksByStudent((prev) => ({
                                    ...prev,
                                    [student._id]:
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                                  }))
                                }
                                className="w-full h-9 px-2.5 border border-purple-300 rounded-lg text-xs font-medium bg-white outline-none"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-purple-900 mb-1">
                                વર્તમાન ગુણ
                              </label>
                              <div className="h-9 px-3 flex items-center bg-purple-100/50 rounded-lg text-xs font-bold text-purple-900">
                                {obtainedMarks !== undefined && obtainedMarks !== null
                                  ? obtainedMarks
                                  : "0"}{" "}
                                /{" "}
                                {totalMarksByStudent[student._id] ||
                                  globalTotalMarks ||
                                  "-"}
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

        {/* Action Buttons Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm sm:text-base shadow-md shadow-indigo-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer touch-target"
          >
            {savingMarks ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                માર્ક્સ સેવ થઈ રહ્યા છે...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                બધા માર્ક્સ સેવ કરો (Save All Marks)
              </>
            )}
          </button>

          {testDate && (
            <button
              type="button"
              onClick={downloadPDF}
              disabled={downloadingPDF}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm sm:text-base shadow-md shadow-emerald-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer touch-target"
            >
              {downloadingPDF ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  PDF બની રહી છે...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  PDF ડાઉનલોડ કરો (Download PDF)
                </>
              )}
            </button>
          )}
        </div>

        {/* Preview Section */}
        {Object.keys(previewData).length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Calendar className="h-4 w-4" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {testDate} માટે રિપોર્ટ પ્રીવ્યૂ
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {Object.keys(previewData).length} વર્ગ
              </span>
            </div>

            <div className="space-y-6">
              {Object.entries(previewData).map(([std, rows]) => (
                <div key={std} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      {std}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      {rows.length} વિદ્યાર્થી
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="p-3 pl-4">વિદ્યાર્થી નામ</th>
                          <th className="p-3">વિષય</th>
                          <th className="p-3">મેળવેલ ગુણ</th>
                          <th className="p-3 pr-4 text-right">સ્થિતિ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 pl-4 font-semibold text-slate-900">
                              {row.name}
                            </td>
                            <td className="p-3 text-slate-600">{row.subject}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {row.marks === "ABSENT" ? (
                                <span className="text-slate-400 font-normal">—</span>
                              ) : (
                                row.marks
                              )}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              {row.marks === "ABSENT" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  ગેરહાજર
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  હાજર
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
          </div>
        )}

        {/* 🕒 Last 3 Test History Section (At bottom of dashboard) */}
        <RecentTestHistory
          onViewTest={handleViewHistoryTest}
          onDownloadPDF={downloadPDFForDate}
          downloadingDate={downloadingHistoryDate}
          refreshTrigger={historyRefreshTrigger}
        />
      </div>

      {/* 📱 Sticky Mobile Bottom Quick Save Bar (Visible when standard is chosen) */}
      {standard && students.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 md:hidden shadow-lg flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="flex-1 h-12 inline-flex items-center justify-center bg-indigo-600 active:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 shadow-sm"
          >
            {savingMarks ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                <span>માર્ક્સ સેવ કરો</span>
              </>
            )}
          </button>
          {testDate && (
            <button
              type="button"
              onClick={downloadPDF}
              disabled={downloadingPDF}
              className="h-12 px-4 inline-flex items-center justify-center bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 shadow-sm"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Standards & Subjects Management Modal */}
      <ManageStandardsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />

      {/* Test Preview Modal for viewing test breakdown */}
      <TestPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewModalDate(null);
        }}
        testDate={previewModalDate}
        onDownloadPDF={downloadPDFForDate}
        downloadingPDF={downloadingHistoryDate === previewModalDate}
      />
    </div>
  );
};

export default Dashboard;
