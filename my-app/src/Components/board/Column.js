"use client";

import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import styles from "@/styles/components/board.module.css";

const Column = ({ column, tasks, onEditTask, onSmartAssign }) => {
  return (
    <div className={styles.column}>
      <div
        className={styles.columnHeader}
        style={{ borderTopColor: column.color }}
      >
        <h3 className={styles.columnTitle}>{column.title}</h3>
        <span className={styles.taskCount}>{tasks.length}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${styles.columnContent} ${
              snapshot.isDraggingOver ? styles.dragOver : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onSmartAssign={onSmartAssign}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
