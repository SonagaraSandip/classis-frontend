import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  Award,
  TrendingUp,
  Percent,
  Phone,
  GraduationCap,
  Sparkles,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import EditStudentModal from "../components/EditStudentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600 text-white shadow-blue-500/25",
  "from-violet-500 to-purple-600 text-white shadow-violet-500/25",
  "from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
  "from-amber-500 to-orange-600 text-white shadow-amber-500/25",
  "from-rose-500 to-pink-600 text-white shadow-rose-500/25",
  "from-cyan-500 to-blue-600 text-white shadow-cyan-500/25",
];

const getAvatarGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/students/${id}/profile`);
      setStudent(res.data.student);
      setHistory(res.data.history || []);
      setStatsData(res.data.stats || null);
    } catch (err) {
      setError(getGujaratiErrorMessage(err, "વિદ્યાર્થીની માહિતી લાવવામાં સમસ્યા આવી."));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Save
  const handleSaveEdit = async (updatedData) => {
    setActionLoading(true);
    try {
      const res = await API.put(`/students/${updatedData._id}`, {
        name: updatedData.name,
        standard: updatedData.standard,
      });

      setStudent(res.data);
      toast.success(gujaratiToast.studentUpdated);
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Confirm
  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await API.delete(`/students/${id}`);
      toast.success(gujaratiToast.studentDeleted(student?.name));
      setIsDeleteOpen(false);
      navigate("/students");
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err));
      setActionLoading(false);
    }
  };

  // Performance calculations
  const analytics = useMemo(() => {
    const totalTests = history.length;
    const presentTests = history.filter((row) => row.status === "PRESENT").length;
    const absentTests = totalTests - presentTests;
    const attendanceRate = totalTests > 0 ? Math.round((presentTests / totalTests) * 100) : 0;

    let totalPossible = 0;
    let totalObtained = 0;

    history.forEach((row) => {
      if (row.status === "PRESENT" && Number.isFinite(row.obtainedMarks)) {
        totalPossible += row.totalMarks || 0;
        totalObtained += row.obtainedMarks || 0;
      }
    });

    const averageScore = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : null;

    let grade = { label: "N/A", textGu: "માહિતી નથી", color: "text-slate-600 bg-slate-100 border-slate-200" };
    if (averageScore !== null) {
      if (averageScore >= 80) {
        grade = { label: "A+ (Excellent)", textGu: "ઉત્કૃષ્ટ", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
      } else if (averageScore >= 60) {
        grade = { label: "B (Good)", textGu: "સારું", color: "text-blue-700 bg-blue-50 border-blue-200" };
      } else if (averageScore >= 40) {
        grade = { label: "C (Average)", textGu: "સામાન્ય", color: "text-amber-700 bg-amber-50 border-amber-200" };
      } else {
        grade = { label: "Needs Help", textGu: "સુધારો જરૂરી", color: "text-rose-700 bg-rose-50 border-rose-200" };
      }
    }

    return {
      totalTests,
      presentTests,
      absentTests,
      attendanceRate,
      totalPossible,
      totalObtained,
      averageScore,
      grade,
    };
  }, [history]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          {/* Skeleton Nav */}
          <div className="flex justify-between items-center">
            <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
              <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
            </div>
          </div>

          {/* Skeleton Hero */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-slate-200 rounded-2xl"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
                <div className="h-4 w-28 bg-slate-100 rounded-md"></div>
              </div>
            </div>
          </div>

          {/* Skeleton KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 h-24"></div>
            ))}
          </div>

          {/* Skeleton Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64"></div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            વિદ્યાર્થી મળ્યો નથી (Student Not Found)
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">
            {error || "વિનંતી કરેલ વિદ્યાર્થીનો રેકોર્ડ ઉપલબ્ધ નથી અથવા ડિલીટ થઈ ગયો છે."}
          </p>
          <Link
            to="/students"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            વિદ્યાર્થી યાદી પર પાછા જાઓ
          </Link>
        </div>
      </div>
    );
  }

  const avatarGradient = getAvatarGradient(student.name);

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/students"
            className="inline-flex items-center text-slate-600 hover:text-indigo-600 font-medium text-xs sm:text-sm transition-colors group"
          >
            <span className="p-1 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-300 mr-2 shadow-2xs">
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            વિદ્યાર્થી યાદી (Students Directory)
          </Link>

          {/* Quick Actions (Mobile Optimized) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 sm:py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-2xs touch-target"
            >
              <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-amber-600" />
              સુધારો (Edit)
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 sm:py-2.5 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 active:bg-rose-200 text-rose-600 font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-2xs touch-target"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              ડિલીટ (Delete)
            </button>
          </div>
        </div>

        {/* Student Profile Card (Hero) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7 bg-gradient-to-r from-indigo-500/8 via-blue-500/5 to-transparent border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Student Identity */}
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Colorful Avatar */}
                <div
                  className={`h-14 w-14 sm:h-18 sm:w-18 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl sm:text-2xl font-bold shadow-md flex-shrink-0 ${avatarGradient}`}
                >
                  {student.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 truncate">
                      {student.name}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                      <GraduationCap className="h-3.5 w-3.5 mr-1" />
                      {student.standard}
                    </span>

                    {student.parentPhone && (
                      <a
                        href={`tel:${student.parentPhone}`}
                        className="inline-flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        <span>{student.parentPhone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto flex items-center">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${analytics.grade.color}`}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {analytics.grade.textGu} ({analytics.grade.label})
                </span>
              </div>
            </div>
          </div>

          {/* 4-Card Analytics Grid (Responsive: 2x2 on Mobile, 4x1 on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100 bg-white">
            {/* Total Tests */}
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                  કુલ ટેસ્ટ (Total Tests)
                </p>
                <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                  {analytics.totalTests}
                </p>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                  હાજરી દર (Attendance)
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg sm:text-2xl font-black text-slate-900">
                    {analytics.attendanceRate}%
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden xs:inline">
                    ({analytics.presentTests}/{analytics.totalTests})
                  </span>
                </div>
              </div>
            </div>

            {/* Average Marks */}
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                  સરેરાશ સ્કોર (Avg Score)
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg sm:text-2xl font-black text-slate-900">
                    {analytics.averageScore !== null ? `${analytics.averageScore}%` : "—"}
                  </span>
                  {analytics.totalPossible > 0 && (
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium hidden xs:inline">
                      ({analytics.totalObtained}/{analytics.totalPossible})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Absent Count */}
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
                  ગેરહાજરી (Absent)
                </p>
                <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">
                  {analytics.absentTests}{" "}
                  <span className="text-xs font-normal text-slate-500">ટેસ્ટ</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test History Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  ટેસ્ટ ઇતિહાસ (Test History)
                </h2>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {analytics.totalTests} રેકોર્ડ
            </span>
          </div>

          {/* Empty State */}
          {history.length === 0 ? (
            <div className="p-10 sm:p-14 text-center">
              <div className="h-16 w-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                કોઈ ટેસ્ટ રેકોર્ડ મળ્યો નથી
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
                આ વિદ્યાર્થી માટે હજુ સુધી કોઈપણ ટેસ્ટના માર્ક્સ દાખલ કરવામાં આવ્યા નથી.
              </p>
            </div>
          ) : (
            <>
              {/* 📱 MOBILE VIEW: Rich Card Feed (< 768px) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {history.map((row, index) => {
                  const isPresent = row.status === "PRESENT";
                  const pct = row.percentage ?? (isPresent && row.totalMarks > 0 ? Math.round((row.obtainedMarks / row.totalMarks) * 100) : null);

                  return (
                    <div
                      key={row.markId || index}
                      className="p-4 hover:bg-slate-50/60 active:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {/* Date Pill */}
                        <div className="flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Calendar className="h-3 w-3 mr-1.5 text-indigo-600" />
                          {row.testDate
                            ? new Date(row.testDate).toLocaleDateString("gu-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "તારીખ N/A"}
                        </div>

                        {/* Status Chip */}
                        {isPresent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            હાજર
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            ગેરહાજર
                          </span>
                        )}
                      </div>

                      {/* Subject and Marks */}
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm sm:text-base">
                            {row.subject}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {row.standard || student.standard}
                          </p>
                        </div>

                        <div className="text-right">
                          {isPresent ? (
                            <div>
                              <span className="text-base font-extrabold text-slate-900">
                                {row.obtainedMarks}{" "}
                                <span className="text-xs text-slate-400 font-medium">
                                  / {row.totalMarks}
                                </span>
                              </span>
                              {pct !== null && (
                                <span className="block text-[11px] font-bold text-indigo-600">
                                  {pct}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold text-sm">—</span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (Mobile) */}
                      {isPresent && pct !== null && (
                        <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 80
                                ? "bg-emerald-500"
                                : pct >= 60
                                  ? "bg-blue-500"
                                  : pct >= 40
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 💻 DESKTOP VIEW: Data Table (≥ 768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">પરીક્ષા તારીખ (Date)</th>
                      <th className="p-4">વિષય (Subject)</th>
                      <th className="p-4">મેળવેલ ગુણ (Marks)</th>
                      <th className="p-4">ટકાવારી (Score %)</th>
                      <th className="p-4 pr-6 text-right">હાજરી સ્થિતિ (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((row, index) => {
                      const isPresent = row.status === "PRESENT";
                      const pct = row.percentage ?? (isPresent && row.totalMarks > 0 ? Math.round((row.obtainedMarks / row.totalMarks) * 100) : null);

                      return (
                        <tr
                          key={row.markId || index}
                          className="hover:bg-indigo-50/30 transition-colors"
                        >
                          <td className="p-4 pl-6 font-semibold text-slate-900">
                            {row.testDate
                              ? new Date(row.testDate).toLocaleDateString("gu-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-900">{row.subject}</span>
                          </td>

                          <td className="p-4">
                            {isPresent ? (
                              <span className="font-extrabold text-slate-900 text-base">
                                {row.obtainedMarks}{" "}
                                <span className="text-xs text-slate-400 font-normal">
                                  / {row.totalMarks}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">—</span>
                            )}
                          </td>

                          <td className="p-4">
                            {isPresent && pct !== null ? (
                              <div className="flex items-center gap-2 max-w-[120px]">
                                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct >= 80
                                        ? "bg-emerald-500"
                                        : pct >= 60
                                          ? "bg-blue-500"
                                          : pct >= 40
                                            ? "bg-amber-500"
                                            : "bg-rose-500"
                                    }`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-700 w-9">
                                  {pct}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>

                          <td className="p-4 pr-6 text-right">
                            {isPresent ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                હાજર (Present)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                ગેરહાજર (Absent)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={isEditOpen}
        student={student}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        studentName={student?.name}
        studentStandard={student?.standard}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default StudentProfile;

