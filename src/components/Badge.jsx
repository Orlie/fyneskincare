import React from 'react';

function Badge({ children, tone }) {
    const m = { success: "border-emerald-400/30 bg-emerald-400/15 text-emerald-100", info: "border-sky-400/30 bg-sky-400/15 text-sky-100", default: "border-white/20 bg-white/10 text-white/80" };
    const cx = (...c) => c.filter(Boolean).join(" ");
    return <span className={cx("rounded-full border px-2 py-0.5 text-[11px] font-medium", m[tone] || m.default)}>{children}</span>;
}

export default Badge;