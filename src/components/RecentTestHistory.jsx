import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Eye,
  Download,
  History,
  RotateCcw,
} from "lucide-react";
import API from "../api/api";

const RecentTestHistory = ({
  onViewTest,
  onDownloadPDF,
  downloadingDate = null,
  refreshTrigger = 0,
}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/tests/history?limit=3");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load test history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  // Format date to Gujarati readable string
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split("-");
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("gu-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>છેલ્લા ૩ ટેસ્ટનો ઇતિહાસ</span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Recent 3 Tests
              </span>
            </h2>
            <p className="text-slate-500 text-xs">
              તારીખ મુજબ ટેસ્ટ પ્રીવ્યૂ જુઓ અને PDF ડાઉનલોડ કરો
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          className="h-9 px-3 inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 border border-slate-200/90 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 touch-target"
          title="રીફ્રેશ કરો"
        >
          <RotateCcw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`}
          />
          <span className="hidden sm:inline">રીફ્રેશ</span>
        </button>
      </div>

      {/* Content */}
      {loading && history.length === 0 ? (
        <div className="py-10 text-center">
          <div className="h-7 w-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">
            ટેસ્ટ ઇતિહાસ લોડ થઈ રહ્યો છે...
          </p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-5">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-700 font-bold text-xs sm:text-sm">
            હજુ સુધી કોઈ ટેસ્ટ રેકોર્ડ નથી
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            ઉપર આપેલા ફોર્મમાંથી ટેસ્ટ માર્ક્સ સેવ કરશો એટલે અહીં ઇતિહાસ દેખાશે
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {history.map((item, idx) => {
            const isThisDownloading = downloadingDate === item.testDate;
            const displayDate = formatDisplayDate(item.testDate);

            return (
              <div
                key={item.testDate || idx}
                className="group bg-slate-50/60 hover:bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Date Display */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-2xs font-bold">
                    <Calendar className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {displayDate}
                      </h3>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.testDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons (View & Download) */}
                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto">
                  {/* View Button */}
                  <button
                    type="button"
                    onClick={() => onViewTest(item.testDate)}
                    className="flex-1 sm:flex-none h-10 px-4 inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200/90 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer touch-target whitespace-nowrap"
                    title="ટેસ્ટ રિપોર્ટ જુઓ"
                  >
                    <Eye className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    <span>જોવો (View)</span>
                  </button>

                  {/* Download PDF Button */}
                  <button
                    type="button"
                    onClick={() => onDownloadPDF(item.testDate)}
                    disabled={isThisDownloading}
                    className="flex-1 sm:flex-none h-10 px-4 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-60 cursor-pointer touch-target whitespace-nowrap"
                    title="PDF ડાઉનલોડ કરો"
                  >
                    {isThisDownloading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>ડાઉનલોડ...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 flex-shrink-0" />
                        <span>ડાઉનલોડ PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTestHistory;
