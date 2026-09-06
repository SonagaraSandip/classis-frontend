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
      type="button"
      className="w-full h-11 px-3 inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 hover:text-rose-800 border border-rose-200/80 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-[0.98] cursor-pointer touch-target whitespace-nowrap"
      title="લૉગઆઉટ કરો (Logout)"
    >
      <LogOut className="h-4 w-4 flex-shrink-0 text-rose-600" />
      <span>લૉગઆઉટ</span>
    </button>
  );
};

export default LogoutButton;
