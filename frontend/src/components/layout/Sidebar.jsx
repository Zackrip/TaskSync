import { LayoutDashboard, X, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import taskServices from "../../services/taskServices";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isChatPage = location.pathname.startsWith("/chat");

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await taskServices.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 h-screen flex flex-col bg-white border-r-3 border-gray-200
        overflow-auto hide-scrollbar scroll-smooth
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="h-20 flex  shrink-0 items-center justify-between px-4 border-gray-200">
        <div className="flex flex-col px-2">
          <h1 className="font-bold text-3xl text-indigo-600 ">TaskSync</h1>
          <h1 className=" uppercase text-xs font-medium text-gray-400 ">workspace</h1>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <X size={22} className="text-gray-500" />
        </button>
      </div>

      <div className="mt-5 px-2">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              isActive
                ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/chat"
          onClick={onClose}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 mt-2 px-4 py-3 rounded-lg font-medium transition-all ${
              isActive
                ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          <MessagesSquare size={20} />
          Chat
        </NavLink>
      </div>

      {!isChatPage && (
        <div className="mt-5 flex-1">
          <h3 className="px-6 mb-4 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Registered Users
          </h3>

          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user._id}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-red-100 ${user.color}`}
                >
                  {getInitials(user.name)}
                </div>

                <span className="text-gray-600 font-medium">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
