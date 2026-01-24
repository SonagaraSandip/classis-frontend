import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Book, Plus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";
import { subjectsByStandard } from "../utils/subjectsByStandard";

const AddStudent = () => {
  const [name, setName] = useState("");
  const [standard, setStandard] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !standard) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await API.post("/students", {
        name,
        standard,
      });

      toast.success("Student added successfully");
      setName("");
      setStandard("");
    } catch (err) {
      toast.error("Error while adding student");
      console.error(err);
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
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add New Student</h1>
              <p className="text-gray-600 text-sm mt-1">
                Register a new student in the system
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Name Field */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student's full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            {/* Standard Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Book className="h-4 w-4 inline mr-1" />
                Class Standard
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none"
                required
              >
                <option value="">Select Class</option>
                {Object.keys(subjectsByStandard).map((std) => (
                  <option key={std} value={std}>
                    {std}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name.trim() || !standard}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Student...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Student
                </>
              )}
            </button>

            {/* Quick Info */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <p className="mb-2">✅ Student will be added to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Class {standard || "Selected Class"}</li>
                  <li>All subjects for that class</li>
                  <li>Available for marks entry immediately</li>
                </ul>
              </div>
            </div>
          </form>
        </div>

        {/* Additional Options */}
        <div className="mt-6 text-center">
          <Link
            to="/students"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            <User className="h-4 w-4 mr-2" />
            View All Students
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;