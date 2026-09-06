import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Book, Plus, ArrowLeft, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import { useStandards } from "../context/StandardContext";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const AddStudent = () => {
  const { standardNames } = useStandards();
  const [name, setName] = useState("");
  const [standard, setStandard] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      await API.post("/students", {
        name: name.trim(),
        standard,
      });

      toast.success(gujaratiToast.studentAdded);
      setName("");
      setStandard("");
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err, "વિદ્યાર્થી ઉમેરવામાં સમસ્યા આવી."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-lg space-y-5 sm:space-y-6">
        {/* Back Button */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>પાછા જાઓ (Back)</span>
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                નવો વિદ્યાર્થી ઉમેરો (Add Student)
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                સિસ્ટમમાં નવા વિદ્યાર્થીની નોંધણી કરો
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                વિદ્યાર્થીનું પૂરું નામ (Full Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="વિદ્યાર્થીનું નામ લખો (e.g. રાહુલ શર્મા)"
                  className="w-full h-12 px-4 pl-11 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                  required
                  autoFocus
                  disabled={loading}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Standard Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                ધોરણ (Class Standard) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full h-12 px-4 pl-11 pr-10 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 appearance-none cursor-pointer"
                  required
                  disabled={loading}
                >
                  <option value="">ધોરણ પસંદ કરો (Select Class)</option>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name.trim() || !standard}
              className="w-full h-12 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer touch-target mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ઉમેરાઈ રહ્યું છે...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>વિદ્યાર્થી ઉમેરો (Add Student)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Directory Link */}
        <div className="text-center">
          <Link
            to="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm transition-colors"
          >
            <User className="h-4 w-4 mr-1.5" />
            <span>બધા વિદ્યાર્થીઓ જુઓ (View All Students)</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;