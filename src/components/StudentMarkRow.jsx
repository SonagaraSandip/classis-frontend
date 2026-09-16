import React, { memo } from "react";
import { CheckCircle, XCircle, Award } from "lucide-react";

const StudentMarkRow = ({
  student,
  index,
  isAbsent,
  isSpecial,
  obtainedMarks,
  totalMarks,
  subject,
  subjectsList = [],
  customSubject = "",
  customTotal = "",
  onMarkChange,
  onToggleAbsent,
  onToggleSpecial,
  onCustomSubjectChange,
  onCustomTotalChange,
}) => {
  return (
    <div
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
                  obtainedMarks !== undefined && obtainedMarks !== null
                    ? obtainedMarks
                    : ""
                }
                onChange={(e) => onMarkChange(student._id, e.target.value)}
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
              onClick={() => onToggleAbsent(student._id)}
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
              onClick={() => onToggleSpecial(student._id)}
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
                value={customSubject}
                onChange={(e) => onCustomSubjectChange(student._id, e.target.value)}
                className="w-full h-9 px-2.5 border border-purple-300 rounded-lg text-xs font-medium bg-white outline-none"
              >
                <option value="">વિષય પસંદ કરો</option>
                {subjectsList.map((sub) => (
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
                value={customTotal}
                onChange={(e) =>
                  onCustomTotalChange(
                    student._id,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
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
                / {customTotal || totalMarks || "-"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(StudentMarkRow);
