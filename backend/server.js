import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/configs/db.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/socket.js";

connectDB();

const server = http.createServer(app);
const io = initSocket(server);

io.on("connection", (socket) => {
  socket.on("join-user", (userId) => {
    socket.join(userId);
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("user_typing", ({ conversationId, username }) => {
    socket.to(conversationId).emit("display_typing", {
      username,
    });
  });

  // User stopped typing
  socket.on("user_stopped_typing", ({ conversationId }) => {
    socket.to(conversationId).emit("hide_typing");
  });

  socket.on("leave-conversation", (conversationId) => {
    socket.leave(conversationId);
  });
  socket.on("disconnect", () => {});
});


server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
