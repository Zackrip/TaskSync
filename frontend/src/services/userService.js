import api from "./api";

const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const updateUserDetails = async (data) => {
  try {
    const response = await api.patch(`/users/update-user`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};

export default {
  getAllUsers,
  updateUserDetails,
};
