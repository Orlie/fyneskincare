// src/components/AffiliateMyTasks.jsx
import React from "react";
import { listTasksByUser, updateTask } from "../utils/auth";
import Card from './Card';
import { Input, Badge, EmptyState } from "./common";
import { cx } from "./common/utils";
import { ClipboardDocumentListIcon } from "./common/icons";

export default function AffiliateMyTasks({ me, setAffView }) {
    const [tasks, setTasks] = React.useState([]);
    const [busy, setBusy] = React.useState(false);

    const canLoad = !!me?.id;

    const refresh = React.useCallback(() => {
        if (!canLoad) return;
        setBusy(true);
        try {
            const data = listTasksByUser(me.id) || [];
            // Ensure stable shape
            setTasks(
                data.map((t) => ({
                    ...t,
                    videoLink: t.videoLink || "",
                    adCode: t.adCode || "",
                    status: t.status || "Pending",
                }))
            );
        } finally {
            setBusy(false);
        }
    }, [canLoad, me?.id]);

    React.useEffect(() => { refresh(); }, [refresh]);

    function setLocal(id, patch) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    }

    async function save(id, patch) {
        setLocal(id, patch);
        updateTask(id, patch); // persists to localStorage via auth.js
    }

    if (!canLoad) {
        return <Card>Please sign in to view your tasks.</Card>;
    }

    if (!tasks.length) {
        return (
            <EmptyState
                icon={<ClipboardDocumentListIcon className="w-full h-full" />}
                title="No Tasks Yet"
                message="You haven't created any tasks. Browse the products and add one to your showcase to get started."
                actionText="Browse Products"
                onAction={() => setAffView("products")}
            />
        );
    }

    return (
        <div className="grid gap-3">
            {tasks.map((t) => (
                <Card key={t.id}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            {t.productImage ? (
                                <img src={t.productImage} alt="" className="h-12 w-12 rounded object-cover" />
                            ) : (
                                <div className="h-12 w-12 rounded bg-white/10" />
                            )}
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate" title={t.productTitle}>{t.productTitle}</div>
                                <div className="text-xs text-white/70 truncate">Created: {new Date(t.createdAt).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={t.status}
                                onChange={(e) => save(t.id, { status: e.target.value })}
                                className="rounded-lg border border-white/20 bg-white/10 text-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {STATUS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <button onClick={refresh} disabled={busy} className={cx("rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs", busy && "opacity-60")}>Refresh</button>
                        </div>
                    </div>

                    <div className="mt-2 space-y-2">
                        <Input
                            label="TikTok Video Link"
                            value={t.videoLink}
                            onChange={(e) => setLocal(t.id, { videoLink: e.target.value })}
                            onBlur={(e) => save(t.id, { videoLink: e.target.value, status: e.target.value ? "Video Submitted" : t.status })}
                            placeholder="https://www.tiktok.com/..."
                        />
                        <Input
                            label="Ad Code"
                            value={t.adCode}
                            onChange={(e) => setLocal(t.id, { adCode: e.target.value })}
                            onBlur={(e) => save(t.id, { adCode: e.target.value, status: e.target.value ? "Ad Code Submitted" : t.status })}
                            placeholder="e.g., TIKTOKAD123"
                        />
                    </div>
                </Card>
            ))}
        </div>
    );
}
