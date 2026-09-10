import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

const CreateTask = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    status: "SCHEDULED",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/tasks/users");
        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accessToken = localStorage.getItem("accessToken");

      await api.post("/tasks/create-task", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Task Created Successfully", {
        style: {
          background: "#4F46E5",
          color: "#fff",
        },
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-6">Create New Task</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Title
          </label>

          <input
            name="title"
            type="text"
            placeholder="Task title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            name="description"
            type="text"
            placeholder="Add details..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              AssignedTo
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:border-indigo-500"
            >
              <option>Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:border-indigo-500"
            >
              <option>SCHEDULED</option>
              {/* <option>IN PROGRESS</option>
              <option>COMPLETED</option> */}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Due Date
            </label>
            <input
              name="dueDate"
              type="date"
              min={today}
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 cursor-pointer"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
