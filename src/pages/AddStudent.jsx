import React, { useState } from "react";
import { User, Book, CheckCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/api";

const standards = ["2", "5", "7", "8"];
const subjectsList = ["Maths", "Science", "English"];

const AddStudent = () => {
  const [name, setName] = useState("");
  const [standard, setStandard] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSubject = (sub) => {
    setSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !standard || subjects.length === 0) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await API.post("/students", {
        name,
        standard,
        subjects,
      });

      toast.success("Student added successfully");
      setName("");
      setStandard("");
      setSubjects([]);
    } catch (err) {
      toast.error("Error while adding student");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Student
              </h1>
              <p className="text-gray-600 mt-1">
                Fill in the student details below
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Standard Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Book className="h-4 w-4 inline mr-1" />
                Class Standard
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select Class</option>
                {standards.map((std) => (
                  <option key={std} value={std} className="py-2">
                    Class {std}
                  </option>
                ))}
              </select>
            </div>

            {/* Subjects Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Subjects
              </label>
              <div className="flex flex-wrap gap-3">
                {subjectsList.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      subjects.includes(sub)
                        ? "bg-blue-50 border-blue-300 text-blue-700"
                        : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      {subjects.includes(sub) && (
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                      )}
                      {sub}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {subjects.join(", ") || "None"}
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
