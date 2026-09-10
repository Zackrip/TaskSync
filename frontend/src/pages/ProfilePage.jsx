import { Edit3, Mail, ClipboardList } from "lucide-react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import taskServices from "../services/taskServices";
import userService from "../services/userService";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const storedUser = localStorage.getItem("user");
  const parsedUser =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const navigate = useNavigate();
  const [user, setUser] = useState(parsedUser);
  const [tasks, setTasks] = useState([]);
  const [formsData, setFormsData] = useState({
    name: parsedUser?.name || "",
    avatar: parsedUser?.avatar || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(parsedUser?.avatar || "");

  const getAvatarSrc = () => {
    if (avatarPreview.startsWith("http")) return avatarPreview;
    if (avatarPreview.startsWith("/"))
      return `http://localhost:3000${avatarPreview}`;
    return avatarPreview;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const file = files?.[0];

    if (name === "avatar") {
      if (!file) return;

      setFormsData((prev) => ({
        ...prev,
        avatar: file,
      }));
      setAvatarPreview(URL.createObjectURL(file));
      return;
    }

    setFormsData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("name", formsData.name);
      if (formsData.avatar instanceof File) {
        formData.append("avatar", formsData.avatar);
      }

      const response = await userService.updateUserDetails(formData);
      const updatedUser = response.user || { ...user, ...formsData };
      const stored = { ...user, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(stored));
      setUser(stored);
      toast.success("Profile updated successfully", {
        style: {
          background: "#4F46E5",
          color: "#fff",
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskServices.getAllTasks();
        setTasks(data.tasks);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTasks();
  }, []);

  

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-lg font-medium text-slate-900">
            No user data available.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Please login again to access your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              User profile
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Profile details
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex  items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 cursor-pointer"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
              onClick={handleSubmit}
            >
              <Edit3 size={16} />
              Save changes
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-3xl bg-slate-100 shadow-sm">
                <img
                  src={
                    getAvatarSrc() 
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {user.name}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formsData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Profile image URL
                </label>
                <input
                  name="avatar"
                  type="file"
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                />
              </div>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Task overview
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  Active assignments
                </h3>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
                <ClipboardList size={24} />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-600">
                  Active tasks assigned to you
                </p>
                <p className="mt-3 text-4xl font-semibold text-slate-900">
                  {
                    tasks?.filter((task) => task.assignedTo?._id === user._id)
                      .length
                  }
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Currently active tasks that are assigned to your account.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-600">
                  Tasks created by you
                </p>
                <p className="mt-3 text-4xl font-semibold text-slate-900">
                  {
                    tasks?.filter((task) => task.createdBy?._id === user._id)
                      .length
                  }
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Total tasks you have created and are managing in the
                  dashboard.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
