import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import taskServices from "../../services/taskServices.js";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import socket from "../../socket.js";

const statusColor = (status) => {
  switch (status) {
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    case "IN PROGRESS":
      return "bg-yellow-100 text-yellow-700";
    case "SCHEDULED":
      return "bg-gray-100 text-gray-600";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const getTaskStatus = (task) => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);

    if (task.status === "COMPLETED") {
      return "COMPLETED";
    }

    if (today > dueDate) {
      return "OVERDUE";
    }

    return task.status;
  };

  const storedUser = localStorage.getItem("user");
  const loggedInUser =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;


    useEffect(() => {
  if (loggedInUser?._id) {
    socket.emit("join-user", loggedInUser._id);
  }
}, [loggedInUser]);

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

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "You won't be able to recover this task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await taskServices.deleteTask(id);

      setTasks((prev) => prev.filter((task) => task._id !== id));

      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task.");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex mb-6 w-full p-2 items-center justify-center md:items-start md:justify-between">
        <div className="bg-white flex md-w-full p-4 space-x-4 rounded-xl ">
          <div>
            <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-200 text-gray-700 hover:bg-indigo-200"
              }`
            }
          >
            Assigned To Me
          </NavLink>
          </div>

          <span className="border-r border-gray-400"></span>

          <div>
            <NavLink
            to="/dashboard/assign-to-others"
            className={({ isActive }) =>
              `px-4 py-3  rounded-lg font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-gray-700 hover:bg-indigo-200"
              }`
            }
          >
            Assigned To Others
          </NavLink>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-2">
        {tasks?.filter((task) => task.assignedTo?._id === loggedInUser?._id)
          .map((task) => (
            <div
              key={task._id}
              className="bg-white border border-gray-200 hover:shadow-md
                    hover:border-indigo-300
                      transition-all
                      duration-200 rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-2xl text-gray-900">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold px-2.5 py-1 rounded-md whitespace-nowrap ${statusColor(getTaskStatus(task))}`}
                  >
                    {getTaskStatus(task)}
                  </span>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 mb-3 ">
                {task.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 ">
                <div className="flex items-center gap-4">
                  <span>
                    Created by{" "}
                    <span className="font-medium text-gray-600">
                      {task.createdBy?._id === loggedInUser?._id
                        ? "Me"
                        : task.createdBy?.name}
                    </span>
                  </span>
                  <span>
                    Assigned to{" "}
                    <span className="font-medium text-gray-600">
                      {task.assignedTo?._id === loggedInUser?._id
                        ? "Me"
                        : task.assignedTo?.name}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-600">
                    {new Date(task.createdAt).toLocaleString()}
                  </span>

                  <div className="flex">
                    Due:{" "}
                    <span className="font-medium text-gray-600">
                      {new Date(task.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/dashboard/update-task/${task._id}`)
                    }
                    className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                    title="Edit task"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
