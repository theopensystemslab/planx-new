export interface Toast {
  message: string;
  type: ToastType;
  id: number;
}
export type ToastType = "success" | "warning" | "info" | "error";

export type ToastState = {
  toasts: Toast[];
};

export type ToastAction = AddToast | DeleteToast;

type AddToast = {
  type: "ADD_TOAST";
  payload: Toast;
};

type DeleteToast = {
  type: "DELETE_TOAST";
  payload: { id: number };
};

export type ToastContextType = {
  addToast: (type: ToastType, message: string) => void;
  remove: (id: number) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  error: (message: string) => void;
};
