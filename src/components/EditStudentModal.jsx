import React, { useState, useEffect } from "react";
import { User, Book, Edit3, X, Save, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useStandards } from "../context/StandardContext";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const EditStudentModal = ({
  isOpen,
  onClose,
  onSave,
  student = null,
  loading = false,
}) => {
  const { standardNames } = useStandards();
  const [name, setName] = useState("");
  const [standard, setStandard] = useState("");

  // Sync state whenever student changes or modal opens
  useEffect(() => {
    if (student && isOpen) {
      setName(student.name || "");
      setStandard(student.standard || "");
    }
  }, [student, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(gujaratiToast.enterName);
      return;
    }

    if (!standard) {
      toast.error(gujaratiToast.selectStandard);
      return;
    }

    // Check if there are actual changes
    if (name.trim() === student.name && standard === student.standard) {
      onClose();
      return;
    }

    try {
      await onSave({
        _id: student._id,
        name: name.trim(),
        standard,
      });
    } catch (err) {
      toast.error(getGujaratiErrorMessage(err));
    }
  };

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

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              વિદ્યાર્થીની વિગત સુધારો
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              નામ અથવા ધોરણ બદલવા માટે વિગતો સુધારો
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              વિદ્યાર્થીનું નામ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="વિદ્યાર્થીનું પૂરું નામ લખો"
                disabled={loading}
                className="w-full h-11 px-3.5 pl-10 border border-slate-300 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all disabled:bg-slate-50 bg-white text-slate-800"
                required
                autoFocus
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Class Standard Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              ધોરણ (Class Standard) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                disabled={loading}
                className="w-full h-11 px-3.5 pl-10 pr-9 border border-slate-300 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all appearance-none disabled:bg-slate-50 bg-white text-slate-800 cursor-pointer"
                required
              >
                <option value="">ધોરણ પસંદ કરો</option>
                {standardNames.map((std) => (
                  <option key={std} value={std}>
                    {std}
                  </option>
                ))}
              </select>
              <Book className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Action Buttons with Proper Sizing and Mobile Layout */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer touch-target"
            >
              રદ કરો (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !standard}
              className="w-full sm:w-auto h-11 inline-flex items-center justify-center px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-target"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  સેવ થઈ રહ્યું છે...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  સુધારો સાચવો (Save)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
