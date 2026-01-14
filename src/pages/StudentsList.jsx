import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Eye, Filter, ArrowLeft } from "lucide-react";
import API from "../api/api";

const StudentList = () => {
  const [students, setStudents] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on class
  const getFilteredStudents = () => {
    let filtered = { ...students };

    if (selectedClass !== "all") {
      Object.keys(filtered).forEach((std) => {
        if (std !== selectedClass) {
          delete filtered[std];
        }
      });
    }

    return filtered;
  };

  const allClasses = Object.keys(students).sort();
  const filteredStudents = getFilteredStudents();
  const totalStudents = Object.values(students).flat().length;
  const filteredCount = Object.values(filteredStudents).flat().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Students Directory</h1>
              <p className="text-gray-600 text-sm mt-1">All registered students</p>
            </div>
            <Link
              to="/add-student"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{totalStudents} Students</h3>
              <p className="text-gray-600 text-xs">
                {allClasses.length} class{allClasses.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6 shadow-sm">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-sm"
            >
              <option value="all">All Classes</option>
              {allClasses.map((std) => (
                <option key={std} value={std}>
                   {std}
                </option>
              ))}
            </select>
          </div>
          
          {selectedClass !== "all" && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {filteredCount} student{filteredCount !== 1 ? 's' : ''} in {selectedClass}
            </div>
          )}
        </div>

        {/* Students List */}
        {Object.keys(filteredStudents).length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-700 mb-1">No Students Found</h3>
            <p className="text-gray-500 text-sm">Add students to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredStudents).map(([std, list]) => (
              <div key={std} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                {/* Class Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900"> {std}</h2>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {list.length} student{list.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="divide-y divide-gray-100">
                  {list.map((student) => (
                    <div key={student._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Student Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="font-semibold text-blue-600 text-sm">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-base">{student.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                   {student.standard}
                                </span>
                                {student.parentPhone && (
                                  <span className="text-xs text-gray-500">
                                    📞 {student.parentPhone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 mt-3 sm:mt-0">
                          <Link
                            to={`/students/${student._id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors text-sm"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            View
                          </Link>
                          
                          <button
                            className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Student ID"
                          >
                            <span className="text-xs text-gray-500">
                              ID: {student._id?.substring(0, 6)}...
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats - Mobile Optimized */}
        {totalStudents > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{filteredCount}</span> of{" "}
                <span className="font-medium">{totalStudents}</span> students shown
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mr-1.5"></div>
                  {allClasses.length} class{allClasses.length !== 1 ? 'es' : ''}
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5"></div>
                  {selectedClass === "all" ? "All classes" : `Class ${selectedClass}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;