import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { gujaratiToast } from "../utils/gujaratiMessages";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.success(gujaratiToast.logoutSuccess);
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold transition-colors shadow-xs"
      title="લૉગઆઉટ કરો"
    >
      <LogOut className="h-3.5 w-3.5 mr-1" />
      લૉગઆઉટ (Logout)
    </button>
  );
};

export default LogoutButton;
