import React, { useMemo } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Card from "./Card";
import { Stat } from "./common";
import { fmtDate } from "./common/utils";

export default function AffiliateStats({ requests, profile }) {
  const mine = useMemo(() => {
    const currentUserEmail = auth.currentUser?.email;
    const currentUserId = auth.currentUser?.uid;
    return requests.filter(t => (
      (profile.email && t.affiliateEmail === profile.email) ||
      (profile.tiktok && t.affiliateTikTok === profile.tiktok) ||
      (currentUserId && t.affiliateUserId === currentUserId) ||
      (currentUserEmail && t.affiliateEmail === currentUserEmail)
    ));
  }, [requests, profile]);

  const totals = useMemo(() => {
    const completedTasks = mine.filter(t => t.status === 'Complete');

    const perDay = {};
    mine.forEach((t) => {
      const d = (t.createdAt || "").slice(0, 10);
      perDay[d] = (perDay[d] || 0) + 1;
    });
    const days = 14;
    const now = new Date();
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, count: perDay[key] || 0 });
    }
    const max = Math.max(1, ...series.map((s) => s.count));
    return {
      requested: mine.length,
      completed: completedTasks.length,
      series,
      max
    };
  }, [mine]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stat label="Tasks Created" value={totals.requested} />
        <Stat label="Tasks Completed" value={totals.completed} />
      </div>
      <h3 className="text-sm font-semibold mb-2">My Activity (last 14 days)</h3>
      <div className="grid grid-cols-14 gap-1.5 h-32 items-end border-b border-white/10 pb-2">
        {totals.series.map((s) => (
          <div key={s.date} className="flex flex-col items-center gap-1 group">
            <div className="relative w-full h-full flex items-end">
              <div title={`${s.date}: ${s.count} tasks`} className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-md hover:from-blue-400 hover:to-blue-200 transition-colors" style={{ height: `${(s.count / totals.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 text-[10px] text-white/60">
        {totals.series.map((s, i) => (i % 2 === 0 ? <div key={s.date} className="text-center">{fmtDate(s.date)}</div> : <div key={s.date}></div>))}
      </div>
    </Card>
  );
}