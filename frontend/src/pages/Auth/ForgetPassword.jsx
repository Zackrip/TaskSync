import { Link } from "react-router-dom";
import api from "../../services/api";
import { useState } from "react";
import { toast } from "react-toastify";

const ForgetPassword = () => {

  const [formData, setFormData] = useState({
    email: ""
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/forget-password", formData);
      toast.success("Reset Link Send To Your Registerd Email Please Check", {
              style: {
                background: "#4F46E5",
                color: "#fff",
              },
            });

    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          

          <h1 className=" text-indigo-600 text-xl font-bold tracking-tight">
            TaskSync
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">Professional Workspace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className=" flex flex-col justify-center ">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-3  py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-m text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}

            {/* Submit Button */}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              Send Reset Link
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

          {/* Login Link */}

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Login
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

export default ForgetPassword;
