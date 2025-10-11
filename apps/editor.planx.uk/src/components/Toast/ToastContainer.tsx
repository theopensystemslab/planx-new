import React from "react";

import Toast from "./Toast";
import { Toast as ToastComponent } from "./types";

const ToastContainer = ({ toasts }: { toasts: ToastComponent[] }) => {
  return (
    <div className="toasts-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
