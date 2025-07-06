"use client";

import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/components/board.module.css";

const TaskCard = ({ task, index, onEdit, onSmartAssign }) => {
  const [showActions, setShowActions] = useState(false);
  const { deleteTask } = useSocket();
  const { user } = useAuth();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#e74c3c";
      case "Medium":
        return "#f39c12";
      case "Low":
        return "#27ae60";
      default:
        return "#95a5a6";
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(task._id);
    }
  };

  const canEdit =
    user?.id === task.createdBy._id || user?.id === task.assignedTo._id;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.taskCard} ${
            snapshot.isDragging ? styles.dragging : ""
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div className={styles.taskHeader}>
            <h4 className={styles.taskTitle}>{task.title}</h4>
            <div
              className={styles.priorityBadge}
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </div>
          </div>

          {task.description && (
            <p className={styles.taskDescription}>{task.description}</p>
          )}

          <div className={styles.taskFooter}>
            <div className={styles.assignedTo}>
              <span className={styles.assignedLabel}>Assigned to:</span>
              <span className={styles.assignedUser}>
                {task.assignedTo?.username || "Unassigned"}
              </span>
            </div>
            <span className={styles.taskDate}>
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>

          {showActions && (
            <div className={styles.taskActions}>
              {canEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className={styles.editButton}
                  title="Edit task"
                >
                  ✏️
                </button>
              )}
              <button
                onClick={() => onSmartAssign(task._id)}
                className={styles.smartAssignButton}
                title="Smart assign"
              >
                🎯
              </button>
              {canEdit && (
                <button
                  onClick={handleDelete}
                  className={styles.deleteButton}
                  title="Delete task"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
