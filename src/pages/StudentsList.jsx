import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Eye,
  Filter,
  ArrowLeft,
  Edit2,
  Trash2,
  Search,
  X,
  ChevronDown,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import EditStudentModal from "../components/EditStudentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import ManageStandardsModal from "../components/ManageStandardsModal";
import { useStandards } from "../context/StandardContext";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const StudentList = () => {
  const { standardNames } = useStandards();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/students");

      // Group students by standard
      const grouped = {};
      res.data.forEach((s) => {
        if (!grouped[s.standard]) {
          grouped[s.standard] = [];
        }
        grouped[s.standard].push(s);
      });

      setStudents(grouped);
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err, gujaratiToast.studentLoadError));
    } finally {
      setLoading(false);
    }
  };

  // Save student updates
  const handleSaveEdit = async (updatedData) => {
    setActionLoading(true);
    try {
      const res = await API.put(`/students/${updatedData._id}`, {
        name: updatedData.name,
        standard: updatedData.standard,
      });

      const updated = res.data;

      // Update state locally
      setStudents((prev) => {
        const next = { ...prev };
        const oldStd = editingStudent.standard;
        const newStd = updated.standard;

        if (oldStd === newStd) {
          if (next[oldStd]) {
            next[oldStd] = next[oldStd]
              .map((s) => (s._id === updated._id ? updated : s))
              .sort((a, b) => a.name.localeCompare(b.name));
          }
        } else {
          if (next[oldStd]) {
            next[oldStd] = next[oldStd].filter((s) => s._id !== updated._id);
            if (next[oldStd].length === 0) {
              delete next[oldStd];
            }
          }
          if (!next[newStd]) {
            next[newStd] = [];
          }
          next[newStd] = [...next[newStd], updated].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        }

        return next;
      });

      toast.success(gujaratiToast.studentUpdated);
      setEditingStudent(null);
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm and delete student
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;

    setActionLoading(true);
    try {
      await API.delete(`/students/${deletingStudent._id}`);

      // Update local state
      setStudents((prev) => {
        const next = { ...prev };
        const std = deletingStudent.standard;

        if (next[std]) {
          next[std] = next[std].filter((s) => s._id !== deletingStudent._id);
          if (next[std].length === 0) {
            delete next[std];
          }
        }

        return next;
      });

      toast.success(gujaratiToast.studentDeleted(deletingStudent.name));
      setDeletingStudent(null);
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Filter & Search students
  const filteredStudents = useMemo(() => {
    let result = {};
    const q = searchQuery.trim().toLowerCase();

    Object.entries(students).forEach(([std, list]) => {
      // Standard filter check
      if (selectedClass !== "all" && std !== selectedClass) {
        return;
      }

      // Name search query check
      const matched = list.filter((s) => {
        if (!q) return true;
        return s.name.toLowerCase().includes(q);
      });

      if (matched.length > 0) {
        result[std] = matched;
      }
    });

    return result;
  }, [students, selectedClass, searchQuery]);

  const allClasses = useMemo(() => {
    return Array.from(new Set([...standardNames, ...Object.keys(students)])).sort();
  }, [standardNames, students]);
  const totalStudents = Object.values(students).flat().length;
  const filteredCount = Object.values(filteredStudents).flat().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-xs w-full">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-800 font-bold text-sm">
            વિદ્યાર્થીઓની યાદી લોડ થઈ રહી છે...
          </p>
          <p className="text-slate-400 text-xs mt-1">Loading students</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Navigation & Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="mb-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-[0.98]"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-500" />
                  <span>પાછા જાઓ (Back)</span>
                </Link>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                વિદ્યાર્થીઓની યાદી (Students Directory)
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                બધા નોંધાયેલા વિદ્યાર્થીઓની માહિતી, વિગત સુધારો અથવા ડિલીટ કરો
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsManageModalOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200/80 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-2xs active:scale-[0.98] cursor-pointer touch-target"
                title="ધોરણ અને વિષય મેનેજ કરો"
              >
                <Layers className="h-4 w-4 mr-1.5 flex-shrink-0 text-indigo-600" />
                <span>ધોરણ / વિષય</span>
              </button>
              <Link
                to="/add-student"
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all text-xs sm:text-sm shadow-sm hover:shadow active:scale-[0.98] cursor-pointer touch-target"
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                <span>નવો વિદ્યાર્થી ઉમેરો</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Total Count Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3.5">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {totalStudents}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  કુલ વિદ્યાર્થીઓ
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {allClasses.length} ધોરણ ઉપલબ્ધ
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-sm flex items-center relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="વિદ્યાર્થીના નામથી શોધો..."
              className="w-full h-10 pl-9 pr-9 text-xs sm:text-sm font-medium bg-transparent outline-none placeholder-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter by Standard */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-sm relative flex items-center sm:col-span-2 lg:col-span-1">
            <Filter className="h-4 w-4 text-slate-400 absolute left-4 pointer-events-none" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none appearance-none cursor-pointer"
            >
              <option value="all">બધા ધોરણ (All Classes)</option>
              {allClasses.map((std) => (
                <option key={std} value={std}>
                  {std}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Filter Feedback */}
        {(selectedClass !== "all" || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-600 bg-blue-50/80 border border-blue-100/90 px-4 py-2.5 rounded-xl">
            <span>
              પરિણામ: <strong className="text-slate-900">{filteredCount}</strong> વિદ્યાર્થી મળ્યા
              {selectedClass !== "all" ? ` • ધોરણ: ${selectedClass}` : ""}
              {searchQuery ? ` • શોધ: "${searchQuery}"` : ""}
            </span>
            <button
              onClick={() => {
                setSelectedClass("all");
                setSearchQuery("");
              }}
              className="text-blue-600 hover:underline font-bold ml-2 cursor-pointer"
            >
              ફિલ્ટર સાફ કરો
            </button>
          </div>
        )}

        {/* Students List */}
        {Object.keys(filteredStudents).length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-10 sm:p-14 text-center shadow-sm">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              કોઈ વિદ્યાર્થી મળ્યો નથી
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-5">
              {searchQuery
                ? `"${searchQuery}" સાથે મેળ ખાતો કોઈ વિદ્યાર્થી નથી.`
                : "હાલમાં આ વર્ગમાં કોઈ વિદ્યાર્થી ઉમેરાયેલ નથી."}
            </p>
            <Link
              to="/add-student"
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              નવો વિદ્યાર્થી ઉમેરો
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(filteredStudents).map(([std, list]) => (
              <div
                key={std}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Class Header */}
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      {std}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-0.5 rounded-full">
                    {list.length} વિદ્યાર્થી
                  </span>
                </div>

                {/* Students Row Cards */}
                <div className="divide-y divide-slate-100">
                  {list.map((student) => {
                    const avatarStyle = getAvatarColor(student.name);

                    return (
                      <div
                        key={student._id}
                        className="p-4 sm:px-5 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Student Info */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div
                              className={`h-11 w-11 rounded-xl border flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-2xs ${avatarStyle}`}
                            >
                              {student.name.charAt(0)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate hover:text-blue-600 transition-colors">
                                <Link to={`/students/${student._id}`}>
                                  {student.name}
                                </Link>
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {student.standard}
                                </span>
                                {student.parentPhone && (
                                  <span>📞 {student.parentPhone}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons with standard proper size & touch targets */}
                          <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            {/* View Profile Button */}
                            <Link
                              to={`/students/${student._id}`}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs border border-blue-200/80 transition-all active:scale-[0.98] cursor-pointer touch-target"
                              title="પ્રોફાઇલ અને માર્ક્સ જુઓ"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              <span>જુઓ</span>
                            </Link>

                            {/* Edit Student Button */}
                            <button
                              type="button"
                              onClick={() => setEditingStudent(student)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-xs border border-amber-200/80 transition-all active:scale-[0.98] cursor-pointer touch-target"
                              title="વિગત સુધારો"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" />
                              <span>સુધારો</span>
                            </button>

                            {/* Delete Student Button */}
                            <button
                              type="button"
                              onClick={() => setDeletingStudent(student)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs border border-rose-200/80 transition-all active:scale-[0.98] cursor-pointer touch-target"
                              title="વિદ્યાર્થી ડિલીટ કરો"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              <span>ડિલીટ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={Boolean(editingStudent)}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleSaveEdit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deletingStudent)}
        studentName={deletingStudent?.name}
        studentStandard={deletingStudent?.standard}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />

      {/* Manage Standards Modal */}
      <ManageStandardsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </div>
  );
};

export default StudentList;