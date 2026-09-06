import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600 mt-2 mb-6">
        Page not found
      </p>

      <Link
        to="/dashboard"
        className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.98]"
      >
        ડેશબોર્ડ પર જાઓ (Go to Dashboard)
      </Link>
    </div>
  );
};

export default NotFound;
