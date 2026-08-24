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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 overflow-hidden z-10 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          {/* Warning Icon Badge */}
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 shadow-sm">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-gray-900">
              વિદ્યાર્થી ડિલીટ કરો (Delete Student)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              શું તમે ખરેખર{" "}
              <span className="font-semibold text-gray-900">
                "{studentName}"
              </span>{" "}
              ને ડિલીટ કરવા માંગો છો?
            </p>
          </div>
        </div>

        {/* Warning details */}
        <div className="mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 leading-relaxed">
          <p className="font-semibold mb-1 flex items-center gap-1.5 text-red-800">
            <span>⚠️</span> ચેતવણી: આ માહિતી કાયમ માટે હટી જશે
          </p>
          <p>
            {studentStandard ? `ધોરણ: ${studentStandard}. ` : ""}
            આ વિદ્યાર્થીના તમામ ટેસ્ટ માર્ક્સ અને હાજરીનો રેકોર્ડ કાયમ માટે ડિલીટ થઈ જશે.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50"
          >
            ના, રદ કરો (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ડિલીટ થઈ રહ્યું છે...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
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
