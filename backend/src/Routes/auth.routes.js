import express from "express";
import authController from "../Controllers/auth.controller.js";
import asyncHandler from "../Middlewares/asyncHandler.js";
import validate from "../Middlewares/validate.js";

const router = express.Router();

router.post("/register", validate.registerUser, asyncHandler(authController.registerUser));
router.post("/login", validate.loginUser, asyncHandler(authController.loginUser));
router.post("/logout", asyncHandler(authController.logoutUser));


router.post("/forget-password", asyncHandler(authController.forgetPassword));
router.post("/reset-password/:token", validate.validateResetPassword, asyncHandler(authController.resetPassword));


router.post("/refresh-token", asyncHandler(authController.refreshToken));

router.post("/verify-otp", asyncHandler(authController.otpVerify));
router.post("/resend-otp/:otpToken", asyncHandler(authController.resendOtp))
router.get("/otp/ttl/:otpToken", asyncHandler(authController.otpTtl));

export default router;