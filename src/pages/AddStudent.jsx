import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Book, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import { subjectsByStandard } from "../utils/subjectsByStandard";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const AddStudent = () => {
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ડેશબોર્ડ પર પાછા જાઓ (Back to Dashboard)
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 mb-6">
          <div className="flex items-center mb-1">
            <div className="h-12 w-12 bg-blue-100/80 rounded-xl flex items-center justify-center mr-4 text-blue-600 shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                નવો વિદ્યાર્થી ઉમેરો (Add Student)
              </h1>
              <p className="text-gray-600 text-xs mt-0.5">
                સિસ્ટમમાં નવા વિદ્યાર્થીની નોંધણી કરો
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Name Field */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <User className="h-3.5 w-3.5 inline mr-1 text-blue-600" />
                વિદ્યાર્થીનું પૂરું નામ (Full Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="વિદ્યાર્થીનું નામ લખો (e.g. રાહુલ શર્મા)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white"
                required
                autoFocus
              />
            </div>

            {/* Standard Field */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <Book className="h-3.5 w-3.5 inline mr-1 text-blue-600" />
                ધોરણ (Class Standard) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none text-sm bg-white cursor-pointer"
                  required
                >
                  <option value="">ધોરણ પસંદ કરો (Select Class)</option>
                  {Object.keys(subjectsByStandard).map((std) => (
                    <option key={std} value={std}>
                      {std}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name.trim() || !standard}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-sm text-sm"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ઉમેરાઈ રહ્યું છે...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  વિદ્યાર્થી ઉમેરો (Add Student)
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Options */}
        <div className="mt-6 text-center">
          <Link
            to="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            <User className="h-4 w-4 mr-2" />
            બધા વિદ્યાર્થીઓ જુઓ (View All Students)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;