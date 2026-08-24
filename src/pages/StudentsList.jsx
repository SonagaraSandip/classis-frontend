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
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import EditStudentModal from "../components/EditStudentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

// Color generator for lively student avatars
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

  const allClasses = Object.keys(students).sort();
  const totalStudents = Object.values(students).flat().length;
  const filteredCount = Object.values(filteredStudents).flat().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xs w-full">
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
          <p className="mt-3.5 text-gray-700 font-medium text-sm">
            વિદ્યાર્થીઓની યાદી લોડ થઈ રહી છે...
          </p>
          <p className="text-gray-400 text-xs mt-1">Loading student directory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            ડેશબોર્ડ પર પાછા જાઓ (Back to Dashboard)
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                વિદ્યાર્થીઓની યાદી (Students Directory)
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                બધા નોંધાયેલા વિદ્યાર્થીઓની યાદી, વિગતો સુધારો અથવા દૂર કરો
              </p>
            </div>
            <Link
              to="/add-student"
              className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl transition-all text-sm w-full sm:w-auto shadow-sm hover:shadow"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              નવો વિદ્યાર્થી ઉમેરો (Add Student)
            </Link>
          </div>
        </div>

        {/* Stats & Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm flex items-center">
            <div className="h-12 w-12 bg-blue-100/80 rounded-xl flex items-center justify-center mr-3 text-blue-600 flex-shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-gray-900">{totalStudents}</span>
                <span className="text-xs text-gray-500 font-medium">કુલ વિદ્યાર્થીઓ</span>
              </div>
              <p className="text-gray-500 text-xs">
                {allClasses.length} ધોરણ ઉપલબ્ધ
              </p>
            </div>
          </div>

          {/* Search by Name */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-3 shadow-sm flex items-center relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="નામથી શોધો... (Search by name)"
              className="w-full pl-8 pr-8 py-2 text-sm bg-transparent outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 p-1 mr-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter by Standard */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-3 shadow-sm relative flex items-center">
            <Filter className="h-4 w-4 text-gray-400 absolute left-4 pointer-events-none" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border-0 bg-transparent text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer"
            >
              <option value="all">બધા ધોરણ (All Classes)</option>
              {allClasses.map((std) => (
                <option key={std} value={std}>
                  {std}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Feedback Badge */}
        {(selectedClass !== "all" || searchQuery) && (
          <div className="mb-4 flex items-center justify-between text-xs text-gray-600 bg-blue-50/70 border border-blue-100 px-3.5 py-2 rounded-lg">
            <span>
              પરિણામ: <strong className="text-gray-900">{filteredCount}</strong> વિદ્યાર્થી મળ્યા
              {selectedClass !== "all" ? ` • ${selectedClass}` : ""}
              {searchQuery ? ` • શોધ: "${searchQuery}"` : ""}
            </span>
            <button
              onClick={() => {
                setSelectedClass("all");
                setSearchQuery("");
              }}
              className="text-blue-600 hover:underline font-medium ml-2"
            >
              ફિલ્ટર સાફ કરો (Clear)
            </button>
          </div>
        )}

        {/* Students List */}
        {Object.keys(filteredStudents).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              કોઈ વિદ્યાર્થી મળ્યો નથી (No Students Found)
            </h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto mb-5">
              {searchQuery
                ? `"${searchQuery}" નામ સાથે મેળ ખાતો કોઈ વિદ્યાર્થી નથી.`
                : "હાલમાં આ વર્ગમાં કોઈ વિદ્યાર્થી ઉમેરાયેલ નથી."}
            </p>
            <Link
              to="/add-student"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              નવો વિદ્યાર્થી ઉમેરો
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(filteredStudents).map(([std, list]) => (
              <div
                key={std}
                className="bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Class Header */}
                <div className="px-5 py-3.5 border-b border-gray-200/80 bg-gray-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                    <h2 className="text-base font-bold text-gray-900">
                      {std}
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full">
                    {list.length} વિદ્યાર્થી
                  </span>
                </div>

                {/* Students List Table */}
                <div className="divide-y divide-gray-100">
                  {list.map((student) => {
                    const avatarStyle = getAvatarColor(student.name);

                    return (
                      <div
                        key={student._id}
                        className="p-4 sm:px-5 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Student Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3.5">
                              {/* Colorful Avatar */}
                              <div
                                className={`h-11 w-11 rounded-xl border flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-sm ${avatarStyle}`}
                              >
                                {student.name.charAt(0)}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-base truncate hover:text-blue-600 transition-colors">
                                  <Link to={`/students/${student._id}`}>
                                    {student.name}
                                  </Link>
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                    {student.standard}
                                  </span>
                                  {student.parentPhone && (
                                    <span>📞 {student.parentPhone}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0 flex-wrap">
                            {/* View Profile */}
                            <Link
                              to={`/students/${student._id}`}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 font-medium rounded-lg transition-colors text-xs border border-blue-100"
                              title="પ્રોફાઇલ અને માર્ક્સ જુઓ"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              જુઓ (View)
                            </Link>

                            {/* Edit Student */}
                            <button
                              type="button"
                              onClick={() => setEditingStudent(student)}
                              className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 active:bg-amber-200 font-medium rounded-lg transition-colors text-xs border border-amber-100"
                              title="વિગત સુધારો"
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-1" />
                              સુધારો (Edit)
                            </button>

                            {/* Delete Student */}
                            <button
                              type="button"
                              onClick={() => setDeletingStudent(student)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 font-medium rounded-lg transition-colors text-xs border border-red-100"
                              title="વિદ્યાર્થી ડિલીટ કરો"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              ડિલીટ (Delete)
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

        {/* Footer Info */}
        {totalStudents > 0 && (
          <div className="mt-8 text-center text-xs text-gray-500">
            કુલ {totalStudents} વિદ્યાર્થીઓમાંથી {filteredCount} વિદ્યાર્થી દર્શાવેલ છે
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
    </div>
  );
};

export default StudentList;