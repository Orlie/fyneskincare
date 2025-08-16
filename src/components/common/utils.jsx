export const cx = (...c) => c.filter(Boolean).join(" ");

export const fmtDate = (iso) => {
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(iso));
  } catch {
    return "—";
  }
};