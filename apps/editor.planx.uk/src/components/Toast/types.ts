export interface Toast {
  message: string;
  type: ToastType;
  id: string;
  hideDuration?: number;
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
  success: (message: string, hideDuration?: number) => void;
  warning: (message: string, hideDuration?: number) => void;
  info: (message: string, hideDuration?: number) => void;
  error: (message: string, hideDuration?: number) => void;
};
