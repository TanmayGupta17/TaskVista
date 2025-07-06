"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
require("dotenv").config();
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const backendUrl = (
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      ).replace(/\/$/, "");
      const newSocket = io(backendUrl, {
        auth: { token },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setConnected(false);
      });

      newSocket.on("task-created", (task) => {
        setTasks((prev) => [...prev, task]);
      });

      newSocket.on("task-updated", (updatedTask) => {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
      });

      newSocket.on("task-deleted", (taskId) => {
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
      });

      newSocket.on("conflict-detected", (conflictData) => {
        console.log("Conflict detected:", conflictData);
        // Handle conflict modal display
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, token]);

  const createTask = (taskData) => {
    if (socket) {
      socket.emit("create-task", taskData);
    }
  };

  const updateTask = (taskId, updates, version) => {
    if (socket) {
      socket.emit("task-update", { taskId, updates, version });
    }
  };

  const deleteTask = (taskId) => {
    if (socket) {
      socket.emit("delete-task", taskId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        tasks,
        setTasks,
        connected,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
