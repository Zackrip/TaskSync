import express from "express";
import taskController from "../Controllers/task.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import protect from "../Middlewares/auth.middleware.js";
import asyncHandler from "../Middlewares/asyncHandler.js";

const router = express.Router();

router.get("/users", asyncHandler(taskController.allUsers));
router.post("/create-task", protect, asyncHandler(taskController.createTask));
router.patch("/update-task/:id", protect, asyncHandler(taskController.updateTask));
router.get("/get-notifications", protect, asyncHandler(taskController.getNotifications));
router.delete("/delete-notification/:id", protect, asyncHandler(taskController.deleteNotification));
router.delete("/delete-all-notifications/:id", protect, asyncHandler(taskController.deleteAllNotification));
router.delete("/delete-task/:id", protect, asyncHandler(taskController.deleteTask));
router.get("/tasks", asyncHandler(taskController.getAllTasks));

export default router;