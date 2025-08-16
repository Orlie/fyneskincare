// src/components/ProductDetailsPage.jsx

import React, { useMemo } from 'react';

// You already created Card.jsx, so this import will work.
import Card from './Card';

// NOTE: You will need to create these components in their own files next!
// For now, we will define them here to fix the current error.
function QR({ url, size = 144, onClick }) {
    if (!url) return null;
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
    return <img src={src} alt="QR Code" width={size} height={size} onClick={onClick} role={onClick ? "button" : undefined} className="rounded-xl border border-white/20 bg-white/10 p-2" />;
}

function Badge({ children, tone }) {
    const m = { success: "border-emerald-400/30 bg-emerald-400/15 text-emerald-100", info: "border-sky-400/30 bg-sky-400/15 text-sky-100", default: "border-white/20 bg-white/10 text-white/80" };
    const cx = (...c) => c.filter(Boolean).join(" ");
    return <span className={cx("rounded-full border px-2 py-0.5 text-[11px] font-medium", m[tone] || m.default)}>{children}</span>;
}

// Helper function
const fmtDate = (iso) => {
    try { return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(iso)); } catch { return "—"; }
};

function ProductDetailsPage({ product, onBack, onCreateTask, myTask }) {
    const inWindow = useMemo(() => {
        const n = Date.now();
        return n >= new Date(product.availabilityStart).getTime() && n <= new Date(product.availabilityEnd).getTime();
    }, [product]);

    const isComplete = myTask?.status === "Complete";
    const hasOpenTask = myTask && !isComplete;

    const handleAction = () => {
        onCreateTask(product);
    }

    const cx = (...c) => c.filter(Boolean).join(" ");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition-colors">← Back to products</button>
            </div>
            <Card className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <img src={product.image} alt={product.title} className="w-full rounded-xl border border-white/10" />
                        <h2 className="text-2xl font-bold">{product.title}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge>{product.category}</Badge>
                            <Badge>{product.commission}</Badge>
                            {inWindow ? <Badge tone="success">Available now</Badge> : <Badge tone="warn">Out of window</Badge>}
                        </div>
                        <div className="text-sm text-white/80">Available: {fmtDate(product.availabilityStart)} → {fmtDate(product.availabilityEnd)}</div>
                        <div className="flex items-center gap-4 text-sm pt-2">
                            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">View Product Page</a>
                            <span className="text-white/30">•</span>
                            <a href={product.contentDocUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">Content Strategy Doc</a>
                        </div>
                    </div>
                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                            <h3 className="font-semibold mb-2">Add to Your Showcase</h3>
                            <p className="text-sm text-white/70 mb-4">This will create a task and open your unique affiliate link in TikTok.</p>
                            <button disabled={!inWindow || hasOpenTask || isComplete} onClick={handleAction} className={cx("w-full rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors mb-4", (!inWindow || hasOpenTask || isComplete) ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed" : "border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500")}>
                                {hasOpenTask ? "Task Already Open" : isComplete ? "Task Completed" : !inWindow ? "Not Available" : "Add to Showcase"}
                            </button>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <QR url={product.shareLink} onClick={handleAction} />
                                <button onClick={handleAction} className="text-xs text-sky-300 hover:underline">or tap here to Add to Showcase</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default ProductDetailsPage;