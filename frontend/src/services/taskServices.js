import api from "./api";

const getAllUsers = async () => {
  try {
    const response = await api.get("/tasks/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const getAllTasks = async () => {
  try {
    const response = await api.get("/tasks/tasks");
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

const updateTask= async (id, formData) => {
  try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await api.patch(`/tasks/update-task/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      return response.data;
  } catch (error) {
    console.log(error)
  }
}

const getNotifications = async () => {
 try {
    const response = await api.get("/tasks/get-notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

const deleteNotification = async (id) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await api.delete(`/tasks/delete-notification/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
const deleteAllNotification = async (id) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await api.delete(`/tasks/delete-all-notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};

const deleteTask = async (id) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await api.delete(`/tasks/delete-task/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    error
    throw error;
  }
};

export default {
  getAllUsers,
  getAllTasks,
  updateTask,
  getNotifications,
  deleteNotification,
  deleteAllNotification,
  deleteTask,
};