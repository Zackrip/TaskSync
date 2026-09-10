import { useEffect } from "react";
import taskServices from "../services/taskServices";
import { View } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import socket from "../socket";

import {
  setNotifications,
  removeNotification,
  clearNotifications,
  addNotification,
} from "../features/counter/notificationSlice";

const NotificationPage = () => {
  const dispatch = useDispatch();

  const notifications = useSelector(
    (state) => state.notification.notifications
  );

  const storedUser = localStorage.getItem("user");
  const loggedInUser =
    storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;

  // Fetch existing notifications once
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await taskServices.getNotifications();
        dispatch(setNotifications(data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchNotifications();
  }, [dispatch]);


  useEffect(() => {
    if (!loggedInUser?._id) return;

    socket.emit("join-user", loggedInUser._id);

    const handleNotification = (notification) => {

      dispatch(addNotification(notification));
    };

    socket.on("new-notification", handleNotification);

    return () => {
      socket.off("new-notification", handleNotification);
    };
  }, [dispatch, loggedInUser]);

  const handledeleteNotifications = async (id) => {
    try {
      await taskServices.deleteNotification(id);
      dispatch(removeNotification(id));
    } catch (error) {
      console.log(error);
    }
  };

  const handledeleteAllNotifications = async () => {
    try {
      await taskServices.deleteAllNotification(loggedInUser._id);
      dispatch(clearNotifications());
    } catch (error) {
      console.log(error);
    }
  };

  if (!notifications.length) {
    return (
      <div className="flex text-2xl items-center justify-center h-full text-gray-800">
        No notifications Yet.
      </div>
    );
  }

  return (
    <div className="h-screen px-2">
      <div className="flex justify-between items-center border-b  py-3">
        <h2 className="text-lg font-semibold">Notifications</h2>

        <button
          onClick={handledeleteAllNotifications}
          className="flex items-center gap-2 cursor-pointer text-indigo-600"
        >
          <View size={18} />
          Mark All Read
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className="bg-white border border-gray-200 hover:shadow-md
                    hover:border-indigo-300
                      transition-all
                      duration-200 rounded-lg p-2"
          >
            <div className="flex justify-between">
              <p className="font-semibold text-xl text-indigo-500">
                {notification.message}
              </p>

              <button className="text-gray-500 hover:text-red-500 cursor-pointer"
                onClick={() =>
                  handledeleteNotifications(notification._id)
                }
              >
                <View size={18} />
              </button>
            </div>

            <div className="flex justify-between text-sm text-gray-800 mt-2">
              
              <span>Assigned by{" "}
                {notification.sender?._id === loggedInUser?._id
                  ? "Me"
                  : notification.sender?.name}
              </span>

              <span>
                {new Date(notification.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;