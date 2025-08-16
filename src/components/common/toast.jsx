import React, { useState, useRef, useEffect } from "react";
import { cx } from "./utils";
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from "./icons";

export function useToast() {
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef();

  const showToast = (message, type = 'info', duration = 3000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  const showUndoToast = (message, onUndo, duration = 5000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type: 'undo', onUndo });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  const hideToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  }

  return { toast, showToast, showUndoToast, hideToast };
}

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const { message, type, onUndo } = toast;

  const styles = {
    info: "bg-blue-600/80 border-blue-500",
    success: "bg-green-600/80 border-green-500",
    error: "bg-red-600/80 border-red-500",
    undo: "bg-purple-600/80 border-purple-500",
  };
  const Icon = {
    info: () => <ExclamationCircleIcon className="w-6 h-6 text-blue-100" />,
    success: () => <CheckCircleIcon className="w-6 h-6 text-green-100" />,
    error: () => <XCircleIcon className="w-6 h-6 text-red-100" />,
    undo: () => <ArrowPathIcon className="w-5 h-5 text-purple-100" />,
  }[type];

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6">
      <div className={cx("flex items-center gap-3 max-w-md w-full rounded-xl border px-4 py-3 text-sm shadow-lg text-white", styles[type], "backdrop-blur-md bg-opacity-70")}>
        <Icon />
        <span className="flex-1">{message}</span>
        {type === 'undo' && (
          <button onClick={() => { onUndo(); onDismiss(); }} className="font-semibold text-white/90 hover:text-white px-2 py-1 rounded-md transition-colors">Undo</button>
        )}
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <XCircleIcon className="w-5 h-5 opacity-80 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
