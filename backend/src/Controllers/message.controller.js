import Conversation from "../Models/conversation.model.js";
import Message from "../Models/message.model.js";
import redis from "../Configs/redis.js";
import { getIO } from "../socket.js";

const EDIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const sendMessages = async (req, res) => {
  const senderId = req.user.id;
  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({
      message: "All feilds are required",
    });
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return res.status(404).json({
      message: "Conversation not found",
    });
  }

  if (!conversation.participants.some((id) => id.toString() === senderId)) {
    return res.status(403).json({
      message: "You are not a participant in this conversation.",
    });
  }

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== senderId,
  );

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    receiver: receiverId,
    text: text,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email avatar")
    .populate("receiver", "name email avatar");

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
  });
  await redis.del(`messages:${conversationId}:${senderId}`);
  await redis.del(`messages:${conversationId}:${receiverId}`);

  const io = getIO();
  io.to(conversationId).emit("receive-message", populatedMessage);
  return res.status(201).json(populatedMessage);
};

const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { cursor } = req.query;
  const userId = req.user.id;

  const MESSAGE_KEY = `messages:${conversationId}:${userId}`;

  const query = {
    conversation: conversationId,
    deletedFor: { $ne: userId },
  };

  if (cursor) {
    query.createdAt = {
      $lt: new Date(cursor),
    };
  }

  // Only use Redis for first page
  if (!cursor) {
    const cacheMessages = await redis.get(MESSAGE_KEY);

    if (cacheMessages) {
      console.log("Fetching Messages From Redis");

      const messages = JSON.parse(cacheMessages);

      return res.status(200).json({
        success: true,
        source: "redis",
        messages,
        nextCursor:
          messages.length > 0 ? messages[messages.length - 1].createdAt : null,
        hasMore: messages.length === 20,
      });
    }
  }

  console.log("Fetching Messages From MongoDB");

  const messages = await Message.find(query)
    .populate("sender", "name email avatar")
    .populate("receiver", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(20);

  const formattedMessages = messages.map((msg) => {
    if (msg.isDeleted) {
      return {
        ...msg.toObject(),
        text: "This message was deleted by the sender",
        isDeleted: true,
      };
    }

    return msg.toObject();
  });

  // Cache only first page
  if (!cursor) {
    await redis.set(MESSAGE_KEY, JSON.stringify(formattedMessages), "EX", 20);

    console.log("Messages cached in Redis");
  }

  return res.status(200).json({
    success: true,
    source: "mongodb",
    messages: formattedMessages,
    nextCursor:
      formattedMessages.length > 0
        ? formattedMessages[formattedMessages.length - 1].createdAt
        : null,
    hasMore: formattedMessages.length === 20,
  });
};

const deleteMessage = async (req, res) => {
  const loggedInUser = req.user.id;
  const { messageId } = req.params;
  const { deleteType } = req.body;

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({
      error: "Message Not Found",
    });
  }

  // Delete for me
  if (deleteType === "me") {
    if (!Array.isArray(message.deletedFor)) {
      message.deletedFor = [];
    }

    if (!message.deletedFor.includes(loggedInUser)) {
      message.deletedFor.push(loggedInUser);
      await message.save();
    }

    return res.status(200).json({
      message: "Deleted for me",
    });
  }

  // Delete for everyone
  if (deleteType === "everyone") {
    if (message.sender.toString() !== loggedInUser) {
      return res.status(403).json({
        error: "Only sender can delete for everyone.",
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        error: "Message already deleted.",
      });
    }

    message.isDeleted = true;
    message.text = "";
    await message.save();

    // Clear cached messages
    await redis.del(
        `messages:${message.conversation}:${participant.toString()}`,
      );

    // Notify users in real time
    const io = getIO();

    io.to(message.conversation.toString()).emit(
      "msg-deleted-by-sender",
      message._id,
    );

    return res.status(200).json({
      message: "Deleted for everyone",
    });
  }

  return res.status(400).json({
    error: "Invalid delete type.",
  });
};

const editMessage = async (req, res) => {
  const loggedInUser = req.user.id;
  const { messageId } = req.params;
  const { newText } = req.body;

  if (!newText?.trim()) {
    return res.status(400).json({
      error: "Message cannot be empty",
    });
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({
      error: "Message Not Found",
    });
  }

  if (message.sender.toString() !== loggedInUser) {
    return res.status(403).json({
      error: "Not authorized to edit this message",
    });
  }

  const now = Date.now();
  const elapsed = now - message.createdAt.getTime();

  if (elapsed > EDIT_WINDOW_MS) {
    return res.status(400).json({ error: "Edit window expired" });
  }

  message.text = newText;
  message.isEdited = true;
  message.editedAt = now;
  await message.save();

  if (conversation) {
    for (const participant of conversation.participants) {
      await redis.del(
        `messages:${message.conversation}:${participant.toString()}`,
      );
    }
  }

  const updatedMessage = await Message.findById(message._id)
    .populate("sender", "name email avatar")
    .populate("receiver", "name email avatar");

  const io = getIO();
  io.to(message.conversation.toString()).emit(
    "msg-edited-by-sender",
    updatedMessage,
  );

  return res.status(200).json(updatedMessage);
};

const readReceipt = async (req, res) => {
  const loggedInUser = req.user.id;
  const { conversationId } = req.params;

  const unreadMessages = await Message.find({
    conversation: conversationId,
    receiver: loggedInUser,
    isRead: false,
  });
  if (unreadMessages.length === 0) {
    return res.status(200).json({
      message: "No unread messages",
    });
  }

  const now = new Date();

  await Message.updateMany(
    { conversation: conversationId, receiver: loggedInUser, isRead: false },
    { $set: { isRead: true, readAt: now } },
  );

  const conversation = await Conversation.findById(
    conversationId,
  );

  if (conversation) {
    for (const participant of conversation.participants) {
      await redis.del(
        `messages:${conversationId}:${participant.toString()}`,
      );
    }
  }

  const io = getIO();

  io.to(conversationId).emit("messages-read", {
    conversationId,
    readBy: loggedInUser,
    isRead: true,
    readAt: now,
    messageIds: unreadMessages.map((m) => m._id.toString()),
  });

  return res.status(200).json({
    message: "Messages marked as read",
    count: unreadMessages.length,
  });
};

export default {
  sendMessages,
  getMessages,
  deleteMessage,
  editMessage,
  readReceipt,
};
