import express from "express";
import authRoutes from "./Routes/auth.routes.js";
import taskRoutes from "./Routes/task.routes.js";
import userRoutes from "./Routes/user.routes.js"
import conversationRoutes from "./Routes/conversation.routes.js"
import messagesRoutes from "./Routes/message.routes.js"
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser"
import errorMiddleware from "./Middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser())

// Authentication routes
app.use("/api/auth", authRoutes);

// Task routes
app.use("/api/tasks", taskRoutes);

// API USER ROUTES
app.use("/api/users", userRoutes);

//API CONVERSATION ROUTES
app.use("/api/conversations", conversationRoutes)

//API MESSAGES ROUTES
app.use("/api/messages", messagesRoutes)

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(errorMiddleware);

export default app;
