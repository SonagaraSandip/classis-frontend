import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PageLoader from "./pages/PageLoader";
import ProtectedRoute from "./pages/ProtectedRoute";
import { StandardProvider } from "./context/StandardContext";

// ⚡ Lazy-loaded page components for ultra-fast initial bundle load
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddStudent = lazy(() => import("./pages/AddStudent"));
const StudentList = lazy(() => import("./pages/StudentsList"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <StandardProvider>
      <BrowserRouter>
        <Toaster position="top-right" reverseOrder={false} />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Login />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-student"
              element={
                <ProtectedRoute>
                  <AddStudent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students/:id"
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StandardProvider>
  );
}

export default App;
