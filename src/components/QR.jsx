import React from 'react';

function QR({ url, size = 144, onClick }) {
    if (!url) return null;
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    return <img src={src} alt="QR Code" width={size} height={size} onClick={onClick} role={onClick ? "button" : undefined} className="rounded-xl border border-white/20 bg-white/10 p-2" />;
}

export default QR;