import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import ProfilePhotoPicker from "./components/ProfilePhotoPicker.jsx";

// Auth (localStorage demo)
import {
  ADMIN_USERNAME,
  loginAdmin,
  loginAffiliate,
  logout,
  isAdmin,
  isAffiliate,
  getSession,
  currentUser,
  registerAffiliate,
  listUsers,
  approveUser,
  rejectUser,
  ensureInit,
  profileFromUser,
} from "./utils/auth";

/*************************
 * SMALL HELPERS
 *************************/
const cx = (...c) => c.filter(Boolean).join(" ");
const nowISO = () => new Date().toISOString();
const fmtDate = (iso) => {
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(iso));
  } catch {
    return "—";
  }
};
const lsget = (k, f) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? f;
  } catch {
    return f;
  }
};
const lssave = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const toDTLocal = (iso) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const fromDTLocal = (s) => {
  const d = new Date(s);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toISOString();
};

/*************************
 * IMPORT / BULK HELPERS
 *************************/
const toBool = (v) => /^(\s*true\s*|\s*1\s*|\s*yes\s*)$/i.test(String(v ?? ""));
const toISOorNow = (v) => {
  if (!v) return nowISO();
  const d = new Date(v);
  return isNaN(d.getTime()) ? nowISO() : d.toISOString();
};
function normalizeProductRow(r) {
  return {
    id: (r.id ?? "").toString().trim() || `P_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category: (r.category ?? "Uncategorized").toString().trim(),
    title: (r.title ?? "Untitled").toString().trim(),
    image: (r.image ?? "").toString().trim(),
    shareLink: (r.shareLink ?? DEMO_LINK).toString().trim(),
    contentDocUrl: (r.contentDocUrl ?? "").toString().trim(),
    productUrl: (r.productUrl ?? "").toString().trim(),
    availabilityStart: toISOorNow(r.availabilityStart),
    availabilityEnd: toISOorNow(r.availabilityEnd),
    commission: (r.commission ?? "").toString().trim(),
    active: r.active !== undefined ? toBool(r.active) : true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
  };
}
function parseCSVText(csvText) {
  const { data, errors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  if (errors?.length) {
    const f = errors[0];
    throw new Error(`CSV parse error at row ${f.row ?? "?"}: ${f.message}`);
  }
  return data.map(normalizeProductRow);
}
function sheetUrlToCsv(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!m) return url;
    const id = m[1];
    let gid = "0";
    const g = (u.hash || "").match(/gid=(\d+)/);
    if (g) gid = g[1];
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  } catch {
    return url;
  }
}

/*************************
 * CONSTANTS
 *************************/
const STATUS = ["Pending", "Video Submitted", "Ad Code Submitted", "Complete"];
const LSK_PRODUCTS = "fyne_m_products_v1"; // App.jsx store (separate from utils/auth products)
const LSK_REQUESTS = "fyne_m_requests_v1"; // App.jsx task store
const LSK_PROFILE = "fyne_m_profile_v1"; // local profile card (demo)

const DEMO_LINK = "https://affiliate-us.tiktok.com/api/v1/share/AJ45Xdql7Qyv";

const SEED_PRODUCTS = [
  {
    id: "P001",
    category: "Serums & Essences",
    title: "FYNE Micro-Infusion Starter Kit",
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop",
    shareLink: DEMO_LINK,
    contentDocUrl: "https://docs.google.com/document/d/1ViralContentStrategyFYNE/view",
    productUrl: "https://snif.co/",
    availabilityStart: nowISO(),
    availabilityEnd: new Date(Date.now() + 14 * 864e5).toISOString(),
    commission: "25% per sale + $100/10hrs live (eligible)",
    active: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
  },
  {
    id: "P002",
    category: "Cleansers",
    title: "FYNE Gentle Renewal Cleanser",
    image:
      "https://images.unsplash.com/photo-1611930021588-4f74a0b6c0c1?q=80&w=1200&auto=format&fit=crop",
    shareLink: DEMO_LINK,
    contentDocUrl: "https://docs.google.com/document/d/1CreatorBriefCleanserFYNE/view",
    productUrl: "https://snif.co/",
    availabilityStart: nowISO(),
    availabilityEnd: new Date(Date.now() + 7 * 864e5).toISOString(),
    commission: "20% per sale",
    active: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
  },
  {
    id: "P003",
    category: "Moisturizers",
    title: "FYNE Hydro-Glass Moisturizer",
    image:
      "https://images.unsplash.com/photo-1585238342020-96629d9796d1?q=80&w=1200&auto=format&fit=crop",
    shareLink: DEMO_LINK,
    contentDocUrl: "https://docs.google.com/document/d/1HydroGlassBriefFYNE/view",
    productUrl: "https://snif.co/",
    availabilityStart: nowISO(),
    availabilityEnd: new Date(Date.now() + 30 * 864e5).toISOString(),
    commission: "25% per sale",
    active: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    deletedAt: null,
  },
];

/*************************
 * UI PRIMITIVES
 *************************/
function Card({ className, children, onClick, title }) {
  return (
    <div
      onClick={onClick}
      title={title}
      className={cx(
        "rounded-2xl border border-white/20 bg-white/10 backdrop-blur shadow-xl",
        onClick && "hover:bg-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}
function QR({ url, size = 144, onClick }) {
  if (!url) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    <img
      src={src}
      alt="QR"
      width={size}
      height={size}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={cx(
        "rounded-xl border border-white/20 bg-white/10 p-2",
        onClick && "cursor-pointer hover:bg-white/20"
      )}
    />
  );
}
function Badge({ children, tone }) {
  const m = {
    success: "border-emerald-400/30 bg-emerald-400/15 text-emerald-100",
    info: "border-sky-400/30 bg-sky-400/15 text-sky-100",
    default: "border-white/20 bg-white/10 text-white/80",
  };
  return (
    <span className={cx("rounded-full border px-2 py-0.5 text-[11px]", m[tone] || m.default)}>
      {children}
    </span>
  );
}
function Chip({ children, tone }) {
  const m = {
    warn: "border-yellow-400/30 bg-yellow-400/15 text-yellow-100",
    info: "border-sky-400/30 bg-sky-400/15 text-sky-100",
    muted: "border-white/20 bg-white/10 text-white/70",
    default: "border-white/20 bg-white/10",
  };
  return <span className={cx("rounded-full border px-2 py-0.5", m[tone] || m.default)}>{children}</span>;
}

/*************************
 * ROOT APP
 *************************/
export default function App() {
  const [tab, setTab] = useState("browse"); // browse | admin

  const [products, setProducts] = useState(() => {
    const saved = lsget(LSK_PRODUCTS, SEED_PRODUCTS);
    return saved.map((p) => ({
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deletedAt: null,
      ...p,
      createdAt: p.createdAt || nowISO(),
      updatedAt: p.updatedAt || nowISO(),
      deletedAt: p.deletedAt ?? null,
      active: p.active !== undefined ? p.active : true,
    }));
  });
  const [requests, setRequests] = useState(() => lsget(LSK_REQUESTS, []));
  const [toast, setToast] = useState("");

  // sessions
  const [session, setSessionState] = useState(() => getSession());
  const me = useMemo(() => currentUser(session), [session]);

  useEffect(() => {
    ensureInit();
  }, []);

  useEffect(() => {
    lssave(LSK_PRODUCTS, products);
  }, [products]);
  useEffect(() => {
    lssave(LSK_REQUESTS, requests);
  }, [requests]);

  const counts = useMemo(() => {
    const by = Object.fromEntries(STATUS.map((s) => [s, 0]));
    requests.forEach((r) => (by[r.status] = (by[r.status] || 0) + 1));
    return by;
  }, [requests]);

  return (
    <div className="min-h-screen w-full text-white bg-[radial-gradient(60%_40%_at_10%_10%,rgba(99,102,241,.35),transparent),radial-gradient(60%_40%_at_90%_10%,rgba(236,72,153,.35),transparent),radial-gradient(80%_60%_at_50%_90%,rgba(34,197,94,.25),transparent)]">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur bg-black/10 border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-400/70 to-sky-400/70 border border-white/40 flex items-center justify-center text-[11px] font-bold">
              FS
            </div>
            <div>
              <div className="text-base font-semibold">Fyne Skincare Creator Samples Hub</div>
              <div className="text-xs text-white/70">Glassy • Mobile-first</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setTab("browse")}
              className={cx(
                "px-3 py-1.5 rounded-lg text-sm border",
                tab === "browse" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20 hover:bg-white/20"
              )}
            >
              Affiliate
            </button>
            <button
              onClick={() => setTab("admin")}
              className={cx(
                "px-3 py-1.5 rounded-lg text-sm border",
                tab === "admin" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20 hover:bg-white/20"
              )}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-3 pb-24 pt-4 sm:px-4">
        {tab === "browse" ? (
          isAffiliate(session) ? (
            <AffiliateScreen
              session={session}
              products={products}
              requests={requests}
              setRequests={setRequests}
              setToast={setToast}
              me={me}
            />
          ) : (
            <AffiliateAuthPanel onAuthChange={() => setSessionState(getSession())} />
          )
        ) : isAdmin(session) ? (
          <AdminScreen
            products={products}
            setProducts={setProducts}
            requests={requests}
            setRequests={setRequests}
            counts={counts}
            me={me}
            onLogout={() => {
              logout();
              setSessionState(getSession());
            }}
          />
        ) : (
          <AdminLogin onSuccess={() => setSessionState(getSession())} />
        )}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="sm:hidden fixed bottom-2 left-1/2 z-30 -translate-x-1/2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-2 py-2 shadow-lg">
          <IconBtn active={tab === "browse"} label="Affiliate" onClick={() => setTab("browse")} />
          <IconBtn active={tab === "admin"} label="Admin" onClick={() => setTab("admin")} />
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 sm:bottom-6">
          <div className="max-w-md w-full rounded-xl border border-white/20 bg-white/20 backdrop-blur px-4 py-3 text-sm shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center gap-2 rounded-xl px-4 py-2 text-sm border",
        active ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20"
      )}
    >
      {label}
    </button>
  );
}

/*************************
 * AUTH UI
 *************************/
function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState(ADMIN_USERNAME);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  function submit() {
    const s = loginAdmin(username, password);
    if (s) onSuccess?.();
    else setErr("Login failed");
  }
  return (
    <Card className="p-4 max-w-md mx-auto">
      <div className="text-sm font-medium mb-2">Admin Login</div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-3"
      />
      {err && <div className="text-red-200 text-xs mb-2">{err}</div>}
      <button onClick={submit} className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm w-full">
        Sign in
      </button>
      <div className="text-[11px] text-white/60 mt-2">Hint: admin@fyne.app / admin123</div>
    </Card>
  );
}

function AffiliateAuthPanel({ onAuthChange }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tiktok, setTikTok] = useState("");
  const [discord, setDiscord] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function doLogin() {
    const s = loginAffiliate(email, password);
    if (s) onAuthChange?.();
    else setErr("Login failed");
  }
  function doRegister() {
    try {
      const ok = registerAffiliate({ email, password, displayName });
      if (!ok) {
        setErr("Email already registered");
        return;
      }
      setMsg("Registered! Await admin approval (or auto-approved).");
      setErr("");
      setMode("login");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <Card className="p-4 max-w-md mx-auto">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("login")}
          className={cx("rounded-lg border px-3 py-2 text-sm", mode === "login" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}
        >
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          className={cx("rounded-lg border px-3 py-2 text-sm", mode === "register" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}
        >
          Register
        </button>
      </div>
      {mode === "login" ? (
        <>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-3"
          />
          {err && <div className="text-red-200 text-xs mb-2">{err}</div>}
          {msg && <div className="text-emerald-200 text-xs mb-2">{msg}</div>}
          <button onClick={doLogin} className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm w-full">
            Sign in
          </button>
        </>
      ) : (
        <>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-2"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-2"
          />
          {/* Optional local-only fields (not persisted in auth.js) */}
          <input
            value={tiktok}
            onChange={(e) => setTikTok(e.target.value)}
            placeholder="TikTok (optional)"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-2"
          />
          <input
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            placeholder="Discord (optional)"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm mb-3"
          />
          {err && <div className="text-red-200 text-xs mb-2">{err}</div>}
          <button onClick={doRegister} className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm w-full">
            Create account
          </button>
          <div className="text-[11px] text-white/60 mt-2">After registration, admin must approve your account.</div>
        </>
      )}
    </Card>
  );
}

/*************************
 * AFFILIATE EXPERIENCE
 *************************/
function AffiliateScreen({ session, products, requests, setRequests, setToast, me }) {
  const [affView, setAffView] = useState("products"); // products | tasks | profile | stats

  // Local profile (synced from auth when possible)
  const [profile, setProfile] = useState(() => lsget(LSK_PROFILE, { tiktok: "", discord: "", email: "", photo: "" }));
  useEffect(() => lssave(LSK_PROFILE, profile), [profile]);
  useEffect(() => {
    if (me && isAffiliate(session)) setProfile((p) => ({ ...p, ...profileFromUser(me) }));
  }, [me?.id]);

  // Search, category, sorting
  const [q, setQ] = useState("");
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(products.filter((p) => p.active && !p.deletedAt).map((p) => p.category)))],
    [products]
  );
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest"); // newest | oldest

  // Which product is open
  const [sel, setSel] = useState(null);

  // map productId -> my open task
  const myTaskByProduct = useMemo(() => {
    const keyMatch = (t) =>
      (profile.email && t.affiliateEmail === profile.email) ||
      (profile.tiktok && t.affiliateTikTok === profile.tiktok) ||
      (me?.id && t.affiliateUserId === me.id);
    const map = {};
    requests.forEach((t) => {
      if (keyMatch(t) && t.status !== "Complete") {
        if (!map[t.productId] || new Date(t.createdAt) > new Date(map[t.productId].createdAt)) {
          map[t.productId] = t;
        }
      }
    });
    return map;
  }, [requests, profile, me?.id]);

  // visible products (hide those that already have an open task)
  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    let arr = products
      .filter((p) => p.active && !p.deletedAt)
      .filter((p) => (cat === "All" ? true : p.category === cat))
      .filter((p) => (t ? p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t) : true))
      .filter((p) => !myTaskByProduct[p.id]);
    arr.sort((a, b) => (sort === "newest" ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)));
    return arr;
  }, [products, q, cat, myTaskByProduct, sort]);

  // Photo change from picker
  function onPhotoChange(dataUrl) {
    setProfile((prev) => ({ ...prev, photo: dataUrl }));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Subnav */}
      <Card className="p-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            ["products", "Products"],
            ["tasks", "My Tasks"],
            ["profile", "Profile"],
            ["stats", "Stats"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setAffView(k)}
              className={cx("rounded-lg border px-3 py-2 text-sm", affView === k ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Pages */}
      {affView === "products" && (
        <>
          <Card className="p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {/* Category */}
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-white/20 bg-white text-black px-3 py-2 text-sm appearance-none">
                {cats.map((c) => (
                  <option key={c} value={c} className="text-black bg-white">{c}</option>
                ))}
              </select>
              {/* Search */}
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-white/40" />
              {/* Sort */}
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-white/20 bg-white text-black px-3 py-2 text-sm appearance-none">
                <option value="newest" className="text-black bg-white">Newest first</option>
                <option value="oldest" className="text-black bg-white">Oldest first</option>
              </select>
            </div>
          </Card>

          {/* Product grid */}
          {sel ? (
            <ProductDetailsPage
              product={sel}
              onBack={() => setSel(null)}
              requests={requests}
              setRequests={setRequests}
              profile={profile}
              setProfile={setProfile}
              onToast={(m) => {
                setToast(m);
                setTimeout(() => setToast(""), 2500);
              }}
              me={me}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {visible.map((p) => {
                const hasOpenTask = !!myTaskByProduct[p.id];
                const isComplete = false; // filtered already
                return (
                  <Card key={p.id} className="overflow-hidden cursor-pointer" onClick={() => setSel(p)} title="Open details">
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-base font-semibold leading-tight">{p.title}</div>
                          <div className="text-xs text-white/70">{p.category}</div>
                        </div>
                        <div className="flex gap-1">
                          {isComplete && <Badge tone="success">Completed</Badge>}
                          {hasOpenTask && <Badge tone="info">Task Open</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/80">{fmtDate(p.availabilityStart)} → {fmtDate(p.availabilityEnd)}</span>
                        <span className="text-[11px] rounded-full border border-white/20 bg-white/10 px-2 py-0.5">{p.commission}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {!visible.length && <Card className="p-6 text-center text-white/80">No products right now. Check back soon!</Card>}
            </div>
          )}
        </>
      )}

      {affView === "profile" && (
        <Card className="p-3">
          <div className="mb-2 text-sm font-medium">Your Affiliate Profile</div>
          <div className="flex items-center gap-3 mb-3">
            <ProfilePhotoPicker value={profile.photo || ""} onChange={onPhotoChange} />
            <div className="text-xs text-white/70">Photo is saved locally (demo).</div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input value={profile.tiktok} onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })} placeholder="TikTok username (e.g., @you)" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base" />
            <input value={profile.discord} onChange={(e) => setProfile({ ...profile, discord: e.target.value })} placeholder="Discord username (e.g., you#1234)" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base" />
            <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" type="email" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base" />
          </div>
          <div className="mt-2 text-[11px] text-white/70">Used to prevent duplicate tasks and show your progress.</div>
        </Card>
      )}

      {affView === "tasks" && (
        <Card className="p-3">
          <div className="mb-2 text-sm font-medium">My Pending Tasks</div>
          <AffiliateTasksPage requests={requests} setRequests={setRequests} profile={profile} me={me} />
        </Card>
      )}

      {affView === "stats" && <AffiliateStats requests={requests} profile={profile} me={me} />}
    </div>
  );
}

function handleCreateTaskAndGo(product, profile, requests, setRequests, setToast, me) {
  const ok = profile?.tiktok && profile?.discord && profile?.email;
  if (!ok) {
    setToast("Set your TikTok, Discord, and Email in profile first.");
    return;
  }
  const exists = requests.find(
    (t) =>
      t.productId === product.id &&
      (t.affiliateEmail === profile.email || t.affiliateTikTok === profile.tiktok) &&
      t.status !== "Complete"
  );
  if (exists) {
    setToast("You already have an open task for this product.");
    return;
  }
  const entry = {
    id: `TASK_${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    shareLink: product.shareLink,
    status: "Pending",
    createdAt: nowISO(),
    updatedAt: nowISO(),
    affiliateTikTok: profile.tiktok,
    affiliateDiscord: profile.discord,
    affiliateEmail: profile.email,
    affiliateUserId: me?.id || null,
    videoLink: "",
    adCode: "",
  };
  const next = [entry, ...requests];
  lssave(LSK_REQUESTS, next);
  setRequests(next);
  window.open(product.shareLink, "_blank", "noopener,noreferrer");
}

// Full product page
function ProductDetailsPage({ product, onBack, requests, setRequests, profile, setProfile, onToast, me }) {
  const [tiktok, setTikTok] = useState(profile.tiktok || "");
  const [discord, setDiscord] = useState(profile.discord || "");
  const [email, setEmail] = useState(profile.email || "");

  useEffect(() => setProfile({ ...profile, tiktok, discord, email }), [tiktok, discord, email]);

  const canCreate = tiktok && discord && email;
  const inWindow = useMemo(() => {
    const n = Date.now();
    return n >= new Date(product.availabilityStart).getTime() && n <= new Date(product.availabilityEnd).getTime();
  }, [product]);

  const myTask = useMemo(() => {
    return requests
      .filter(
        (t) =>
          t.productId === product.id &&
          ((email && t.affiliateEmail === email) || (tiktok && t.affiliateTikTok === tiktok) || (me?.id && t.affiliateUserId === me.id))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [requests, product, email, tiktok, me?.id]);

  const isComplete = myTask?.status === "Complete";
  const hasOpenTask = myTask && myTask.status !== "Complete";

  function createTaskAndGo() {
    if (!canCreate) return;
    handleCreateTaskAndGo(product, { tiktok, discord, email }, requests, setRequests, onToast, me);
  }

  function submitVideoAndCode(vLink, code) {
    if (!myTask) return;
    const updated = requests.map((t) => (t.id === myTask.id ? { ...t, videoLink: vLink, adCode: code, updatedAt: nowISO() } : t));
    lssave(LSK_REQUESTS, updated);
    setRequests(updated);
    onToast("Submitted! Admin will review.");
  }

  const [videoLink, setVideoLink] = useState(myTask?.videoLink || "");
  const [adCode, setAdCode] = useState(myTask?.adCode || "");
  useEffect(() => {
    setVideoLink(myTask?.videoLink || "");
    setAdCode(myTask?.adCode || "");
  }, [myTask?.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm">← Back to products</button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-3">
            <img src={product.image} alt={product.title} className="w-full rounded-xl border border-white/20" />
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5">{product.category}</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5">{product.commission}</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5">{fmtDate(product.availabilityStart)} → {fmtDate(product.availabilityEnd)}</span>
              {inWindow ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-emerald-100">Available now</span>
              ) : (
                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/15 px-2 py-0.5 text-yellow-100">Out of window</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="underline">View Product</a>
              <span className="text-white/50">•</span>
              <a href={product.contentDocUrl} target="_blank" rel="noopener noreferrer" className="underline">Content Strategy (Google Doc)</a>
            </div>
            <div className="flex flex-col items-center justify-center pt-2 gap-2">
              <QR url={product.shareLink} onClick={createTaskAndGo} />
              <div className="text-[11px] text-white/70">Tap QR to create task and open showcase</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Create Task (no shipping)</div>
            <div className="grid grid-cols-1 gap-2">
              <input value={tiktok} onChange={(e) => setTikTok(e.target.value)} placeholder="TikTok username (e.g., @you)" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base" />
              <input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="Discord username (e.g., you#1234)" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-base" />
            </div>
            <div className="flex gap-2">
              <button
                disabled={!canCreate || isComplete || hasOpenTask}
                onClick={createTaskAndGo}
                className={cx(
                  "flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-sm",
                  (!canCreate || isComplete || hasOpenTask) && "opacity-60 cursor-not-allowed"
                )}
              >
                Add to Showcase
              </button>
              <a href={product.productUrl || "#"} target="_blank" rel="noopener noreferrer" className={cx("rounded-xl px-4 py-2 text-sm border", !canCreate && "opacity-100")}>
                Product Page
              </a>
            </div>

            <div className="mt-2 border-t border-white/10 pt-3">
              <div className="text-sm font-medium mb-2">Submit FYNE Video + Ad Code</div>
              {isComplete ? (
                <div className="text-[12px] text-emerald-200">Task complete — thank you! 🎉</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <input value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="TikTok video link" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
                  <input value={adCode} onChange={(e) => setAdCode(e.target.value)} placeholder="Ad code" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
                  <button
                    disabled={!myTask}
                    onClick={() => submitVideoAndCode(videoLink, adCode)}
                    className={cx("rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm", !myTask && "opacity-60 cursor-not-allowed")}
                  >
                    Submit for Review
                  </button>
                  {hasOpenTask && <div className="text-[11px] text-white/70">Status: {myTask.status}. Admin will update after review.</div>}
                </div>
              )}
            </div>
            <div className="text-[11px] text-white/70">You can only complete a product once. Create more videos across other FYNE products.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// My Tasks page (affiliate): no status dropdown; inputs for video/adcode
function AffiliateTasksPage({ requests, setRequests, profile, me }) {
  const mine = useMemo(() => {
    const isMine = (t) =>
      (profile.email && t.affiliateEmail === profile.email) ||
      (profile.tiktok && t.affiliateTikTok === profile.tiktok) ||
      (me?.id && t.affiliateUserId === me.id);
    return requests.filter(isMine).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [requests, profile, me?.id]);

  function save(id, patch) {
    const next = requests.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r));
    lssave(LSK_REQUESTS, next);
    setRequests(next);
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {mine.map((r) => (
        <div key={r.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" title={r.productTitle}>{r.productTitle}</div>
              <div className="text-xs text-white/70 truncate">{r.affiliateTikTok} • {r.affiliateDiscord} • {r.affiliateEmail}</div>
            </div>
            <a href={r.shareLink} target="_blank" rel="noreferrer" className="underline text-xs">Showcase</a>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 text-xs">
            <input value={r.videoLink || ""} onChange={(e) => save(r.id, { videoLink: e.target.value })} placeholder="TikTok video link" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2" />
            <input value={r.adCode || ""} onChange={(e) => save(r.id, { adCode: e.target.value })} placeholder="Ad code" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2" />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-[11px] text-white/70">{new Date(r.createdAt).toLocaleString()}</div>
            <span className="text-[11px] rounded-full border border-white/20 bg-white/10 px-2 py-0.5">{r.status}</span>
          </div>
        </div>
      ))}
      {!mine.length && <div className="text-white/70">No tasks yet.</div>}
    </div>
  );
}

// Affiliate stats with tiny chart
function AffiliateStats({ requests, profile, me }) {
  const mine = useMemo(() => {
    const isMine = (t) =>
      (profile.email && t.affiliateEmail === profile.email) ||
      (profile.tiktok && t.affiliateTikTok === profile.tiktok) ||
      (me?.id && t.affiliateUserId === me.id);
    return requests.filter(isMine);
  }, [requests, profile, me?.id]);

  const totals = useMemo(() => {
    const requested = mine.length;
    const withVideo = mine.filter((t) => t.videoLink).length;
    const withCode = mine.filter((t) => t.adCode).length;
    // per-day series for created tasks and submissions
    const perReq = {};
    const perSub = {};
    mine.forEach((t) => {
      const d = (t.createdAt || "").slice(0, 10);
      perReq[d] = (perReq[d] || 0) + 1;
      if (t.videoLink || t.adCode) perSub[d] = (perSub[d] || 0) + 1;
    });
    const days = 14;
    const now = new Date();
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, req: perReq[key] || 0, sub: perSub[key] || 0 });
    }
    const max = Math.max(1, ...series.map((s) => Math.max(s.req, s.sub)));
    return { requested, withVideo, withCode, series, max };
  }, [mine]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Requested" value={totals.requested} />
        <Stat label="Videos" value={totals.withVideo} />
        <Stat label="Ad Codes" value={totals.withCode} />
      </div>
      <div className="text-sm mb-2">My progress (last 14 days)</div>
      <div className="grid grid-cols-14 gap-1 h-32 items-end">
        {totals.series.map((s) => (
          <div key={s.date} className="flex flex-col gap-1">
            <div title={`Submissions ${s.sub}`} className="w-3 bg-emerald-300/80 rounded" style={{ height: `${(s.sub / totals.max) * 100}%` }} />
            <div title={`Requests ${s.req}`} className="w-3 bg-white/60 rounded" style={{ height: `${(s.req / totals.max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 text-[10px] text-white/60">
        {totals.series.map((s, i) => (i % 2 === 0 ? <div key={s.date}>{s.date.slice(5)}</div> : <div key={s.date}></div>))}
      </div>
    </Card>
  );
}

/*************************
 * ADMIN
 *************************/
function AdminScreen({ products, setProducts, requests, setRequests, counts, me, onLogout }) {
  const [view, setView] = useState("overview");
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Products" value={products.filter((p) => p.active && !p.deletedAt).length} />
        <Stat label="Pending" value={counts["Pending"] || 0} />
        <Stat label="Video Submitted" value={counts["Video Submitted"] || 0} />
        <Stat label="Complete" value={counts["Complete"] || 0} />
      </div>

      <div className="flex gap-2">
        <button onClick={() => setView("overview")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "overview" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>
          Overview
        </button>
        <button onClick={() => setView("requests")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "requests" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>
          Tasks
        </button>
        <button onClick={() => setView("products")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "products" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>
          Products
        </button>
        <button onClick={() => setView("users")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "users" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>
          Users
        </button>
        <div className="flex-1" />
        <button onClick={onLogout} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Logout</button>
      </div>

      {view === "overview" ? (
        <OverviewPanel requests={requests} />
      ) : view === "requests" ? (
        <RequestsPanel requests={requests} setRequests={setRequests} />
      ) : view === "products" ? (
        <ProductsPanel products={products} setProducts={setProducts} />
      ) : (
        <UsersPanel />
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/70">{label}</div>
    </div>
  );
}

// Local summary helpers (replacing summarizeTasks & seriesFromPerDay that don't exist in auth.js)
function summarizeTasksLocal(requests) {
  const total = requests.length;
  const byStatus = {};
  const perDay = {};
  for (const r of requests) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const d = (r.createdAt || "").slice(0, 10);
    perDay[d] = (perDay[d] || 0) + 1;
  }
  return { total, byStatus, perDay };
}
function seriesFromPerDayLocal(perDay, days) {
  const out = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
    out.push({ date: d, count: perDay[d] || 0 });
  }
  return out;
}

function OverviewPanel({ requests }) {
  const stats = useMemo(() => summarizeTasksLocal(requests), [requests]);
  const series = useMemo(() => seriesFromPerDayLocal(stats.perDay, 14), [stats]);
  const max = Math.max(1, ...series.map((s) => s.count));
  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.byStatus["Pending"] || 0} />
        <Stat label="Video" value={stats.byStatus["Video Submitted"] || 0} />
        <Stat label="Complete" value={stats.byStatus["Complete"] || 0} />
      </div>
      <div className="text-sm mb-2">Requests last 14 days</div>
      <div className="flex items-end gap-1 h-32">
        {series.map((s) => (
          <div key={s.date} title={`${s.date}: ${s.count}`} className="flex-1 bg-white/70 rounded" style={{ height: `${(s.count / max) * 100}%` }} />
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 text-[10px] text-white/60">
        {series.map((s, i) => (i % 2 === 0 ? <div key={s.date}>{s.date.slice(5)}</div> : <div key={s.date}></div>))}
      </div>
    </Card>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState(() => listUsers());
  function refresh() {
    setUsers(listUsers());
  }
  return (
    <Card className="p-3">
      <div className="mb-2 text-sm font-medium">Affiliates</div>
      <div className="grid grid-cols-1 gap-2">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-white/15 bg-white/5 p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{u.displayName || u.email}</div>
              <div className="text-xs text-white/70 truncate">{u.email} • {u.tiktok} • {u.discord}</div>
              <div className="text-[11px] text-white/60">Status: {u.status}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { approveUser(u.id); refresh(); }} className="rounded-lg border border-emerald-400/40 bg-emerald-400/15 px-2 py-1 text-xs">Approve</button>
              <button onClick={() => { rejectUser(u.id); refresh(); }} className="rounded-lg border border-rose-400/40 bg-rose-400/15 px-2 py-1 text-xs">Reject</button>
            </div>
          </div>
        ))}
        {!users.length && <div className="text-white/70">No affiliates yet.</div>}
      </div>
    </Card>
  );
}

function RequestsPanel({ requests, setRequests }) {
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (status === "All" ? true : r.status === status) &&
          (q
            ? r.productTitle.toLowerCase().includes(q.toLowerCase()) ||
            r.affiliateTikTok?.toLowerCase().includes(q.toLowerCase()) ||
            r.affiliateEmail?.toLowerCase().includes(q.toLowerCase())
            : true)
      ),
    [requests, status, q]
  );
  function updateStatus(id, s) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: s, updatedAt: nowISO() } : r)));
  }
  function exportCSV() {
    const rows = filtered;
    if (!rows.length) return;
    const cols = [
      "createdAt",
      "productTitle",
      "affiliateTikTok",
      "affiliateDiscord",
      "affiliateEmail",
      "videoLink",
      "adCode",
      "status",
    ];
    const header = cols.join(",");
    const body = rows.map((r) => cols.map((k) => `"${String(r[k] ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const csv = header + "\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fyne_tasks_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Card className="p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-white/20 bg-white text-black px-3 py-2 text-sm">
            {["All", ...STATUS].map((s) => (
              <option key={s} value={s} className="text-black bg-white">{s}</option>
            ))}
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tiktok/email/product…" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm" />
        </div>
        <button onClick={exportCSV} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Export CSV</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" title={r.productTitle}>{r.productTitle}</div>
                <div className="text-xs text-white/70 truncate">{r.affiliateTikTok} • {r.affiliateDiscord} • {r.affiliateEmail}</div>
              </div>
              <a href={r.shareLink} target="_blank" rel="noreferrer" className="underline text-xs">Showcase</a>
            </div>
            {(r.videoLink || r.adCode) && (
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs">
                {r.videoLink && (
                  <a className="underline truncate" href={r.videoLink} target="_blank" rel="noreferrer">Video: {r.videoLink}</a>
                )}
                {r.adCode && (
                  <div>Ad Code: <span className="font-mono">{r.adCode}</span></div>
                )}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[11px] text-white/70">{new Date(r.createdAt).toLocaleString()}</div>
              <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded-lg border border-white/20 bg-white text-black px-2 py-1 text-xs">
                {STATUS.map((s) => (
                  <option key={s} value={s} className="text-black bg-white">{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <div className="rounded-xl border border-white/15 bg-white/5 p-6 text-center text-white/70">No tasks yet.</div>
        )}
      </div>
    </Card>
  );
}

// Products (admin) with white dropdowns + black text
function ProductsPanel({ products, setProducts }) {
  const [f, setF] = useState({
    id: "",
    category: "Serums & Essences",
    title: "",
    image: "",
    shareLink: DEMO_LINK,
    contentDocUrl: "",
    productUrl: "",
    availabilityStart: nowISO(),
    availabilityEnd: new Date(Date.now() + 14 * 864e5).toISOString(),
    commission: "25% per sale",
    active: true,
  });

  const [bulk, setBulk] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);

  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [recentDays, setRecentDays] = useState(7);
  const [sort, setSort] = useState("newest");

  const enriched = useMemo(() => {
    const now = Date.now();
    return products.map((p) => {
      const expired = new Date(p.availabilityEnd).getTime() < now;
      const deleted = !!p.deletedAt || p.active === false;
      return { ...p, expired, deleted };
    });
  }, [products]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const recentCut = Date.now() - recentDays * 864e5;
    let arr = enriched.filter((p) => {
      const matches = t ? p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t) : true;
      if (!matches) return false;
      switch (filter) {
        case "Active":
          return p.active && !p.deletedAt;
        case "Hidden":
          return !p.active || !!p.deletedAt;
        case "Expired":
          return p.expired;
        case "Recently Added":
          return new Date(p.createdAt).getTime() >= recentCut;
        default:
          return true;
      }
    });
    arr.sort((a, b) => (sort === "newest" ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)));
    return arr;
  }, [enriched, filter, q, recentDays, sort]);

  function add() {
    if (!f.title || !f.image) {
      alert("Please add a title and image.");
      return;
    }
    const newP = { ...f, id: f.id || `P_${Date.now()}`, createdAt: nowISO(), updatedAt: nowISO(), deletedAt: null };
    setProducts((prev) => [newP, ...prev]);
    setF({ ...f, id: "", title: "", image: "" });
  }
  function archiveToggle(id) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active, deletedAt: p.active ? nowISO() : null, updatedAt: nowISO() } : p)));
  }
  function hardDelete(id) {
    if (!confirm("Delete this product permanently?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }
  const [editing, setEditing] = useState(null);

  function importRows(rows, sourceLabel = "CSV/Sheet") {
    const normalized = rows.map(normalizeProductRow);
    setProducts((prev) => {
      if (replaceMode) return normalized;
      const map = new Map(prev.map((p) => [p.id, p]));
      normalized.forEach((n) => {
        const existing = map.get(n.id);
        map.set(n.id, { ...(existing || {}), ...n, createdAt: existing?.createdAt || n.createdAt, updatedAt: nowISO() });
      });
      return Array.from(map.values());
    });
    alert(`Imported ${normalized.length} products from ${sourceLabel}${replaceMode ? " (replaced all)" : " (merged by id)"}.`);
  }
  function importJSON() {
    try {
      const arr = JSON.parse(bulk);
      if (!Array.isArray(arr)) throw new Error("Expected a JSON array");
      importRows(arr, "JSON");
      setBulk("");
    } catch (e) {
      alert("Invalid JSON: " + e.message);
    }
  }
  async function importFromSheet() {
    if (!sheetUrl) return;
    setBusy(true);
    try {
      const csvUrl = sheetUrlToCsv(sheetUrl);
      const res = await fetch(csvUrl, { headers: { Accept: "text/csv" } });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const text = await res.text();
      const rows = parseCSVText(text);
      importRows(rows, "Google Sheet");
    } catch (e) {
      alert(
        "Sheet import error: " +
        e.message +
        "\n\nTips:\n• Make the sheet public or use File → Share → Publish to the web (CSV)\n• Paste either the edit URL (…/edit#gid=) or the published CSV URL"
      );
    } finally {
      setBusy(false);
    }
  }
  function onCsvFilePicked(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCSVText(String(reader.result ?? ""));
        importRows(rows, "CSV file");
      } catch (err) {
        alert("CSV error: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="p-3">
        <div className="mb-2 text-sm font-medium">Add Product</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Category" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} placeholder="Image URL" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={f.shareLink} onChange={(e) => setF({ ...f, shareLink: e.target.value })} placeholder="Affiliate Share Link" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={f.contentDocUrl} onChange={(e) => setF({ ...f, contentDocUrl: e.target.value })} placeholder="Content Doc URL" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={f.productUrl} onChange={(e) => setF({ ...f, productUrl: e.target.value })} placeholder="View Product URL" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={toDTLocal(f.availabilityStart)} onChange={(e) => setF({ ...f, availabilityStart: fromDTLocal(e.target.value) })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
            <input type="datetime-local" value={toDTLocal(f.availabilityEnd)} onChange={(e) => setF({ ...f, availabilityEnd: fromDTLocal(e.target.value) })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          </div>
          <input value={f.commission} onChange={(e) => setF({ ...f, commission: e.target.value })} placeholder="Commission (e.g., 25% per sale)" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
        </div>
        <div className="mt-2 flex justify-end">
          <button onClick={add} className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm">Add</button>
        </div>
      </Card>

      {/* Bulk Import */}
      <Card className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Bulk Import Products</div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={replaceMode} onChange={(e) => setReplaceMode(e.target.checked)} />
            <span>Replace all (instead of merge by id)</span>
          </label>
        </div>
        <div className="mb-4">
          <div className="text-xs font-medium mb-1">Paste JSON Array</div>
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder='[{"id":"P001","category":"Serums & Essences","title":"...","image":"...","shareLink":"...","contentDocUrl":"...","productUrl":"...","availabilityStart":"2025-08-09","availabilityEnd":"2025-08-23","commission":"25% per sale","active":true}]'
            className="min-h-[120px] w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm"
          />
          <div className="mt-2 flex justify-end">
            <button onClick={importJSON} className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm">Import JSON</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <div className="text-xs font-medium mb-2">Upload CSV (.csv)</div>
            <input type="file" accept=".csv,text/csv" className="block w-full text-sm" onChange={(e) => onCsvFilePicked(e.target.files?.[0])} />
            <div className="text-[11px] text-white/60 mt-2">Headers must match the template below. Existing IDs update; new IDs are added.</div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/5 p-3">
            <div className="text-xs font-medium mb-2">Import from Google Sheet (public CSV)</div>
            <input value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="Paste Google Sheet URL (edit link or published CSV)" className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm" />
            <div className="mt-2 flex justify-end">
              <button onClick={importFromSheet} disabled={busy || !sheetUrl} className={cx("rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm", (busy || !sheetUrl) && "opacity-60")}>{busy ? "Importing…" : "Fetch & Import"}</button>
            </div>
            <div className="text-[11px] text-white/60 mt-2">
              Make the sheet public or “Publish to the web → CSV”. Edit URLs like
              <span className="font-mono"> …/spreadsheets/d/&lt;ID&gt;/edit#gid=&lt;GID&gt;</span> also work.
            </div>
          </div>
        </div>
        <div className="mt-4 text-[11px] text-white/70">
          <div className="font-semibold">CSV/Sheet template (headers):</div>
          <div className="font-mono break-all">id,category,title,image,shareLink,contentDocUrl,productUrl,availabilityStart,availabilityEnd,commission,active</div>
          <div className="mt-1">Dates: <span className="font-mono">YYYY-MM-DD</span> recommended (any valid date parses). <br />Active accepts true/false, 1/0, yes/no.</div>
        </div>
      </Card>

      {/* Filter & Sort */}
      <Card className="p-3">
        <div className="mb-2 text-sm font-medium">Filter & Sort</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-white/20 bg-white text-black px-3 py-2 text-sm">
              {["All", "Active", "Hidden", "Expired", "Recently Added"].map((s) => (
                <option key={s} value={s} className="text-black bg-white">{s}</option>
              ))}
            </select>
            {filter === "Recently Added" && (
              <input type="number" min={1} value={recentDays} onChange={(e) => setRecentDays(Math.max(1, Number(e.target.value) || 7))} className="w-28 rounded-lg border border-white/20 bg-white text-black px-3 py-2 text-sm" placeholder="Days" title="Number of days considered recent" />
            )}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title/category…" className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-white/20 bg-white text-black px-3 py-2 text-sm">
            <option value="newest" className="text-black bg-white">Newest first</option>
            <option value="oldest" className="text-black bg-white">Oldest first</option>
          </select>
        </div>
      </Card>

      {/* All Products */}
      <Card className="p-3">
        <div className="mb-2 text-sm font-medium">All Products</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
              <img src={p.image} alt={p.title} className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" title={p.title}>{p.title}</div>
                <div className="text-xs text-white/70">{p.category}</div>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-white/70">
                  <Chip>{fmtDate(p.availabilityStart)} → {fmtDate(p.availabilityEnd)}</Chip>
                  {p.expired && <Chip tone="warn">Expired</Chip>}
                  {(!p.active || p.deletedAt) && <Chip tone="muted">Hidden</Chip>}
                  <Chip tone="info">{new Date(p.createdAt).toLocaleDateString()}</Chip>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button onClick={() => setEditing(p)} className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs">Edit</button>
                <button onClick={() => archiveToggle(p.id)} className={cx("rounded-lg border px-2 py-1 text-xs", p.active && !p.deletedAt ? "bg-emerald-400/20 border-emerald-400/30" : "bg-white/10 border-white/20")}>{p.active && !p.deletedAt ? "Archive" : "Restore"}</button>
                <button onClick={() => hardDelete(p.id)} className="rounded-lg border border-rose-400/40 bg-rose-400/15 px-2 py-1 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-white/70">No products match your filters.</div>}
        </div>
      </Card>

      {editing && (
        <EditProductSheet
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated, updatedAt: nowISO() } : p)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EditProductSheet({ product, onClose, onSave }) {
  const [p, setP] = useState({ ...product });
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-2">
      <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Edit Product</div>
          <button onClick={onClose} className="text-sm underline">Close</button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={p.image} onChange={(e) => setP({ ...p, image: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={p.shareLink} onChange={(e) => setP({ ...p, shareLink: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={p.contentDocUrl} onChange={(e) => setP({ ...p, contentDocUrl: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <input value={p.productUrl} onChange={(e) => setP({ ...p, productUrl: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={toDTLocal(p.availabilityStart)} onChange={(e) => setP({ ...p, availabilityStart: fromDTLocal(e.target.value) })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
            <input type="datetime-local" value={toDTLocal(p.availabilityEnd)} onChange={(e) => setP({ ...p, availabilityEnd: fromDTLocal(e.target.value) })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
          </div>
          <input value={p.commission} onChange={(e) => setP({ ...p, commission: e.target.value })} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm" />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm">Cancel</button>
          <button onClick={() => onSave(p)} className="rounded-lg border border-white/20 bg-white/20 px-4 py-2 text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
