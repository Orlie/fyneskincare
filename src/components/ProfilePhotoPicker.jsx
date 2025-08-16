import React, { useRef } from "react";
import { cx } from "./common/utils";

const ProfilePhotoPicker = ({ value, onChange }) => {
  const fileInputRef = useRef(null);
  const handlePick = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (readEvent) => {
      onChange(readEvent.target?.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
        onClick={handlePick}
      >
        {value ? (
          <img src={value} alt="Profile" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-xs text-white/50 text-center">Tap to add photo</span>
        )}
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />
    </div>
  );
};

export default ProfilePhotoPicker;