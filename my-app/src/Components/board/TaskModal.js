"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import styles from "@/styles/components/modal.module.css";

const TaskModal = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { createTask, updateTask } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setAssignedTo(task.assignedTo._id);
    } else {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setAssignedTo(user?.id || "");
    }

    fetchUsers();
  }, [task, user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:8000"} /api/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const responseData = await response.json();
      // Adjust this line based on your backend response shape:
      console.log("Fetched users:", responseData);
      setUsers(Array.isArray(responseData) ? responseData : responseData.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const taskData = {
      title,
      description,
      priority,
      assignedTo,
    };

    try {
      if (task) {
        // Update existing task
        updateTask(task._id, taskData, task.version);
      } else {
        // Create new task
        createTask(taskData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {task ? "Edit Task" : "Create New Task"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={styles.select}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="assignedTo" className={styles.label}>
                Assign To
              </label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={styles.select}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? "Saving..." : task ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
