import User from "../Models/user.model.js";
import Conversation from "../Models/conversation.model.js";

const createConversation = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  if (senderId.toString() === receiverId) {
    return res.status(400).json({
      message: "You cannot Chat with yourself.",
    });
  }

  let conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  res.status(200).json(conversation);
};

const getConversation = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  })
    .populate("participants", "-password")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender receiver",
        select: "name email avatar",
      },
    })
    .sort({ updatedAt: -1 });

  res.status(200).json(conversations);
};

export default {
  createConversation,
  getConversation,
};
