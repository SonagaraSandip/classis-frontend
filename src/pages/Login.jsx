import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye , EyeOff} from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../api/api";

const Login = () => {
  const [key, setkey] = useState("");
  const [password, setPassword] = useState(false);
  const naviagte = useNavigate();

  const submit = async () => {
    if (!key.trim) {
      toast.error("please enter jkey");
    }

    try {
      const res = await API.post("/auth/login", { key });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "teacher");
      naviagte("/dashboard");
      toast.success("login successful as a teacher");
    } catch {
      toast.error("Invalid master key");
    }
  };

  const guestLogin = async () => {
    try {
      const res = await API.post("/auth/guest");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "guest");
      naviagte("/dashboard");
      toast.success("Guest Login successful");
    } catch {
      toast.error("Guest login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h2>Teacher login</h2>

        <div className="flex items-center p-2 border mb-4">
          <input
            type={password ? "text" : "password"}
            placeholder="Enter master key"
            value={key}
            required
            className="w-full outline-none"
            onChange={(e) => setkey(e.target.value)}
          />
          <button onClick={() => setPassword(!password)}>
            {password ? <EyeOff /> : <Eye />}
          </button>
        </div>
        <button
          onClick={submit}
          className="w-full bg-blue-700 text-white py-2 rounded"
        >
          Login
        </button>

        <button
          onClick={guestLogin}
          className="w-full bg-blue-700 text-white py-2 rounded my-4"
        >
          Login as a Guest
        </button>
        <p className="text-red-600 text-sm border p-2 rounded-md bg-red-300 ">
          Data deleted in 12 hours later in guest account
        </p>
      </div>
    </div>
  );
};

export default Login;
