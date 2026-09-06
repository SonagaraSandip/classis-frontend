import React, { useState, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { useStandards } from "../context/StandardContext";
import toast from "react-hot-toast";

const ManageStandardsModal = ({ isOpen, onClose }) => {
  const {
    standardsList,
    subjectsByStandard,
    addStandard,
    addSubject,
    removeSubject,
    deleteStandard,
    loading,
  } = useStandards();

  // Create Standard Form State
  const [showAddStdForm, setShowAddStdForm] = useState(false);
  const [newStdName, setNewStdName] = useState("");
  const [initialSubjectsInput, setInitialSubjectsInput] = useState("");
  const [addingStd, setAddingStd] = useState(false);

  // New Subject Input state per standard: { [stdId]: "subjectName" }
  const [newSubjectInputs, setNewSubjectInputs] = useState({});
  const [addingSubjectFor, setAddingSubjectFor] = useState(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered standards
  const filteredStandards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return standardsList;

    return standardsList.filter((std) => {
      const nameMatch = std.name.toLowerCase().includes(q);
      const subjectMatch = std.subjects?.some((sub) =>
        sub.toLowerCase().includes(q)
      );
      return nameMatch || subjectMatch;
    });
  }, [standardsList, searchQuery]);

  if (!isOpen) return null;

  // Handle Add Standard Submit
  const handleCreateStandard = async (e) => {
    e.preventDefault();
    if (!newStdName.trim()) {
      toast.error("કૃપા કરીને ધોરણનું નામ લખો.");
      return;
    }

    setAddingStd(true);
    try {
      const subjects = initialSubjectsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await addStandard(newStdName, subjects);
      setNewStdName("");
      setInitialSubjectsInput("");
      setShowAddStdForm(false);
    } catch (err) {
      // toast already shown in context
    } finally {
      setAddingStd(false);
    }
  };

  // Handle Add Subject Submit
  const handleAddSubject = async (standardId, standardName) => {
    const subjectName = newSubjectInputs[standardId]?.trim();
    if (!subjectName) {
      toast.error("કૃપા કરીને વિષયનું નામ લખો.");
      return;
    }

    setAddingSubjectFor(standardId);
    try {
      await addSubject(standardId, subjectName, standardName);
      setNewSubjectInputs((prev) => ({
        ...prev,
        [standardId]: "",
      }));
    } catch (err) {
      // toast already shown in context
    } finally {
      setAddingSubjectFor(null);
    }
  };

  // Handle Remove Subject
  const handleRemoveSubject = async (standardId, subjectName, standardName) => {
    if (
      window.confirm(
        `શું તમે ખરેખર "${subjectName}" વિષયને દૂર કરવા માંગો છો?`
      )
    ) {
      try {
        await removeSubject(standardId, subjectName, standardName);
      } catch (err) {
        // toast already shown in context
      }
    }
  };

  // Handle Delete Standard
  const handleDeleteStandard = async (standardId, standardName) => {
    if (
      window.confirm(
        `⚠️ ચેતવણી: શું તમે ખરેખર "${standardName}" ધોરણ ડિલીટ કરવા માંગો છો? આ ધોરણના તમામ વિષયો પણ હટી જશે.`
      )
    ) {
      try {
        await deleteStandard(standardId, standardName);
      } catch (err) {
        // toast already shown in context
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col z-10 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center flex-shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                ધોરણ અને વિષય મેનેજ કરો
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage Standards & Subjects (નવા ધોરણ અને વિષયો ઉમેરો અથવા સુધારો)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer touch-target"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Controls & Search */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white flex-shrink-0">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ધોરણ અથવા વિષય શોધો..."
              className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Add Standard Form Button */}
          <button
            type="button"
            onClick={() => setShowAddStdForm(!showAddStdForm)}
            className="inline-flex items-center justify-center gap-1.5 px-4 h-10 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer touch-target flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>નવું ધોરણ ઉમેરો (Add Standard)</span>
          </button>
        </div>

        {/* Expandable Add Standard Form */}
        {showAddStdForm && (
          <div className="p-4 sm:p-6 bg-indigo-50/50 border-b border-indigo-100 flex-shrink-0 animate-in slide-in-from-top-3 duration-200">
            <form onSubmit={handleCreateStandard} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-indigo-600" />
                  <span>નવા ધોરણની નોંધણી કરો</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddStdForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  બંધ કરો (Cancel)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ધોરણનું નામ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStdName}
                    onChange={(e) => setNewStdName(e.target.value)}
                    placeholder="દા.ત. ધોરણ 11 સાયન્સ, ધોરણ 12"
                    className="w-full h-10 px-3.5 text-xs sm:text-sm font-semibold bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600 text-slate-800"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    શરૂઆતી વિષયો (અલ્પવિરામથી અલગ કરો)
                  </label>
                  <input
                    type="text"
                    value={initialSubjectsInput}
                    onChange={(e) => setInitialSubjectsInput(e.target.value)}
                    placeholder="દા.ત. ગણિત, વિજ્ઞાન, English, હિન્દી"
                    className="w-full h-10 px-3.5 text-xs sm:text-sm font-medium bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddStdForm(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={addingStd || !newStdName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs disabled:opacity-50"
                >
                  {addingStd ? (
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>ધોરણ સાચવો (Save Standard)</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Standards & Subjects List (Scrollable Area) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredStandards.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-bold text-sm">
                કોઈ ધોરણ મળ્યું નથી
              </p>
              <p className="text-slate-400 text-xs mt-1 mb-4">
                {searchQuery
                  ? `"${searchQuery}" સાથે મેળ ખાતું કોઈ ધોરણ નથી.`
                  : "હજુ સુધી કોઈ ધોરણ ઉમેરાયેલ નથી."}
              </p>
              <button
                type="button"
                onClick={() => setShowAddStdForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>નવું ધોરણ ઉમેરો</span>
              </button>
            </div>
          ) : (
            filteredStandards.map((std) => {
              const stdId = std._id;
              const subjects = std.subjects || [];

              return (
                <div
                  key={stdId || std.name}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Standard Header Row */}
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {std.name}
                      </h4>
                      <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                        {subjects.length} વિષયો
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteStandard(stdId, std.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="ધોરણ ડિલીટ કરો"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>ડિલીટ</span>
                    </button>
                  </div>

                  {/* Subjects Badges Area */}
                  <div className="p-4 space-y-3">
                    {subjects.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        આ ધોરણમાં હજુ સુધી કોઈ વિષય ઉમેરેલ નથી.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {subjects.map((sub, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200/80 transition-colors group"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(stdId, sub, std.name)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded-md hover:bg-rose-50 transition-colors"
                              title={`"${sub}" વિષય દૂર કરો`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Inline Subject Input Adder */}
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                      <div className="relative flex-1 max-w-sm">
                        <input
                          type="text"
                          value={newSubjectInputs[stdId] || ""}
                          onChange={(e) =>
                            setNewSubjectInputs((prev) => ({
                              ...prev,
                              [stdId]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubject(stdId, std.name);
                            }
                          }}
                          placeholder="+ નવો વિષય લખો (e.g. કમ્પ્યુટર)"
                          className="w-full h-9 px-3 text-xs font-semibold bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 text-slate-800"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSubject(stdId, std.name)}
                        disabled={
                          addingSubjectFor === stdId ||
                          !newSubjectInputs[stdId]?.trim()
                        }
                        className="h-9 px-3.5 inline-flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs border border-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        {addingSubjectFor === stdId ? (
                          <div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        <span>ઉમેરો (Add)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            કુલ {standardsList.length} ધોરણ ઉપલબ્ધ છે
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer touch-target"
          >
            પૂર્ણ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageStandardsModal;
