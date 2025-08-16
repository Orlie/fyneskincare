import React, { useMemo } from 'react';
import Card from './Card';
import { Badge, QR } from "./common";
import { cx } from "./common/utils";

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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-medium transition-colors">← Back to products</button>
            </div>
            <Card className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <img src={product.image} alt={product.title} className="w-full rounded-lg border border-white/10" />
                        <h2 className="text-2xl font-semibold text-white">{product.title}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {/* Assuming Badge component is accessible */}
                            <Badge tone="default">{product.category}</Badge>
                            <Badge tone="default">{product.commission}% Commission</Badge>
                            {inWindow ? <Badge tone="success">Available now</Badge> : <Badge tone="info">Out of window</Badge>}
                        </div>
                        <div className="text-sm text-white/80">Available: {fmtDate(product.availabilityStart)} → {fmtDate(product.availabilityEnd)}</div>
                        <div className="flex items-center gap-4 text-sm pt-2">
                            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Product Page</a>
                            <span className="text-white/30">•</span>
                            <a href={product.contentDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Content Strategy Doc</a>
                        </div>
                    </div>
                    <div className="space-y-6 flex flex-col justify-center">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                            <h3 className="font-semibold mb-2 text-white">Add to Your Showcase</h3>
                            <p className="text-sm text-white/70 mb-4">This will create a task and open your unique affiliate link in TikTok.</p>
                            <button disabled={!inWindow || hasOpenTask || isComplete} onClick={handleAction} className={cx("w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors", (!inWindow || hasOpenTask || isComplete) ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white")}>
                                {hasOpenTask ? "Task Already Open" : isComplete ? "Task Completed" : !inWindow ? "Not Available" : "Add to Showcase"}
                            </button>
                            <div className="flex flex-col items-center justify-center gap-2 mt-4">
                                <QR url={product.shareLink} onClick={handleAction} />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default ProductDetailsPage;
