import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useNavigate } from "react-router";
import { BiMessageSquareError } from "react-icons/bi";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  let navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-13 h-13  rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-200">
            <svg
              fill="#000000"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="800px"
              height="800px"
              viewBox="0 0 424.113 424.113"
              xmlSpace="preserve"
            >
              <g>
                <g>
                  <path
                    d="M376.955,120.307c-6.514,0-11.807,5.286-11.807,11.807v215.593c0,22.785-18.539,41.322-41.322,41.322H64.936
			                c-22.781,0-41.322-18.537-41.322-41.322V88.816c0-22.786,18.541-41.323,41.322-41.323h258.89c6.525,0,11.809-5.287,11.809-11.807
			                c0-6.521-5.281-11.807-11.809-11.807H64.936C29.137,23.88,0,53.01,0,88.815v258.891c0,35.806,29.137,64.936,64.936,64.936h258.89
			                c35.812,0,64.938-29.13,64.938-64.936V132.113C388.762,125.594,383.482,120.307,376.955,120.307z"
                  />
                  <path
                    d="M420.654,14.931c-4.611-4.612-12.096-4.612-16.693,0l-237.24,237.228l-59.297-59.291c-4.611-4.611-12.084-4.611-16.695,0
			                    c-4.611,4.612-4.611,12.086,0,16.695l67.656,67.639c2.307,2.308,5.328,3.459,8.348,3.459c3.021,0,6.043-1.151,8.348-3.459
			                    c0-0.006,0-0.012,0.012-0.018L420.654,31.625C425.266,27.017,425.266,19.539,420.654,14.931z"
                  />
                </g>
              </g>
            </svg>
          </div>

          <h1 className=" text-indigo-600 text-xl font-bold tracking-tight">
            TaskSync
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">Professional Workspace</p>
        </div>

        {/* Card */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="w-full pl-3  py-4 bg-red-200 border border-red-300 rounded-xl text-lg font-semibold text-red-900 flex items-center">
                <BiMessageSquareError className="mr-2" />
                {error}
              </div>
            )}

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email Address
              </label>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-3  py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-m text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-3  py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-m text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/forget-password")}
                  className="text-sm mt-2 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  Forgot your password?{" "}
                </button>
              </div>
            </div>

            {/* Submit Button */}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              Sign In
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* Divider */}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">
              Don't have an account?
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Link */}

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Register
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
