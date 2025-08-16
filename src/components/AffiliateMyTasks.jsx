import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import Card from './Card';
import { Input, Badge, EmptyState } from "./common";
import { cx } from "./common/utils";
import { ClipboardDocumentListIcon } from "./common/icons";

const nowISO = () => new Date().toISOString();

export default function AffiliateMyTasks({ requests, setRequests, profile, showToast, setAffView }) {
  const mine = useMemo(() => {
    const currentUserEmail = auth.currentUser?.email;
    const currentUserId = auth.currentUser?.uid;
    return requests.filter(t => (
      (profile.email && t.affiliateEmail === profile.email) ||
      (profile.tiktok && t.affiliateTikTok === profile.tiktok) ||
      (currentUserId && t.affiliateUserId === currentUserId) ||
      (currentUserEmail && t.affiliateEmail === currentUserEmail)
    )).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, profile]);

  const [localTasks, setLocalTasks] = useState({});

  useEffect(() => {
    const initial = {};
    mine.forEach(task => {
      initial[task.id] = { videoLink: '', adCode: '' };
    });
    setLocalTasks(initial);
  }, [mine]);

  const handleInputChange = (id, field, value) => {
    setLocalTasks(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSubmit = async (id) => {
    const taskData = localTasks[id];
    if (!taskData.videoLink || !taskData.adCode) {
      showToast("Please provide both the TikTok video link and the ad code.", "error");
      return;
    }
    const taskDocRef = doc(db, "requests", id);
    await updateDoc(taskDocRef, { ...taskData, status: "Video Submitted", updatedAt: nowISO() });
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, ...taskData, status: "Video Submitted", updatedAt: nowISO() } : r)));
    showToast("Task submitted for review!", "success");
  };

  return (
    <Card className="p-3">
      <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
      <div className="grid grid-cols-1 gap-4">
        {mine.map((r) => {
          const localData = localTasks[r.id] || { videoLink: '', adCode: '', status: r.status };
          const isComplete = r.status === 'Complete';
          const isPendingInput = r.status === 'Pending';
          return (
            <div key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate" title={r.productTitle}>{r.productTitle}</div>
                  <div className="text-xs text-white/60">Requested: {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <Badge tone={isComplete ? 'success' : 'info'}>{r.status}</Badge>
              </div>

              <div className="space-y-3">
                <Input
                  id={`video-${r.id}`}
                  label="TikTok Video Link"
                  value={localData.videoLink}
                  onChange={(e) => handleInputChange(r.id, 'videoLink', e.target.value)}
                  placeholder="https://www.tiktok.com/..."
                  disabled={!isPendingInput}
                />
                <Input
                  id={`adcode-${r.id}`}
                  label="Ad Code"
                  value={localData.adCode}
                  onChange={(e) => handleInputChange(r.id, 'adCode', e.target.value)}
                  placeholder="e.g., TIKTOKAD123"
                  disabled={!isPendingInput}
                />
              </div>

              {isPendingInput && (
                <button
                  onClick={() => handleSubmit(r.id)}
                  className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  Submit for Review
                </button>
              )}
              {isComplete && <p className="text-sm text-green-300 text-center font-medium">🎉 This task is complete. Great job!</p>}
              {!isPendingInput && !isComplete && <p className="text-sm text-blue-300 text-center font-medium">This task is currently under review by an admin.</p>}
            </div>
          )
        })}
        {!mine.length && (
          <EmptyState
            icon={<ClipboardDocumentListIcon className="w-full h-full" />}
            title="No Tasks Yet"
            message="You haven't created any tasks. Browse the products and add one to your showcase to get started."
            actionText="Browse Products"
            onAction={() => setAffView("products")}
          />
        )}
      </div>
    </Card>
  );
}