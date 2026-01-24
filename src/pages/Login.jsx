import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Sparkles, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/api";

const Login = () => {
  const [key, setKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!key.trim()) {
      toast.error("Please enter master key");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { key });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "teacher");
      toast.success("Login successful as Teacher");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid master key");
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setGuestLoading(true);
    try {
      const res = await API.post("/auth/guest");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "guest");
      toast.success("Guest Login successful");
      navigate("/dashboard");
    } catch {
      toast.error("Guest login failed");
    } finally {
      setGuestLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Marks Management System
          </h1>
          <p className="text-gray-600">
            Secure login for teachers and guest access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <User className="h-5 w-5 mr-3" />
              Teacher Login
            </h2>
          </div>

          {/* Card Body */}
          <div className="p-6 md:p-8">
            {/* Master Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Master Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your master key"
                  value={key}
                  required
                  onKeyPress={handleKeyPress}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  disabled={loading || guestLoading}
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading || guestLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={submit}
              disabled={loading || guestLoading}
              className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Login as Teacher
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Guest Login Button */}
            <button
              onClick={guestLogin}
              disabled={loading || guestLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
            >
              {guestLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Login as Guest
                </>
              )}
            </button>

            {/* Guest Warning */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-medium mb-1">
                    Guest Account Notice
                  </p>
                  <p className="text-xs text-amber-700">
                    Guest data is automatically deleted after 12 hours. Use this
                    option for temporary access only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
