import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "success" | "info"; // Type de toast (erreur, succès, info)
  duration?: number; // Durée en millisecondes (par défaut : 3000ms)
  onClose: () => void; // Fonction appelée lorsque le toast est fermé
}

const Toast: React.FC<ToastProps> = ({ message, type = "info", duration = 3000, onClose }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "info":
      default:
        return "#2196f3";
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer); // Nettoie le timer si le composant est démonté
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: getBackgroundColor(),
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
};

export default Toast;