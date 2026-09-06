import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Shield, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/api";
import { getGujaratiErrorMessage, gujaratiToast } from "../utils/gujaratiMessages";

const Login = () => {
  const [key, setKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/health").catch(() => {});
  }, []);

  const submit = async (e) => {
    if (e) e.preventDefault();

    if (!key.trim()) {
      toast.error(gujaratiToast.enterKey);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { key: key.trim() });
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl mb-4 shadow-xl shadow-indigo-500/20 text-white transform hover:scale-105 transition-transform duration-200">
            <Shield className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            માર્ક્સ મેનેજમેન્ટ સિસ્ટમ
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
            Student Marks & Evaluation System • શિક્ષક લૉગિન
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-4 text-white">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              શિક્ષક લૉગિન (Teacher Login)
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">
              ડેશબોર્ડ એક્સેસ કરવા માટે માસ્ટર કી દાખલ કરો
            </p>
          </div>

          {/* Card Body */}
          <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
            {/* Master Key Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                માસ્ટર કી (Master Key)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "number" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="તમારી માસ્ટર કી દાખલ કરો"
                  value={key}
                  required
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full h-12 px-4 pl-11 pr-11 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={loading}
                  autoFocus
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  disabled={loading}
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
              type="submit"
              disabled={loading || !key.trim()}
              className="w-full h-12 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:via-indigo-700 hover:to-indigo-800 active:scale-[0.99] text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>લૉગિન થઈ રહ્યું છે...</span>
                </>
              ) : (
                <>
                  <span>લૉગિન કરો (Login to Dashboard)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / System Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          <span>સુરક્ષિત શિક્ષક પોર્ટલ • Secure Assessment Portal</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
