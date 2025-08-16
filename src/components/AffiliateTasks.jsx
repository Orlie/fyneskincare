// src/components/AffiliateMyTasks.jsx
import React from "react";
import { getAuth } from "firebase/auth";
import { getTasksByUser, updateTask } from "../utils/firestore";

const STATUS = ["Pending", "Video Submitted", "Ad Code Submitted", "Complete"];

function cx(...c) { return c.filter(Boolean).join(" "); }
function Card({ className = "", children }) {
    return <div className={cx("rounded-2xl border border-white/15 bg-white/5 p-3", className)}>{children}</div>;
}

export default function AffiliateTasks({ showToast }) {
    const [tasks, setTasks] = React.useState([]);
    const [busy, setBusy] = React.useState(false);

    const auth = getAuth();
    const user = auth.currentUser;

    const canLoad = !!user?.uid;

    const refresh = React.useCallback(async () => {
        if (!canLoad) return;
        setBusy(true);
        try {
            const data = await getTasksByUser(user.uid) || [];
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
    }, [canLoad, user?.uid]);

    React.useEffect(() => { refresh(); }, [refresh]);

    function setLocal(id, patch) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    }

    async function save(id, patch) {
        setLocal(id, patch);
        await updateTask(id, patch);
    }

    if (!canLoad) {
        return <Card>Please sign in to view your tasks.</Card>;
    }

    if (!tasks.length) {
        return (
            <Card>
                <div className="flex items-center justify-between">
                    <div>No tasks yet. Go to Products and create one.</div>
                    <button onClick={refresh} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs">Refresh</button>
                </div>
            </Card>
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
                                className="rounded-lg border border-white/20 bg-white text-black px-2 py-1 text-xs"
                            >
                                {STATUS.map((s) => (
                                    <option key={s} value={s} className="text-black bg-white">{s}</option>
                                ))}
                            </select>
                            <button onClick={refresh} disabled={busy} className={cx("rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs", busy && "opacity-60")}>Refresh</button>
                        </div>
                    </div>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <input
                            value={t.videoLink}
                            onChange={(e) => setLocal(t.id, { videoLink: e.target.value })}
                            onBlur={(e) => save(t.id, { videoLink: e.target.value, status: e.target.value ? "Video Submitted" : t.status })}
                            placeholder="TikTok video link"
                            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs"
                        />
                        <input
                            value={t.adCode}
                            onChange={(e) => setLocal(t.id, { adCode: e.target.value })}
                            onBlur={(e) => save(t.id, { adCode: e.target.value, status: e.target.value ? "Ad Code Submitted" : t.status })}
                            placeholder="Ad code"
                            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs"
                        />
                    </div>
                </Card>
            ))}
        </div>
    );
}
