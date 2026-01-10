import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import API from "../api/api";

const StudentProfile = () => {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/students/${id}/profile`);
        setStudent(res.data.student);
        setHistory(res.data.history);
      } catch (err) {
        setError("Failed to load student profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-red-600 text-lg font-medium mb-2">
            {error || "Student not found"}
          </div>
          <Link
            to="/students"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
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
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            to="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Link>
        </div>

        {/* Student Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          {/* Student Info Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {student.name}
                </h1>
                <div className="flex items-center mt-2 text-gray-700">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium">Class {student.standard}</span>
                  {student.parentPhone && (
                    <span className="ml-4 text-gray-600">
                      📞 {student.parentPhone}
                    </span>
                  )}
                </div>

               
              </div>

              {/* Stats Badge */}
              <div className="hidden md:block bg-white rounded-lg border border-gray-200 p-4 min-w-[180px]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalTests}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Tests
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {totalTests > 0 && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-gray-700">{presentTests} present</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-gray-700">{absentTests} absent</span>
                </div>
                 {student.subjects && student.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No subjects enrolled</p>
                )}
                {/* {presentTests > 0 && (
                  <div className="flex items-center">
                    <span className="text-gray-700">
                      Average: <span className="font-semibold">{averageMarks}</span> marks
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          )}
        </div>

        {/* Test History Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              Test History
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({totalTests} test{totalTests !== 1 ? "s" : ""})
              </span>
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No Test Records
              </h3>
              <p className="text-gray-500">
                This student hasn't taken any tests yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        Date
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">
                      Subject
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">
                      Marks Obtained
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((row, index) => {
                    const isPresent = row.status === "PRESENT";

                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {new Date(row.testDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(row.testDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                              }
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {row.subject}
                          </div>
                        </td>

                        <td className="p-4">
                          {isPresent ? (
                            <div>
                              <div className="font-semibold text-gray-900">
                                {row.obtainedMarks} / {row.totalMarks}
                              </div>
                              {/* <div className="flex items-center mt-1">
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      percentage >= 80 ? 'bg-green-500' :
                                      percentage >= 60 ? 'bg-blue-500' :
                                      percentage >= 40 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-xs text-gray-500">{percentage}%</span>
                              </div> */}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="p-4">
                          {isPresent ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
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

          {/* Table Footer */}
          {/* {history.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    Showing {history.length} test{history.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs">≥ 80%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-blue-500 rounded-full mr-1"></div>
                      <span className="text-xs">≥ 60%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></div>
                      <span className="text-xs">≥ 40%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Student ID: {student._id?.substring(0, 12)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
