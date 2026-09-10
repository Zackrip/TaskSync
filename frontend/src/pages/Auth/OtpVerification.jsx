import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import api from "../../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";

const OtpVerification = () => {
  const { otpToken } = useParams();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [ttl, setTtl] = useState(0);
  const [email, setEmail] = useState("");

  const minutes = Math.floor(ttl / 60);
  const seconds = ttl % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      const response = await api.post("/auth/verify-otp", {
        otpToken,
        otp: otpValue,
      });
      console.log(response.data);

      if (response.data.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    try {
      const response = await api.post(`/auth/resend-otp/${otpToken}`);

      setOtp(["", "", "", "", "", ""]);
      setError("");

      // Reset countdown
      setTtl(response.data.ttl);

      console.log(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  useEffect(() => {
    const getTtl = async () => {
      try {
        const response = await api.get(`/auth/otp/ttl/${otpToken}`);
        setTtl(response.data.ttl);
        setEmail(response.data.email);
      } catch (error) {
        console.log(error);
      }
    };
    getTtl();
  }, [otpToken]);

  useEffect(() => {
    if (ttl <= 0) return;

    const timer = setInterval(() => {
      setTtl((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ttl]);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center px-4 py-10">
      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-9">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_10px_rgba(79,70,229,0.25)]">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path
                d="M7 15L12 20L24 7"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-[20px] font-bold text-indigo-600">TaskSync</h1>

        <p className="text-sm text-gray-500 mt-1">Professional Workspace</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-112.5 bg-white border border-gray-100 rounded-2xl shadow-sm px-8 py-9">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-[24px] font-bold text-gray-950">
            Verify Your Email
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-6">
            We've sent a 6-digit verification code to
          </p>

          <p className="text-sm font-semibold text-gray-800 mt-1">{email}</p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="mt-8">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            Enter OTP
          </label>

          {/* OTP Inputs */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`
                  w-12 h-14 text-center text-xl font-semibold
                  rounded-lg border
                  outline-none
                  transition-all
                  ${
                    error
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }
                `}
              />
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

          {/* Timer */}
          <div className="text-center mt-6">
            {ttl > 0 ? (
              <p className="text-sm text-gray-500">
                OTP expires in{" "}
                <span className="font-semibold text-indigo-600">
                  {formattedTime}
                </span>
              </p>
            ) : (
              <p className="text-sm font-medium text-red-500">
                OTP has expired
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full mt-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            Verify OTP
            <ArrowRight size={18} />
          </button>

          {/* Resend */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">Didn't receive the code?</p>

            <button
              type="button"
              onClick={handleResend}
              disabled={ttl > 0}
              className={`mt-2 text-sm font-semibold inline-flex items-center gap-1.5 ${
                ttl > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              <RefreshCw size={15} />
              {ttl > 0 ? "Resend available after expiry" : "Resend OTP"}
            </button>
          </div>
        </form>

        {/* Back to Register */}
        <div className="border-t border-gray-200 mt-7 pt-6 text-center">
          <Link
            to="/register"
            type="button"
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={16} />
            Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
