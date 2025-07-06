import React from "react";
import styles from "@/styles/components/ui.module.css";

const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
