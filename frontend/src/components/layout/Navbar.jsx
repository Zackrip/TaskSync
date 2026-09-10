import { Menu, BellDot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import taskServices from "../../services/taskServices";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setNotifications } from "../../features/counter/notificationSlice";

const Navbar = ({ onToggleSidebar }) => {

  const isChatPage = location.pathname.startsWith("/chat");

  const storedUser = localStorage.getItem("user");

  const user =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const notifications = useSelector(
    (state) => state.notification.notifications,
  );
  // Initialize dispatch for Redux actions
  const dispatch = useDispatch();

  const lastNotificationId = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navigate = useNavigate();

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      
      try {
        const data = await taskServices.getNotifications();

        dispatch(setNotifications(data));

        if (!data.length) return;

        const latest = data[0];

        if (!lastNotificationId.current) {
          lastNotificationId.current = latest._id;
          return;
        }

        if (latest._id !== lastNotificationId.current) {
          lastNotificationId.current = latest._id;

          toast.success("You have a new notification", {
            style: {
              background: "#4F46E5",
              color: "#fff",
            },
          });

          if (document.hidden && Notification.permission === "granted") {
            new Notification("Task Management Dashboard", {
              body: latest.message,
              icon: "/check.png",
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <button
            className="md:hidden hover:cursor-pointer"
            onClick={onToggleSidebar}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center gap-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `font-medium transition-all ${
                  isActive ? " text-indigo-700 border-b-2" : " text-black "
                }`
              }
            >
              Tasks
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                ` font-medium transition-all  ${
                  isActive ? " text-indigo-700 border-b-2 " : " text-black "
                }`
              }
            >
              Chat
            </NavLink>
          </div>
        </div>


        <div className="flex items-center gap-4 ">

          {!isChatPage && (
            <button
              onClick={() => navigate("/dashboard/create-task")}
              className="bg-indigo-600  hover:bg-indigo-700 text-white  p-2 md:px-6 md:py-2 rounded-lg hover:cursor-pointer"
            >
              New Task
            </button>
          )}

          <div className="relative flex items-center gap-2">
            <button
              className="relative p-2  rounded-full cursor-pointer hover:bg-gray-100"
              onClick={() => navigate("/dashboard/notifications")}
            >
              <BellDot className="text-indigo-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
           <NavLink
            to="/profile"
            className="flex items-center gap-2 hover:cursor-pointer"
          >
             <button className="text-base md:text-xl font-semibold bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full text-gray-800 cursor-pointer">
              {user?.name} 
            </button>
          </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
