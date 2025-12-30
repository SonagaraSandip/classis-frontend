import {BrowserRouter , Routes , Route} from "react-router-dom";
import AddStudent from "./pages/addStudent";
import MarkEntry from './pages/MarkEntry';
import StudentProfile from './pages/StudentProfile';



function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<MarkEntry />} />
      <Route path="/add-student" element={<AddStudent />} />
      <Route path="/student/:id" element={<StudentProfile />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
