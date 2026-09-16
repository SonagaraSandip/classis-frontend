import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Download,
  Calendar,
  Users,
  Search,
  CheckCircle,
  XCircle,
  BookOpen,
  Award,
  Layers,
  Filter,
} from "lucide-react";
import API from "../api/api";
import { buildClassWiseDataWithAbsent } from "../utils/pdfUtils";
import { getGujaratiErrorMessage } from "../utils/gujaratiMessages";
import toast from "react-hot-toast";

const TestPreviewModal = ({
  isOpen,
  onClose,
  testDate,
  onDownloadPDF,
  downloadingPDF = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("ALL");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !testDate) {
      setData({});
      setSearchQuery("");
      setSelectedStandard("ALL");
      return;
    }

    let isMounted = true;
    const fetchTestData = async () => {
      setLoading(true);
      try {
        const res = await API.get(
          `/marks/pdf-by-date?testDate=${encodeURIComponent(testDate)}`
        );
        if (!isMounted) return;
        if (!res.data?.tests?.length) {
          setData({});
          return;
        }
        setData(buildClassWiseDataWithAbsent(res.data));
      } catch (err) {
        if (isMounted) {
          toast.error(
            getGujaratiErrorMessage(err, "ટેસ્ટ પ્રીવ્યૂ લોડ કરવામાં સમસ્યા આવી.")
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTestData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, testDate]);

  // Compute summary stats
  const stats = useMemo(() => {
    const standards = Object.keys(data);
    let totalStudents = 0;
    let presentCount = 0;
    let absentCount = 0;

    standards.forEach((std) => {
      const rows = data[std] || [];
      rows.forEach((row) => {
        totalStudents++;
        if (row.marks === "ABSENT") {
          absentCount++;
        } else {
          presentCount++;
        }
      });
    });

    return {
      standardsCount: standards.length,
      totalStudents,
      presentCount,
      absentCount,
      standards,
    };
  }, [data]);

  // Filtered rows based on selected standard and search query
  const filteredData = useMemo(() => {
    const result = {};
    const query = searchQuery.trim().toLowerCase();

    Object.entries(data).forEach(([std, rows]) => {
      if (selectedStandard !== "ALL" && selectedStandard !== std) {
        return;
      }

      const matchingRows = rows.filter((row) => {
        if (!query) return true;
        return (
          row.name?.toLowerCase().includes(query) ||
          row.subject?.toLowerCase().includes(query)
        );
      });

      if (matchingRows.length > 0 || !query) {
        result[std] = matchingRows;
      }
    });

    return result;
  }, [data, selectedStandard, searchQuery]);

  if (!isOpen) return null;

  // Format date display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("gu-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-extrabold text-white">
                    ટેસ્ટ રિપોર્ટ પ્રીવ્યૂ
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {testDate}
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                  {formatDateDisplay(testDate)} • જય માતાજી ટ્યુશન ક્લાસીસ
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {onDownloadPDF && (
                <button
                  type="button"
                  onClick={() => onDownloadPDF(testDate)}
                  disabled={downloadingPDF}
                  className="h-10 px-3 sm:px-4 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer touch-target whitespace-nowrap"
                  title="PDF ડાઉનલોડ કરો"
                >
                  {downloadingPDF ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">PDF ડાઉનલોડ</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="h-10 w-10 inline-flex items-center justify-center text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer touch-target"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-3 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] font-medium text-slate-300 block">
                કુલ ધોરણ
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                {stats.standardsCount} વર્ગ
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] font-medium text-slate-300 block">
                કુલ વિદ્યાર્થી
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                {stats.totalStudents}
              </span>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] font-medium text-emerald-200 block">
                હાજર (Present)
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-300">
                {stats.presentCount}
              </span>
            </div>
            <div className="bg-rose-500/20 border border-rose-400/30 rounded-xl p-2.5 sm:p-3">
              <span className="text-[11px] font-medium text-rose-200 block">
                ગેરહાજર (Absent)
              </span>
              <span className="text-base sm:text-lg font-black text-rose-300">
                {stats.absentCount}
              </span>
            </div>
          </div>
        </div>

        {/* Controls Bar: Class Filters & Search */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
          {/* Class Standard Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedStandard("ALL")}
              className={`h-9 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedStandard === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              બધા ({stats.totalStudents})
            </button>
            {stats.standards.map((std) => {
              const count = data[std]?.length || 0;
              return (
                <button
                  key={std}
                  type="button"
                  onClick={() => setSelectedStandard(std)}
                  className={`h-9 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedStandard === std
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {std} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="વિદ્યાર્થી અથવા વિષય શોધો..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-xs font-medium bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body / Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-600 font-semibold text-sm">
                ટેસ્ટ ડેટા લોડ થઈ રહ્યો છે...
              </p>
            </div>
          ) : Object.keys(filteredData).length === 0 ? (
            <div className="py-14 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">
                કોઈ વિદ્યાર્થી અથવા ગુણ રેકોર્ડ મળ્યો નથી
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {searchQuery
                  ? "શોધ ફિલ્ટર બદલીને ફરી તપાસો."
                  : "આ તારીખ માટે કોઈ ટેસ્ટ માર્ક્સ ઉપલબ્ધ નથી."}
              </p>
            </div>
          ) : (
            Object.entries(filteredData).map(([std, rows]) => (
              <div
                key={std}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white"
              >
                {/* Standard Section Header */}
                <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold">
                      <Layers className="h-4 w-4" />
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {std}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {rows.length} વિદ્યાર્થીઓ
                  </span>
                </div>

                {/* Table for Desktop & Mobile Cards */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="p-3 pl-4 w-12 text-center">#</th>
                        <th className="p-3">વિદ્યાર્થી નું નામ</th>
                        <th className="p-3">વિષય</th>
                        <th className="p-3">ગુણ (Marks)</th>
                        <th className="p-3 pr-4 text-right">હાજરી / સ્થિતિ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row, idx) => {
                        const isAbsent = row.marks === "ABSENT";
                        return (
                          <tr
                            key={row.studentId || idx}
                            className={`transition-colors ${
                              isAbsent
                                ? "bg-rose-50/40 hover:bg-rose-50/70"
                                : "hover:bg-slate-50/70"
                            }`}
                          >
                            <td className="p-3 pl-4 text-center font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-bold text-slate-900">
                              {row.name}
                            </td>
                            <td className="p-3">
                              <span className="text-slate-700 font-medium px-2 py-0.5 rounded bg-slate-100 text-xs">
                                {row.subject}
                              </span>
                            </td>
                            <td className="p-3">
                              {isAbsent ? (
                                <span className="text-slate-400 font-semibold">
                                  —
                                </span>
                              ) : (
                                <span className="font-black text-slate-900 text-sm">
                                  {row.marks}
                                </span>
                              )}
                            </td>
                            <td className="p-3 pr-4 text-right">
                              {isAbsent ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                  <XCircle className="h-3 w-3 mr-1 text-rose-600" />
                                  ગેરહાજર
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
                                  હાજર
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            તમે ઉપર આપેલા બટન પર ક્લિક કરીને PDF રિપોર્ટ ડાઉનલોડ કરી શકો છો.
          </p>
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            {onDownloadPDF && (
              <button
                type="button"
                onClick={() => onDownloadPDF(testDate)}
                disabled={downloadingPDF}
                className="flex-1 sm:flex-none h-11 px-4 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer touch-target"
              >
                {downloadingPDF ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>PDF ડાઉનલોડ કરો</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors cursor-pointer touch-target"
            >
              બંધ કરો (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPreviewModal;
