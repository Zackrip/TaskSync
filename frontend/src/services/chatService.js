import api from "./api";

const getAllUsers = async () => {
  try {
    const response = await api.get("/users/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const createConversation = async (receiverId) => {
  const response = await api.post("/conversations/conversation", {
    receiverId,
  });

  return response.data;
};

const getConversation = async () => {
  const response = await api.get("/conversations/getconversations");
  return response.data;
};

const sendMessage = async (data) => {
  const response = await api.post("/messages", data);
  return response.data;
};

const getMessages = async (conversationId, cursor = null) => {
  try {
    const params = {};

    if (cursor) {
      params.cursor = cursor;
    }

    const response = await api.get(`/messages/${conversationId}`, { params });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const deleteMessage = async (messageId, deleteType) => {
  const response = await api.delete(`/messages/${messageId}`, {
    data: {
      deleteType,
    },
  });

  return response.data;
};

const editMessage = async (messageId, newText) => {
  try {
    const response = await api.patch(`/messages/${messageId}`, { newText });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const readReceiptes = async (conversationId) => {
  const response = await api.patch(`/messages/read/${conversationId}`);

  return response.data;
};

export default {
  getAllUsers,
  getMessages,
  sendMessage,
  createConversation,
  getConversation,
  deleteMessage,
  editMessage,
  readReceiptes
};
