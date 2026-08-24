import React, { useState, useEffect } from "react";
import { User, Book, Edit3, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { subjectsByStandard } from "../utils/subjectsByStandard";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const EditStudentModal = ({
  isOpen,
  onClose,
  onSave,
  student = null,
  loading = false,
}) => {
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
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              વિદ્યાર્થીની વિગત સુધારો (Edit Student)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              નામ અથવા ધોરણ બદલવા માટે નીચેની વિગતો સુધારો
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <User className="h-3.5 w-3.5 inline mr-1 text-blue-600" />
              વિદ્યાર્થીનું નામ (Full Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="વિદ્યાર્થીનું પૂરું નામ લખો (e.g. રાહુલ શર્મા)"
              disabled={loading}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-50 bg-white"
              required
              autoFocus
            />
          </div>

          {/* Class Standard Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Book className="h-3.5 w-3.5 inline mr-1 text-blue-600" />
              ધોરણ (Class Standard) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none disabled:bg-gray-50 bg-white cursor-pointer"
                required
              >
                <option value="">ધોરણ પસંદ કરો (Select Class)</option>
                {Object.keys(subjectsByStandard).map((std) => (
                  <option key={std} value={std}>
                    {std}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-gray-100 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors disabled:opacity-50"
            >
              રદ કરો (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !standard}
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  સેવ થઈ રહ્યું છે...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  સુધારો સાચવો (Save Changes)
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
