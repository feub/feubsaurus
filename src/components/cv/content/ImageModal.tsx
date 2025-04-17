import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  alt,
  onClose,
}: ImageModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`${styles.modalBackdrop} ${
        isVisible ? styles.modalVisible : ""
      }`}
      onClick={handleBackdropClick}
    >
      <div className={styles.modalContent}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          ×
        </button>
        <img src={imageUrl} alt={alt} className={styles.modalImage} />
      </div>
    </div>
  );
}
