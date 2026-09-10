import express from "express";
import userController from "../Controllers/user.controller.js";
import verifyToken from "../Middlewares/auth.middleware.js";
import upload from "../Middlewares/multer.js";
import asyncHandler from "../Middlewares/asyncHandler.js";

const router = express.Router();

router.get("/users", verifyToken, userController.getAllUsers);
router.patch(
  "/update-user",
  verifyToken,
  upload.single("avatar"),
  asyncHandler(userController.updateUserDetails),
);
router.put(
  "/profile",
  verifyToken,
  upload.single("avatar"),
  asyncHandler(userController.updateUserDetails),
);

export default router;
