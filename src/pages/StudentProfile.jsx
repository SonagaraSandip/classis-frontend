import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Edit2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import EditStudentModal from "../components/EditStudentModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/students/${id}/profile`);
      setStudent(res.data.student);
      setHistory(res.data.history || []);
    } catch (err) {
      setError(getGujaratiErrorMessage(err, "વિદ્યાર્થીની માહિતી લાવવામાં સમસ્યા આવી."));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Save
  const handleSaveEdit = async (updatedData) => {
    setActionLoading(true);
    try {
      const res = await API.put(`/students/${updatedData._id}`, {
        name: updatedData.name,
        standard: updatedData.standard,
      });

      setStudent(res.data);
      toast.success(gujaratiToast.studentUpdated);
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Confirm
  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await API.delete(`/students/${id}`);
      toast.success(gujaratiToast.studentDeleted(student?.name));
      setIsDeleteOpen(false);
      navigate("/students");
    } catch (err) {
      console.error(err);
      toast.error(getGujaratiErrorMessage(err));
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xs w-full">
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
          <p className="mt-3.5 text-gray-700 font-medium text-sm">
            પ્રોફાઇલ લોડ થઈ રહી છે...
          </p>
          <p className="text-gray-400 text-xs mt-1">Loading profile data</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-red-600 text-base font-semibold mb-2">
            {error || "વિદ્યાર્થી મળ્યો નથી (Student not found)"}
          </div>
          <Link
            to="/students"
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            વિદ્યાર્થી યાદી પર પાછા જાઓ
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalTests = history.length;
  const presentTests = history.filter((row) => row.status === "PRESENT").length;
  const absentTests = history.filter((row) => row.status === "ABSENT").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button and Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            to="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            વિદ્યાર્થી યાદી (Back to Students)
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 font-medium rounded-xl text-sm transition-all shadow-sm"
            >
              <Edit2 className="h-4 w-4 mr-1.5 text-amber-600" />
              સુધારો કરો (Edit Student)
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-medium rounded-xl text-sm transition-all shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              ડિલીટ કરો (Delete Student)
            </button>
          </div>
        </div>

        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm mb-6 overflow-hidden">
          {/* Student Info Header */}
          <div className="p-6 border-b border-gray-200/80 bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {student.name}
                </h1>
                <div className="flex items-center mt-2 text-gray-700">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-semibold text-gray-900">{student.standard}</span>
                  {student.parentPhone && (
                    <span className="ml-4 text-gray-600">
                      📞 {student.parentPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Badge */}
              <div className="hidden md:block bg-white/90 backdrop-blur rounded-xl border border-gray-200/80 p-4 min-w-[170px] shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalTests}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">
                    કુલ ટેસ્ટ (Total Tests)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {totalTests > 0 && (
            <div className="p-4 border-b border-gray-100 bg-gray-50/70">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200/80 shadow-2xs">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-gray-800 font-medium">હાજર: {presentTests} ટેસ્ટ</span>
                </div>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200/80 shadow-2xs">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-gray-800 font-medium">ગેરહાજર: {absentTests} ટેસ્ટ</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Test History Section */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200/80 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              ટેસ્ટ ઇતિહાસ (Test History)
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {totalTests} ટેસ્ટ રેકોર્ડ
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                કોઈ ટેસ્ટ રેકોર્ડ નથી (No Test Records)
              </h3>
              <p className="text-gray-500 text-xs">
                આ વિદ્યાર્થી માટે હજુ સુધી કોઈ માર્ક્સ નોંધાયા નથી.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-200/80">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      તારીખ (Date)
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      વિષય (Subject)
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      મેળવેલ ગુણ (Marks)
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      હાજરી (Status)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((row, index) => {
                    const isPresent = row.status === "PRESENT";

                    return (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/20 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">
                            {row.testDate
                              ? new Date(row.testDate).toLocaleDateString(
                                  "gu-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "N/A"}
                          </div>
                        </td>

                        <td className="p-4 font-medium text-gray-900">
                          {row.subject}
                        </td>

                        <td className="p-4">
                          {isPresent ? (
                            <span className="font-bold text-gray-900 text-base">
                              {row.obtainedMarks} / {row.totalMarks}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-bold">—</span>
                          )}
                        </td>

                        <td className="p-4">
                          {isPresent ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              હાજર (Present)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              ગેરહાજર (Absent)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={isEditOpen}
        student={student}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveEdit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        studentName={student?.name}
        studentStandard={student?.standard}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default StudentProfile;
