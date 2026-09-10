import Notification from "../Models/notification.model.js";
import Task from "../Models/task.model.js";
import User from "../Models/user.model.js";
import redis from "../Configs/redis.js";
import { getIO } from "../socket.js";

// Get all users
const allUsers = async (req, res) => {
  const { name } = req.query;

  const allUsers = await User.find().select("-password");
  res.status(200).json(allUsers);
};

// Create a new task
const createTask = async (req, res) => {
  const { title, description, status, assignedTo, dueDate } = req.body;
  const createdBy = req.user.id;

  const newTask = await Task.create({
    title,
    description,
    status,
    createdBy,
    assignedTo,
    dueDate,
  });

  const notification = await Notification.create({
    user: newTask.assignedTo,
    sender: createdBy,
    task: newTask._id,
    type: "assigned",
    message: `🗒️ You have been assigned a new task: "${newTask.title}"`,
  });
  const io = getIO();

  io.to(notification.user.toString()).emit("new-notification", notification);

  return res.status(201).json({
    message: "Task Created Successfully",
    task: newTask,
  });
};

// Update a task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, assignedTo, status, dueDate } = req.body;

  const loggedInUser = req.user.id;

  const task = await Task.findById(id);
  if (!task) {
    return res.status(404).json({
      message: "Task Not Found",
    });
  }

  // Update Task Created By User
  if (task.createdBy.toString() === loggedInUser) {
    const oldAssignTo = task.assignedTo.toString();
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate || task.dueDate;

    await task.save();

    // Notify assignee is task created or updated
    const notification = await Notification.create({
      user: task.assignedTo,
      sender: loggedInUser,
      task: task._id,
      type: oldAssignTo === task.assignedTo.toString() ? "updated" : "assigned",
      message:
        oldAssignTo === task.assignedTo.toString()
          ? `✏️ Task "${task.title}" was updated`
          : `🗒️ You have been assigned a new task: "${task.title}"`,
    });
    const io = getIO();

    io.to(notification.user.toString()).emit("new-notification", notification);

    return res.status(200).json({
      message: "Task Updated Successfully",
    });
  }

  //Notify only when assignee changed Status
  else if (task.assignedTo.toString() === loggedInUser) {
    const oldStatus = task.status;
    task.status = status || task.status;

    await task.save();

    if (oldStatus !== task.status) {
      const notification = await Notification.create({
        user: task.createdBy,
        sender: loggedInUser,
        task: task._id,
        type: "statusChanged",
        message: `Task "${task.title}" status changed from "${oldStatus}" to "${task.status}"`,
      });
      const io = getIO();

      io.to(notification.user.toString()).emit(
        "new-notification",
        notification,
      );
    }

    return res.status(200).json({
      message: "Task Status Updated Successfully",
    });
  }

  return res.status(403).json({
    message: "You are not authorized to update this task",
  });
};

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id,
  })
    .populate("sender", "name")
    .populate("task", "title")
    .sort({ createdAt: -1 });

  res.status(200).json(notifications);
};

// Delete a notification
const deleteNotification = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  await Notification.findByIdAndDelete(id);
  return res.status(200).json({
    message: "Notification deleted successfully",
  });
  if (notification.isDeleted) {
    return res.status(404).json({
      message: "Notification already deleted",
    });
  }
  notification.isDeleted = true;
  await notification.save();

  res.status(200).json({
    message: "Notification deleted successfully",
  });
};

const deleteAllNotification = async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.deleteMany({ user: id });
  if (!notification) {
    return res.status(404).json({
      message: "Notification not found",
    });
  }

  return res.status(200).json({
    message: "Notification deleted successfully",
  });
  if (notification.isDeleted) {
    return res.status(404).json({
      message: "Notification already deleted",
    });
  }
  notification.isDeleted = true;
  await notification.save();

  res.status(200).json({
    message: "Notification deleted successfully",
  });
};

// Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  const loggedInUser = req.user.id;

  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  if (task.createdBy.toString() !== loggedInUser) {
    return res.status(403).json({
      message: "Only the creator can delete this task",
    });
  }

  await Task.findByIdAndDelete(id);

  return res.status(200).json({
    message: "Task Deleted Successfully",
  });
};

// Get all tasks
const getAllTasks = async (req, res) => {
  const tasks = await Task.find()
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  return res.status(200).json({
    success: true,
    tasks,
  });
};

export default {
  allUsers,
  createTask,
  updateTask,
  getNotifications,
  deleteNotification,
  deleteAllNotification,
  deleteTask,
  getAllTasks,
};
