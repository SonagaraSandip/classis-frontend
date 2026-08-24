import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, Sparkles, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/api";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const Login = () => {
  const [key, setKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/health").catch(() => {});
  }, []);

  const submit = async () => {
    if (!key.trim()) {
      toast.error(gujaratiToast.enterKey);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { key });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "teacher");
      toast.success(gujaratiToast.loginTeacherSuccess);
      navigate("/dashboard");
    } catch (err) {
      toast.error(getGujaratiErrorMessage(err, gujaratiToast.invalidKey));
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
      toast.success(gujaratiToast.loginGuestSuccess);
      navigate("/dashboard");
    } catch (err) {
      toast.error(getGujaratiErrorMessage(err, "ગેસ્ટ લૉગિન કરવામાં સમસ્યા આવી."));
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20 text-white">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">
            માર્ક્સ મેનેજમેન્ટ સિસ્ટમ
          </h1>
          <p className="text-gray-600 text-sm">
            Marks Management System • શિક્ષક અને ગેસ્ટ લૉગિન
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <User className="h-5 w-5 mr-2.5" />
              શિક્ષક લૉગિન (Teacher Login)
            </h2>
          </div>

          {/* Card Body */}
          <div className="p-6 md:p-8">
            {/* Master Key Input */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                <Lock className="h-3.5 w-3.5 inline mr-1 text-blue-600" />
                માસ્ટર કી (Master Key)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="તમારી માસ્ટર કી દાખલ કરો"
                  value={key}
                  required
                  onKeyPress={handleKeyPress}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                  disabled={loading || guestLoading}
                  autoFocus
                />
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  disabled={loading || guestLoading}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={submit}
              disabled={loading || guestLoading}
              className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg text-sm"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  લૉગિન થઈ રહ્યું છે...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  લૉગિન કરો (Login as Teacher)
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-xs text-gray-400 font-medium">અથવા (OR)</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Guest Login Button */}
            <button
              onClick={guestLogin}
              disabled={loading || guestLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg text-sm"
            >
              {guestLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  પ્રવેશ થઈ રહ્યો છે...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  ગેસ્ટ તરીકે પ્રવેશ (Login as Guest)
                </>
              )}
            </button>

            {/* Guest Warning */}
            <div className="mt-6 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl">
              <div className="flex items-start">
                <Shield className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-amber-800 font-semibold mb-0.5">
                    ગેસ્ટ એકાઉન્ટ માહિતી
                  </p>
                  <p className="text-xs text-amber-700/90 leading-relaxed">
                    ગેસ્ટ એકાઉન્ટનો ડેટા 12 કલાક પછી આપમેળે ડિલીટ થઈ જશે. ફક્ત અજમાયશ માટે ઉપયોગ કરો.
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
