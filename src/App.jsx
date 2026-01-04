import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AddStudent from "./pages/AddStudent";
import MarkEntry from "./pages/MarkEntry";
import StudentProfile from "./pages/StudentProfile";
import StudentList from "./pages/StudentsList";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<MarkEntry />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/:id" element={<StudentProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
