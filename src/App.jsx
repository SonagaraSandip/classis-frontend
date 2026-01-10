import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import ProctectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AddStudent from "./pages/AddStudent";
import MarkEntry from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentList from "./pages/StudentsList";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProctectedRoute>
              <Dashboard />
            </ProctectedRoute>
          }
        />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/:id" element={<StudentProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
