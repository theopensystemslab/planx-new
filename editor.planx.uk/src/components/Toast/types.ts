export interface Toast {
  message: string;
  type: ToastType;
  id: string;
}
export type ToastType = "success" | "warning" | "info" | "error";

export type ToastState = {
  toasts: Toast[];
};

export type ToastAction = AddToast | RemoveToast;

type AddToast = {
  type: "ADD_TOAST";
  payload: Toast;
};

type RemoveToast = {
  type: "REMOVE_TOAST";
  payload: { id: string };
};

export type ToastContextType = {
  addToast: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  error: (message: string) => void;
};
