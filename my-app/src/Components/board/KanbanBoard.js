"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useSocket } from "@/contexts/SocketContext";
import { api } from "@/lib/api";
import Column from "./Column";
import TaskModal from "./TaskModal";
import styles from "@/styles/components/board.module.css";

const KanbanBoard = () => {
  const { tasks, setTasks, updateTask, connected } = useSocket();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: "Todo", title: "Todo", color: "#e74c3c" },
    { id: "In Progress", title: "In Progress", color: "#f39c12" },
    { id: "Done", title: "Done", color: "#27ae60" },
  ];

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:8000"}/api/tasks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Fetched tasks:", response.data);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId;

    if (task.status !== newStatus) {
      updateTask(task._id, { status: newStatus }, task.version);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
        }/api/tasks/${taskId}/smart-assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to smart assign task");
      }
      const data = await response.json();
      console.log("Smart assign response:", data);
      fetchTasks(); // Refresh tasks to show updated assignment
    } catch (error) {
      console.error("Smart assign failed:", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className={styles.kanbanBoard}>
      <div className={styles.boardHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Collaborative To-Do Board</h1>
          <div className={styles.statusIndicator}>
            <span
              className={`${styles.connectionStatus} ${
                connected ? styles.connected : styles.disconnected
              }`}
            >
              {connected ? "🟢 Connected" : "🔴 Disconnected"}
            </span>
          </div>
        </div>
        <button
          className={styles.addTaskButton}
          onClick={() => setShowTaskModal(true)}
        >
          + Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.boardColumns}>
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onEditTask={handleEditTask}
              onSmartAssign={handleSmartAssign}
            />
          ))}
        </div>
      </DragDropContext>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={fetchTasks}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
