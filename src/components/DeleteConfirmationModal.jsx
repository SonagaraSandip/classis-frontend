import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  studentName = "",
  studentStandard = "",
  loading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-7 overflow-hidden z-10 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 touch-target"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          {/* Warning Icon Badge */}
          <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 shadow-2xs">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              વિદ્યાર્થી ડિલીટ કરો
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              શું તમે ખરેખર{" "}
              <span className="font-bold text-slate-900">
                "{studentName}"
              </span>{" "}
              ને ડિલીટ કરવા માંગો છો?
            </p>
          </div>
        </div>

        {/* Warning details */}
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1.5 text-rose-900">
            <span>⚠️</span> ચેતવણી: આ માહિતી કાયમ માટે હટી જશે
          </p>
          <p>
            {studentStandard ? `ધોરણ: ${studentStandard}. ` : ""}
            આ વિદ્યાર્થીના તમામ ટેસ્ટ માર્ક્સ અને હાજરીનો રેકોર્ડ કાયમ માટે ડિલીટ થઈ જશે.
          </p>
        </div>

        {/* Action Buttons with Proper Sizing */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer touch-target"
          >
            ના, રદ કરો (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto h-11 inline-flex items-center justify-center px-5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-target"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ડિલીટ થઈ રહ્યું છે...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                હા, ડિલીટ કરો (Delete)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
