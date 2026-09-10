import express from 'express'
import conversationController from "../Controllers/conversation.controller.js"
import verifyToken from "../Middlewares/auth.middleware.js";
import asyncHandler from '../Middlewares/asyncHandler.js';
const router = express.Router();

router.post('/conversation', verifyToken, asyncHandler(conversationController.createConversation));
router.get('/getconversations', verifyToken, asyncHandler(conversationController.getConversation));


export default router;