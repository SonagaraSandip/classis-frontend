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
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
