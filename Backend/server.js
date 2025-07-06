const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const logRoutes = require("./routes/logRoutes");
const { setupSocketHandlers } = require("./socket/sockethandler");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);

// Setup socket handlers
setupSocketHandlers(io);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server shutdown complete.");
    process.exit(0);
  });
});
