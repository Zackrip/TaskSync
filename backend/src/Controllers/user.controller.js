import Conversation from "../Models/conversation.model.js";
import Message from "../Models/message.model.js";
import User from "../Models/user.model.js";

const getAllUsers = async (req, res) => {
  const userId = req.user.id;

  const users = await User.find({
    _id: { $ne: userId },
  }).select("-password");

  const conversations = await Conversation.find({
    participants: userId,
  }).populate("lastMessage");

  const usersWithLastMessage = users.map((user) => {
    const conversation = conversations.find((conv) =>
      conv.participants.some((id) => id.toString() === user._id.toString()),
    );

    return {
      ...user.toObject(),
      lastMessage: conversation?.lastMessage || null,
    };
  });

  usersWithLastMessage.sort((a, b) => {
    return (
      new Date(b.lastMessage?.createdAt || 0) -
      new Date(a.lastMessage?.createdAt || 0)
    );
  });

  res.status(200).json(usersWithLastMessage);
};

const updateUserDetails = async (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      message: "User Not Found",
    });
  }

  user.name = name || user.name;
  if (req.file) {
    user.avatar = `/uploads/${req.file.filename}`;
  }

  await user.save();

  const { password, ...userWithoutPassword } = user.toObject();
  return res.status(200).json({
    message: "User Updated Successfully",
    user: userWithoutPassword,
  });
};

export default {
  getAllUsers,
  updateUserDetails,
};
