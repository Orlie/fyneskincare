// src/components/ProfilePhotoPicker.jsx
import React from "react";

export default function ProfilePhotoPicker({ value = "", onChange }) {
    const [img, setImg] = React.useState(value || "");
    const fileRef = React.useRef(null);

    React.useEffect(() => {
        setImg(value || "");
    }, [value]);

    function pick() {
        fileRef.current?.click();
    }

    function handleFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result || "");
            setImg(dataUrl);
            onChange?.(dataUrl);
        };
        reader.readAsDataURL(file);
    }

    function onInputChange(e) {
        const f = e.target.files?.[0];
        handleFile(f);
    }

    function onDrop(e) {
        e.preventDefault();
        const f = e.dataTransfer?.files?.[0];
        handleFile(f);
    }

    function onDragOver(e) {
        e.preventDefault();
    }

    function clearPhoto() {
        setImg("");
        onChange?.("");
        if (fileRef.current) fileRef.current.value = "";
    }

    return (
        <div className="flex items-center gap-3" onDrop={onDrop} onDragOver={onDragOver}>
            {img ? (
                <img src={img} alt="Profile" className="h-14 w-14 rounded-full object-cover border border-white/20" />
            ) : (
                <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20" />
            )}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={pick}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                >
                    {img ? "Change photo" : "Upload photo"}
                </button>
                {img && (
                    <button
                        type="button"
                        onClick={clearPhoto}
                        className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                    >
                        Remove
                    </button>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onInputChange}
                className="hidden"
            />
        </div>
    );
}
