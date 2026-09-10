import express from "express";
import messageController from "../Controllers/message.controller.js";
import verifyToken from "../Middlewares/auth.middleware.js";
import asyncHandler from "../Middlewares/asyncHandler.js";
const router = express.Router();

router.post("/", verifyToken, asyncHandler(messageController.sendMessages));
router.get("/:conversationId", verifyToken, asyncHandler(messageController.getMessages));
router.delete("/:messageId", verifyToken, asyncHandler(messageController.deleteMessage));
router.patch("/:messageId", verifyToken, asyncHandler(messageController.editMessage));
router.patch("/read/:conversationId", verifyToken, asyncHandler(messageController.readReceipt));
export default router;
