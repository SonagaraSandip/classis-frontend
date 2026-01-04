import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
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

  // Filter students based on search and class
  const getFilteredStudents = () => {
    let filtered = { ...students };

    // Filter by class
    if (selectedClass !== "all") {
      Object.keys(filtered).forEach((std) => {
        if (std !== selectedClass) {
          delete filtered[std];
        }
      });
    }

    // // Filter by search term
    // if (searchTerm.trim() !== "") {
    //   const searchLower = searchTerm.toLowerCase();
    //   Object.keys(filtered).forEach(std => {
    //     filtered[std] = filtered[std].filter(student =>
    //       student.name.toLowerCase().includes(searchLower) ||
    //       student.subjects?.some(subj => subj.toLowerCase().includes(searchLower))
    //     );
    //     if (filtered[std].length === 0) {
    //       delete filtered[std];
    //     }
    //   });
    // }

    return filtered;
  };

  // Get all classes for filter dropdown
  const allClasses = Object.keys(students).sort();

  const filteredStudents = getFilteredStudents();
  const totalStudents = Object.values(students).flat().length;
  const filteredCount = Object.values(filteredStudents).flat().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Link to="/">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Students Directory
              </h1>
              <p className="text-gray-600 mt-1">Manage all student records</p>
            </Link>
            <Link
              to="/add-student"
              className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add New Student
            </Link>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {totalStudents} Students
                </h3>
                <p className="text-gray-600 text-sm">
                  Across {allClasses.length} classes
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students by name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div> */}

              <div className="w-full md:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                  >
                    <option value="all">All Classes</option>
                    {allClasses.map((std) => (
                      <option key={std} value={std}>
                        Class {std}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* {searchTerm || selectedClass !== "all" ? (
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredCount} student{filteredCount !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedClass !== "all" && ` in Class ${selectedClass}`}
              </div>
            ) : null} */}
          </div>
        </div>

        {/* Students List */}
        {Object.keys(filteredStudents).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No Students Found
            </h3>
            {/* <p className="text-gray-500">
              {searchTerm || selectedClass !== "all" 
                ? "Try changing your search or filter criteria" 
                : "Add your first student to get started"}
            </p> */}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredStudents).map(([std, list]) => (
              <div
                key={std}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Class {std}
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">
                        {list.length} student{list.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {list.map((student) => (
                    <div
                      key={student._id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="font-semibold text-blue-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {student.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  Class {student.standard}
                                </span>
                                {/* {student.subjects?.slice(0, 3).map((subject, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded"
                                  >
                                    {subject}
                                  </span>
                                ))}
                                {student.subjects?.length > 3 && (
                                  <span className="text-sm text-gray-500">
                                    +{student.subjects.length - 3} more
                                  </span>
                                )} */}
                              </div>
                              {student.parentPhone && (
                                <p className="text-sm text-gray-600 mt-2">
                                  📞 {student.parentPhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/students/${student._id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Link>

                          <button
                            className="inline-flex items-center p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit (coming soon)"
                          >
                            <Edit className="h-5 w-5" />
                          </button>

                          <button
                            className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete (coming soon)"
                          >
                            <Trash2 className="h-5 w-5" />
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

        {/* Footer Stats */}
        {totalStudents > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-600 text-sm">
              <p>
                Showing {filteredCount} of {totalStudents} student
                {totalStudents !== 1 ? "s" : ""}
                {allClasses.length > 0 &&
                  ` across ${allClasses.length} class${
                    allClasses.length !== 1 ? "es" : ""
                  }`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
