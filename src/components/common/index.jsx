import React, { useState, useRef } from "react";
import { cx } from "./utils";
import { EyeIcon, EyeSlashIcon, ClipboardDocumentListIcon } from "./icons";

export function Input({ id, label, type = "text", value, onChange, placeholder, error, hint, required, disabled = false }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = type === "password" && isPasswordVisible ? "text" : type;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-white/80 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cx(
            "w-full rounded-lg border bg-white/5 px-4 py-2.5 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200",
            error ? "border-red-400" : "border-white/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white"
          >
            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

export function QR({ url, size = 144, onClick }) {
  if (!url) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={cx(
        "rounded-lg border border-white/20 bg-white/10 p-2",
        onClick && "cursor-pointer hover:bg-white/20 transition-colors"
      )}
    />
  );
}

export function Badge({ children, tone }) {
  const m = {
    success: "border-green-400/30 bg-green-400/15 text-green-100",
    info: "border-blue-400/30 bg-blue-400/15 text-blue-100",
    default: "border-white/20 bg-white/10 text-white/80",
  };
  return (
    <span className={cx("rounded-full border px-2.5 py-0.5 text-xs font-medium", m[tone] || m.default)}>
      {children}
    </span>
  );
}

export function SkeletonLoader({ className }) {
  return <div className={cx("bg-white/10 animate-pulse rounded-lg", className)} />;
}

export function EmptyState({ icon, title, message, actionText, onAction }) {
  return (
    <Card className="p-8 text-center flex flex-col items-center">
      <div className="w-16 h-16 text-white/30 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold transition-colors"
        >
          {actionText}
        </button>
      )}
    </Card>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-4 text-center">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
    </div>
  );
}

export const SearchHighlight = ({ text, highlight }) => {
  if (!highlight || !text) return text;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-400/30 text-yellow-100">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
};