import React, { useEffect, useMemo, useState, useRef } from "react";
import Papa from "papaparse";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc, query, where, getDoc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import Auth from "./components/Auth";
import ProductList from "./components/ProductList";
import AdminProductManager from "./components/AdminProductManager";

/*************************
 * PLACEHOLDER DEPENDENCIES
 *************************/

// Placeholder for "./components/ProfilePhotoPicker.jsx"
const ProfilePhotoPicker = ({ value, onChange }) => {
  const fileInputRef = useRef(null);
  const handlePick = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (readEvent) => {
      onChange(readEvent.target?.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
        onClick={handlePick}
      >
        {value ? (
          <img src={value} alt="Profile" className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-xs text-white/50 text-center">Tap to add photo</span>
        )}
      </div>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />
    </div>
  );
};


/*************************
 * ICONS (Heroicons) - Adjusted for Apple style
 *************************/
const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.418-5.58a1.012 1.012 0 011.275-.247l.885.442A1.012 1.012 0 008.973 7.03l.002.002a1.012 1.012 0 01.247 1.275l-5.58 4.418a1.012 1.012 0 01-.639 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 006.75-6.75a6.75 6.75 0 00-6.75-6.75a6.75 6.75 0 00-6.75 6.75a6.75 6.75 0 006.75 6.75z" />
  </svg>
);

const EyeSlashIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const XCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserGroupIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM3.75 18.75a3 3 0 013-3h1.5a3 3 0 013 3v2.25a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-2.25z" />
  </svg>
);

const BuildingStorefrontIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349a.75.75 0 01.121-.427l2.083-3.646a.75.75 0 00-.65-1.125H6.528a.75.75 0 00-.65 1.125l2.083 3.646a.75.75 0 01.121.427V21m0 0h3.64" />
  </svg>
);

const ClipboardDocumentListIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM4.5 9.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
  </svg>
);

const UserCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChartBarIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const ArrowPathIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.992l-3.182-3.182a8.25 8.25 0 00-11.664 0l-3.182 3.182" />
  </svg>
);

const DocumentArrowDownIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);


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

const toDTLocal = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};
const fromDTLocal = (s) => {
  if (!s) return nowISO();
  try {
    const d = new Date(s);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toISOString();
  } catch {
    return nowISO();
  }
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
    console.warn("PapaParse errors encountered:", errors);
    const f = errors[0];
    throw new Error(`CSV parse error at row ${f.row ?? "?"}: ${f.message}`);
  }

  console.log(`Parsed ${data.length} rows from CSV.`);
  if (data.length > 0) {
    console.log("First 5 parsed rows:", data.slice(0, 5));
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


const DEMO_LINK = "https://affiliate-us.tiktok.com/api/v1/share/AJ45Xdql7Qyv";



/*************************
 * UI PRIMITIVES & HOOKS
 *************************/
function useToast() {
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef();

  const showToast = (message, type = 'info', duration = 3000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  const showUndoToast = (message, onUndo, duration = 5000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type: 'undo', onUndo });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  const hideToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  }

  return { toast, showToast, showUndoToast, hideToast };
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const { message, type, onUndo } = toast;

  const styles = {
    info: "bg-blue-600/80 border-blue-500",
    success: "bg-green-600/80 border-green-500",
    error: "bg-red-600/80 border-red-500",
    undo: "bg-purple-600/80 border-purple-500",
  };
  const Icon = {
    info: () => <ExclamationCircleIcon className="w-6 h-6 text-blue-100" />,
    success: () => <CheckCircleIcon className="w-6 h-6 text-green-100" />,
    error: () => <XCircleIcon className="w-6 h-6 text-red-100" />,
    undo: () => <ArrowPathIcon className="w-5 h-5 text-purple-100" />,
  }[type];

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6">
      <div className={cx("flex items-center gap-3 max-w-md w-full rounded-xl border px-4 py-3 text-sm shadow-lg text-white", styles[type], "backdrop-blur-md bg-opacity-70")}>
        <Icon />
        <span className="flex-1">{message}</span>
        {type === 'undo' && (
          <button onClick={() => { onUndo(); onDismiss(); }} className="font-semibold text-white/90 hover:text-white px-2 py-1 rounded-md transition-colors">Undo</button>
        )}
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <XCircleIcon className="w-5 h-5 opacity-80 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}

function Card({ className, children, onClick, title }) {
  return (
    <div
      onClick={onClick}
      title={title}
      className={cx(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/10 hover:border-white/20",
        className
      )}
    >
      {children}
    </div>
  );
}

function Input({ id, label, type = "text", value, onChange, placeholder, error, hint, required, disabled = false }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = type === "password" && isPasswordVisible ? "text" : type;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-white/80 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cx(
            "w-full rounded-lg border bg-white/5 px-4 py-2.5 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200",
            error ? "border-red-400" : "border-white/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white"
          >
            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function QR({ url, size = 144, onClick }) {
  if (!url) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={cx(
        "rounded-lg border border-white/20 bg-white/10 p-2",
        onClick && "cursor-pointer hover:bg-white/20 transition-colors"
      )}
    />
  );
}

function Badge({ children, tone }) {
  const m = {
    success: "border-green-400/30 bg-green-400/15 text-green-100",
    info: "border-blue-400/30 bg-blue-400/15 text-blue-100",
    default: "border-white/20 bg-white/10 text-white/80",
  };
  return (
    <span className={cx("rounded-full border px-2.5 py-0.5 text-xs font-medium", m[tone] || m.default)}>
      {children}
    </span>
  );
}

function SkeletonLoader({ className }) {
  return <div className={cx("bg-white/10 animate-pulse rounded-lg", className)} />;
}

function EmptyState({ icon, title, message, actionText, onAction }) {
  return (
    <Card className="p-8 text-center flex flex-col items-center">
      <div className="w-16 h-16 text-white/30 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/60 mb-6 max-w-xs">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold transition-colors"
        >
          {actionText}
        </button>
      )}
    </Card>
  );
}

/*************************
 * ROOT APP
 *************************/
export default function App() {
  const [tab, setTab] = useState("browse");
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [passwordResets, setPasswordResets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, showUndoToast, hideToast } = useToast();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          setUserRole("affiliate");
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const productsCollectionRef = collection(db, "products");
      const productsData = await getDocs(productsCollectionRef);
      setProducts(productsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

      const requestsCollectionRef = collection(db, "requests");
      const requestsData = await getDocs(requestsCollectionRef);
      setRequests(requestsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

      const passwordResetsCollectionRef = collection(db, "passwordResets");
      const passwordResetsData = await getDocs(passwordResetsCollectionRef);
      setPasswordResets(passwordResetsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    if (!loading) {
      fetchInitialData();
    }
  }, [loading]);

  const counts = useMemo(() => {
    const by = Object.fromEntries(STATUS.map((s) => [s, 0]));
    requests.forEach((r) => (by[r.status] = (by[r.status] || 0) + 1));
    return by;
  }, [requests]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("You have been logged out.", "info");
    } catch (error) {
      console.error("Error logging out:", error.message);
      showToast("Error logging out.", "error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1C1C1E] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-[#1C1C1E]/70 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 border border-white/20 flex items-center justify-center text-sm font-semibold shadow-md">
              FS
            </div>
            <div>
              <div className="text-base font-semibold">Fyne Skincare Creator Hub</div>
              <div className="text-xs text-white/60">Glassy • Mobile-first</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setTab("browse")}
              className={cx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === "browse" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
              )}
            >
              Affiliate
            </button>
            {userRole === "admin" && (
              <button
                onClick={() => setTab("admin")}
                className={cx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  tab === "admin" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
                )}
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-3 pb-28 pt-6 sm:px-4">
        {loading ? <SkeletonLoader className="w-full h-64" /> : (
          <>
            {user ? (
              userRole === "admin" ? (
                <AdminScreen
                  products={products}
                  setProducts={setProducts}
                  requests={requests}
                  setRequests={setRequests}
                  passwordResets={passwordResets}
                  setPasswordResets={setPasswordResets}
                  counts={counts}
                  onLogout={handleLogout}
                  showToast={showToast}
                  showUndoToast={showUndoToast}
                />
              ) : userRole === "affiliate" ? (
                <AffiliateScreen
                  products={products}
                  requests={requests}
                  setRequests={setRequests}
                  showToast={showToast}
                  setTab={setTab}
                />
              ) : (
                <div>Loading user data...</div>
              )
            ) : (
              <Auth />
            )}
          </>
        )}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1C1C1E]/70 backdrop-blur-lg border-t border-white/10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around p-2">
          <IconBtn active={tab === "browse"} label="Affiliate" icon={<UserGroupIcon />} onClick={() => setTab("browse")} />
          <IconBtn active={tab === "admin"} label="Admin" icon={<BuildingStorefrontIcon />} onClick={() => setTab("admin")} />
        </div>
      </nav>

      <Toast toast={toast} onDismiss={hideToast} />
    </div>
  );
}
function IconBtn({ active, label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs w-24 h-16 transition-colors",
        active ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/*************************
 * AFFILIATE ONBOARDING
 *************************/
function AffiliateOnboarding({ profile, setProfile, onFinish }) {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => s + 1);

  const finishOnboarding = async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { onboardingCompleted: true });
    }
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">Welcome to the Creator Hub!</h2>
            <p className="text-white/70">Let's get you set up in a few quick steps.</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={cx("w-2 h-2 rounded-full", s <= step ? 'bg-blue-400' : 'bg-white/20')} />
            ))}
          </div>
        </div>

        {step === 1 && <OnboardingStep1 profile={profile} setProfile={setProfile} onNext={nextStep} />}
        {step === 2 && <OnboardingStep2 onNext={nextStep} />}
        {step === 3 && <OnboardingStep3 onNext={finishOnboarding} />}

        <div className="mt-6 text-center">
          <button onClick={finishOnboarding} className="text-xs text-white/50 hover:text-white hover:underline">
            Done for now, take me to the app
          </button>
        </div>
      </Card>
    </div>
  );
}

function OnboardingStep1({ profile, setProfile, onNext }) {
  const [errors, setErrors] = useState({});

  const handleNext = async () => {
    const newErrors = {};
    if (!profile.tiktok) newErrors.tiktok = "TikTok username is required.";
    if (!profile.discord) newErrors.discord = "Discord username is required.";
    if (!profile.email) newErrors.email = "Email is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          tiktok: profile.tiktok,
          discord: profile.discord,
          email: profile.email,
        });
      }
      onNext();
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-1">Step 1: Complete Your Profile</h3>
      <p className="text-sm text-white/60 mb-4">This helps us track your tasks and commissions.</p>
      <div className="space-y-3">
        <Input id="onboard-tiktok" label="TikTok Username" value={profile.tiktok} onChange={e => setProfile({ ...profile, tiktok: e.target.value })} placeholder="@yourtiktok" error={errors.tiktok} required />
        <Input id="onboard-discord" label="Discord Username" value={profile.discord} onChange={e => setProfile({ ...profile, discord: e.target.value })} placeholder="your_discord#1234" error={errors.discord} required />
        <Input id="onboard-email" label="Email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="your@email.com" error={errors.email} required />
      </div>
      <button onClick={handleNext} className="mt-4 w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors">Next</button>
    </div>
  );
}

function OnboardingStep2({ onNext }) {
  return (
    <div>
      <h3 className="font-semibold mb-1">Step 2: How It Works</h3>
      <div className="text-sm text-white/70 space-y-3 mt-4">
        <p>1. <b className="text-white">Browse Products:</b> Find products you want to promote.</p>
        <p>2. <b className="text-white">Create a Task:</b> Add a product to your showcase to get your unique affiliate link.</p>
        <p>3. <b className="text-white">Submit Your Content:</b> Post your video on TikTok, then submit the video link and ad code here.</p>
        <p>4. <b className="text-white">Get Paid:</b> Once approved, you'll earn commissions!</p>
      </div>
      <button onClick={onNext} className="mt-4 w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors">Next</button>
    </div>
  );
}

function OnboardingStep3({ onNext }) {
  return (
    <div>
      <h3 className="font-semibold mb-1">Step 3: You're All Set!</h3>
      <p className="text-sm text-white/60 mt-4">
        You're ready to start browsing products and creating content. Good luck!
      </p>
      <button onClick={onNext} className="mt-4 w-full rounded-lg bg-green-500 hover:bg-green-600 px-4 py-2.5 text-sm font-semibold transition-colors">
        Let's Go!
      </button>
    </div>
  );
}


/*************************
 * AFFILIATE EXPERIENCE
 *************************/
  function AffiliateScreen({ products, requests, setRequests, showToast, setTab }) {
  const [affView, setAffView] = useState("products");
  const [profile, setProfile] = useState({ tiktok: "", discord: "", email: "", photo: "" });
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);

  useEffect(() => {
    const fetchProfileAndTasks = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile(userData);
          setOnboardingCompleted(userData.onboardingCompleted || false);
        } else {
          await setDoc(userDocRef, {
            email: auth.currentUser.email,
            uid: auth.currentUser.uid,
            role: "affiliate",
            onboardingCompleted: false,
          });
          setProfile({ email: auth.currentUser.email, uid: auth.currentUser.uid, role: "affiliate" });
          setOnboardingCompleted(false);
        }

        const tasksCollectionRef = collection(db, "requests");
        const q = query(tasksCollectionRef, where("affiliateUserId", "==", auth.currentUser.uid));
        const tasksData = await getDocs(q);
        setRequests(tasksData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      }
    };
    fetchProfileAndTasks();
  }, [auth.currentUser]);

  useEffect(() => {
    const saveProfile = async () => {
      if (auth.currentUser && profile.email) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, profile);
      }
    };
    saveProfile();
  }, [profile]);

  const handleCreateTask = async (product) => {
    if (!auth.currentUser) {
      showToast("Please log in to create a task.", "error");
      return;
    }
    const newTask = {
      productId: product.id,
      productTitle: product.title,
      shareLink: product.shareLink,
      status: "Pending",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      affiliateEmail: auth.currentUser.email,
      affiliateUserId: auth.currentUser.uid,
      videoLink: "",
      adCode: "",
    };
    try {
      const docRef = await addDoc(collection(db, "requests"), newTask);
      setRequests(prev => [...prev, { ...newTask, id: docRef.id }]);
      showToast(`Task created for ${product.title}!`, "success");
    } catch (error) {
      console.error("Error adding document: ", error);
      showToast("Failed to create task.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {onboardingCompleted ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAffView("products")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", affView === "products" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Products</button>
            <button onClick={() => setAffView("tasks")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", affView === "tasks" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>My Tasks</button>
            <button onClick={() => setAffView("stats")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", affView === "stats" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Stats</button>
            <button onClick={() => setAffView("profile")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", affView === "profile" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Profile</button>
          </div>

          {affView === "products" && <ProductList products={products} onCreateTask={handleCreateTask} requests={requests} />}
          {affView === "tasks" && <AffiliateTasksPage requests={requests} setRequests={setRequests} profile={profile} showToast={showToast} setAffView={setAffView} />}
          {affView === "stats" && <AffiliateStats requests={requests} profile={profile} />}
          {affView === "profile" && <AffiliateProfilePage profile={profile} setProfile={setProfile} showToast={showToast} onLogout={() => signOut(auth)} />}
        </div>
      ) : (
        <AffiliateOnboarding profile={profile} setProfile={setProfile} onFinish={() => setOnboardingCompleted(true)} />
      )}
    </div>
  );
}

function AffiliateProfilePage({ profile, setProfile, showToast, onLogout }) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const onPhotoChange = (dataUrl) => {
    setLocalProfile(prev => ({ ...prev, photo: dataUrl }));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!localProfile.tiktok) newErrors.tiktok = "TikTok username is required.";
    if (!localProfile.discord) newErrors.discord = "Discord username is required.";
    if (!localProfile.email) newErrors.email = "Email is required.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, localProfile);
        setProfile(localProfile); // Update parent state after successful save
        showToast("Profile updated successfully!", "success");
      }
    } else {
      showToast("Please fill out all required fields.", "error");
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="flex flex-col items-center">
          <ProfilePhotoPicker value={localProfile.photo || ""} onChange={onPhotoChange} />
          <p className="text-xs text-white/50 mt-2 text-center">Photo is saved locally.</p>
        </div>
        <div className="flex-1 w-full space-y-4">
          <Input id="profile-tiktok" label="TikTok Username" value={localProfile.tiktok} onChange={(e) => setLocalProfile({ ...localProfile, tiktok: e.target.value })} placeholder="@yourtiktok" error={errors.tiktok} required />
          <Input id="profile-discord" label="Discord Username" value={localProfile.discord} onChange={(e) => setLocalProfile({ ...localProfile, discord: e.target.value })} placeholder="your_discord#1234" error={errors.discord} required />
          <Input id="profile-email" label="Email" type="email" value={localProfile.email} onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })} placeholder="your@email.com" error={errors.email} required />
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">
        <button onClick={onLogout} className="rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold transition-colors">Logout</button>
        <button onClick={handleSave} className="rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-2.5 text-sm font-semibold transition-colors">Save Profile</button>
      </div>
    </Card>
  );
}

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
        <button onClick={onBack} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors">← Back to products</button>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <img src={product.image} alt={product.title} className="w-full rounded-lg border border-white/10" />
            <h2 className="text-2xl font-semibold">{product.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge>{product.category}</Badge>
              <Badge>{product.commission}</Badge>
              {inWindow ? <Badge tone="success">Available now</Badge> : <Badge tone="info">Out of window</Badge>}
            </div>
            <div className="text-sm text-white/80">
              Available: {fmtDate(product.availabilityStart)} → {fmtDate(product.availabilityEnd)}
            </div>
            <div className="flex items-center gap-4 text-sm pt-2">
              <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Product Page</a>
              <span className="text-white/30">•</span>
              <a href={product.contentDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Content Strategy Doc</a>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
              <h3 className="font-semibold mb-2">Add to Your Showcase</h3>
              <p className="text-sm text-white/70 mb-4">This will create a task and open your unique affiliate link in TikTok.</p>
              <button
                disabled={!inWindow || hasOpenTask || isComplete}
                onClick={handleAction}
                className={cx(
                  "w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                  (!inWindow || hasOpenTask || isComplete)
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {hasOpenTask ? "Task Already Open" : isComplete ? "Task Completed" : !inWindow ? "Not Available" : "Add to Showcase"}
              </button>

              <div className="flex flex-col items-center justify-center gap-2">
                <QR url={product.shareLink} onClick={handleAction} />
                <button onClick={handleAction} className="text-xs text-blue-400 hover:underline">
                  or tap here to Add to Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AffiliateTasksPage({ requests, setRequests, profile, showToast, setAffView }) {
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
    const taskDocRef = doc(db, "tasks", id);
    await updateDoc(taskDocRef, { ...taskData, status: "Video Submitted", updatedAt: nowISO() });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...taskData, status: "Video Submitted", updatedAt: nowISO() } : r));
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

function AffiliateStats({ requests, profile }) {
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
              <div title={`${s.date}: ${s.count} tasks`} className="w-full bg-blue-400/70 rounded-sm hover:bg-blue-300 transition-colors" style={{ height: `${(s.count / totals.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 text-[10px] text-white/60">
        {totals.series.map((s, i) => (i % 2 === 0 ? <div key={s.date} className="text-center">{s.date.slice(5)}</div> : <div key={s.date}></div>))}
      </div>
    </Card>
  );
}

/*************************
 * ADMIN
 *************************/
function AdminScreen({ products, setProducts, requests, setRequests, passwordResets, setPasswordResets, counts, onLogout, showToast, showUndoToast }) {
  const [view, setView] = useState("requests");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Active Products" value={products.filter((p) => p.active && !p.deletedAt).length} />
        <Stat label="Pending Tasks" value={counts["Pending"] || 0} />
        <Stat label="Tasks to Review" value={counts["Video Submitted"] || 0} />
        <Stat label="Completed Tasks" value={counts["Complete"] || 0} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setView("requests")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "requests" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Tasks</button>
        <button onClick={() => setView("products")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "products" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Products</button>
        <button onClick={() => setView("product_import")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "product_import" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Import Products</button>
        <button onClick={() => setView("users")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "users" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>Users</button>
        <button onClick={() => setView("password_resets")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors relative", view === "password_resets" ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10")}>
          Password Resets
          {passwordResets.filter(r => r.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              {passwordResets.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <div className="flex-1" />
        <button onClick={onLogout} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors">Logout</button>
      </div>

      {view === "requests" && <RequestsPanel requests={requests} setRequests={setRequests} showToast={showToast} showUndoToast={showUndoToast} />}
      {view === "products" && <ProductsPanel products={products} setProducts={setProducts} showToast={showToast} showUndoToast={showUndoToast} />}
      {view === "product_import" && <AdminProductManager setProducts={setProducts} showToast={showToast} />}
      {view === "users" && <UsersPanel showToast={showToast} />}
      {view === "password_resets" && <PasswordResetPanel resets={passwordResets} setResets={setPasswordResets} showToast={showToast} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-4 text-center">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
    </div>
  );
}

function UsersPanel({ showToast }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, where("role", "==", "affiliate"));
    const data = await getDocs(q);
    setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id, name) => {
    const userDocRef = doc(db, "users", id);
    await updateDoc(userDocRef, { status: "approved" });
    fetchUsers();
    showToast(`${name}'s account has been approved.`, 'success');
  };

  const handleReject = async (id, name) => {
    const userDocRef = doc(db, "users", id);
    await updateDoc(userDocRef, { status: "rejected" });
    fetchUsers();
    showToast(`${name}'s account has been rejected.`, 'info');
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Affiliate Users</h2>
      <div className="grid grid-cols-1 gap-3">
        {users.map((u) => (
          <div key={u.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{u.displayName || u.email}</div>
              <div className="text-xs text-white/70 truncate">{u.email} • {u.tiktok} • {u.discord}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={u.status === 'approved' ? 'success' : u.status === 'pending' ? 'info' : 'default'}>{u.status}</Badge>
              {u.status === 'pending' && (
                <>
                  <button onClick={() => handleApprove(u.id, u.displayName)} className="rounded-lg bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs font-semibold transition-colors">Approve</button>
                  <button onClick={() => handleReject(u.id, u.displayName)} className="rounded-lg bg-red-500 hover:bg-red-600 px-3 py-1.5 text-xs font-semibold transition-colors">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!users.length && <div className="text-white/70 text-center p-4">No affiliates have registered yet.</div>}
      </div>
    </Card>
  );
}

function PasswordResetPanel({ resets, setResets, showToast }) {

  const handleMarkCompleted = (resetId) => {
    setResets(prev => prev.map(r => r.id === resetId ? { ...r, status: 'completed' } : r));
    showToast(`Password reset request for ${resetId} marked as completed.`, "success");
  };

  const pendingResets = resets.filter(r => r.status === 'pending');

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Password Reset Requests</h2>
      {pendingResets.length === 0 ? (
        <p className="text-white/70">No pending password reset requests.</p>
      ) : (
        <div className="space-y-3">
          {pendingResets.map(reset => (
            <div key={reset.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{reset.email}</p>
                <p className="text-xs text-white/60">Requested on: {new Date(reset.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={() => handleMarkCompleted(reset.id)} className="rounded-lg bg-green-500 hover:bg-green-600 px-3 py-2.5 text-sm font-semibold transition-colors">
                  Mark Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}


function RequestsPanel({ requests, setRequests, showToast, showUndoToast }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const fetchRequests = async () => {
      const requestsCollectionRef = collection(db, "requests");
      const data = await getDocs(requestsCollectionRef);
      setRequests(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return requests
      .filter((r) => (statusFilter === "All" ? true : r.status === statusFilter))
      .filter((r) => term ?
        r.productTitle.toLowerCase().includes(term) ||
        r.affiliateTikTok?.toLowerCase().includes(term) ||
        r.affiliateEmail?.toLowerCase().includes(term)
        : true
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [requests, statusFilter, q]);

  const SearchHighlight = ({ text, highlight }) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-400/30 text-yellow-100">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const updateStatus = async (ids, newStatus) => {
    const originalRequests = [...requests];
    for (const id of ids) {
      const requestDocRef = doc(db, "requests", id);
      await updateDoc(requestDocRef, { status: newStatus, updatedAt: nowISO() });
    }
    showUndoToast(`${ids.size} task(s) updated to "${newStatus}".`, () => {
      setRequests(originalRequests);
      showToast("Update reverted.", "info");
    });
    setSelected(new Set());
    const requestsCollectionRef = collection(db, "requests");
    const data = await getDocs(requestsCollectionRef);
    setRequests(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const handleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(filtered.map(r => r.id)));
    } else {
      setSelected(new Set());
    }
  }

  function exportCSV() {
    const rows = filtered;
    if (!rows.length) {
      showToast("No tasks to export.", "info");
      return;
    }
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fyne_tasks_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV export started.", "success");
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {["All", ...STATUS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cx("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", statusFilter === s ? "bg-white/20 text-white" : "bg-white/5 text-white/70 hover:bg-white/10")}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="flex-grow rounded-lg bg-white/10 px-3 py-2 text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={exportCSV} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium transition-colors">Export</button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center gap-4">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <select
            onChange={e => updateStatus(selected, e.target.value)}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>Set status to...</option>
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-white/10 text-xs text-white/60 uppercase">
            <tr>
              <th className="p-3 w-8"><input type="checkbox" onChange={handleSelectAll} checked={selected.size === filtered.length && filtered.length > 0} className="rounded" /></th>
              <th className="p-3">Affiliate</th>
              <th className="p-3">Product</th>
              <th className="p-3">Submissions</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => handleSelect(r.id)} className="rounded" /></td>
                <td className="p-3">
                  <div className="font-medium"><SearchHighlight text={r.affiliateTikTok || ''} highlight={q} /></div>
                  <div className="text-xs text-white/60"><SearchHighlight text={r.affiliateEmail || ''} highlight={q} /></div>
                </td>
                <td className="p-3"><SearchHighlight text={r.productTitle} highlight={q} /></td>
                <td className="p-3">
                  {r.videoLink && <a className="underline truncate block max-w-xs" href={r.videoLink} target="_blank" rel="noreferrer">Video Link</a>}
                  {r.adCode && <div className="font-mono text-xs mt-1">Code: {r.adCode}</div>}
                </td>
                <td className="p-3">
                  <select value={r.status} onChange={(e) => updateStatus(new Set([r.id]), e.target.value)} className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center p-6 text-white/60">No tasks match your filters.</div>}
      </div>
    </Card>
  );
}

function BulkImportCard({ onImport, showToast }) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);

  async function importFromSheet() {
    if (!sheetUrl) return;
    setBusy(true);
    try {
      const csvUrl = sheetUrlToCsv(sheetUrl);
      const res = await fetch(csvUrl, { headers: { "Accept": "text/csv" } });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const text = await res.text();
      const rows = parseCSVText(text);
      onImport(rows, "Google Sheet", replaceMode);
      setSheetUrl("");
    } catch (e) {
      showToast(
        `Sheet import error: ${e.message}. Make sure the sheet is public or published to the web as a CSV.`,
        "error",
        5000
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
        onImport(rows, "CSV file", replaceMode);
      } catch (err) {
        showToast(`CSV error: ${err.message}`, "error");
      }
    };
    reader.readAsText(file);
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <h2 className="text-lg font-semibold">Bulk Upload Products</h2>
        <label className="flex items-center gap-2 text-xs mt-2 sm:mt-0 cursor-pointer text-white/70">
          <input type="checkbox" checked={replaceMode} onChange={(e) => setReplaceMode(e.target.checked)} className="rounded-md w-4 h-4 bg-white/20 border-white/30 checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500" />
          <span>Replace all products (instead of merge)</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-2">Option 1: Import from Google Sheet (Recommended)</h3>
          <p className="text-sm text-white/70 mb-3">Paste the URL of your public Google Sheet. The app will fetch and import the data.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="sheet-url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Paste Google Sheet URL here"
            />
            <button
              onClick={importFromSheet}
              disabled={busy || !sheetUrl}
              className={cx("rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap", (busy || !sheetUrl) && "opacity-50 cursor-not-allowed")}
            >
              {busy ? "Importing…" : "Fetch & Import"}
            </button>
          </div>
          <p className="text-xs text-white/60 mt-2">
            Tip: Use "File → Share → Publish to the web" and select CSV format for best results.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-2">Option 2: Upload a CSV File</h3>
          <input
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors"
            onChange={(e) => onCsvFilePicked(e.target.files?.[0])}
          />
        </div>
      </div>
    </Card>
  );
}

function ProductsPanel({ products, setProducts, showToast, showUndoToast }) {
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollectionRef = collection(db, "products");
      const data = await getDocs(productsCollectionRef);
      setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchProducts();
  }, []);

  async function importRows(rows, sourceLabel, replaceMode) {
    const normalized = rows.map(normalizeProductRow);
    if (replaceMode) {
      const productsCollectionRef = collection(db, "products");
      const existingDocs = await getDocs(productsCollectionRef);
      for (const doc of existingDocs.docs) {
        await deleteDoc(doc(db, "products", doc.id));
      }
      for (const row of normalized) {
        await setDoc(doc(db, "products", row.id), row);
      }
    } else {
      for (const row of normalized) {
        await setDoc(doc(db, "products", row.id), row, { merge: true });
      }
    }
    showToast(`Imported ${normalized.length} products from ${sourceLabel}${replaceMode ? " (replaced all)" : " (merged by id)"}.`, "success");
    const productsCollectionRef = collection(db, "products");
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  }

  const handleSave = async (updatedProduct) => {
    if (updatedProduct.id) {
      const productDocRef = doc(db, "products", updatedProduct.id);
      await updateDoc(productDocRef, { ...updatedProduct, updatedAt: nowISO() });
      showToast("Product updated successfully!", "success");
    } else {
      const newP = { ...updatedProduct, id: `P_${Date.now()}`, createdAt: nowISO(), updatedAt: nowISO(), deletedAt: null };
      await setDoc(doc(db, "products", newP.id), newP);
      showToast("Product added successfully!", "success");
    }
    const productsCollectionRef = collection(db, "products");
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    setEditing(null);
  };

  const handleArchiveToggle = async (id, active) => {
    const productDocRef = doc(db, "products", id);
    await updateDoc(productDocRef, { active: !active, deletedAt: active ? nowISO() : null, updatedAt: nowISO() });
    showToast(`Product ${active ? 'archived' : 'restored'}.`, 'info');
    const productsCollectionRef = collection(db, "products");
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  const downloadTemplate = () => {
    const headers = "id,category,title,image,shareLink,contentDocUrl,productUrl,availabilityStart,availabilityEnd,commission,active";
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fyne_products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Manage Products</h2>
            <p className="text-white/70 text-sm">Add, edit, and bulk import your products here.</p>
          </div>
          <div className="flex gap-2 items-start">
            <button onClick={() => setEditing({})} className="rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap">Add New Product</button>
          </div>
        </div>
      </Card>

      <BulkImportCard onImport={importRows} showToast={showToast} />

      <Card className="p-4">
        <h3 className="font-semibold mb-2">All Products</h3>
        <div className="grid grid-cols-1 gap-3">
          {products.map(p => (
            <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center gap-4">
              <img src={p.image} alt={p.title} className="w-12 h-12 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-xs text-white/60">{p.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.active ? 'success' : 'default'}>{p.active ? 'Active' : 'Archived'}</Badge>
                <button onClick={() => setEditing(p)} className="text-xs text-blue-400 hover:underline">Edit</button>
                <button onClick={() => handleArchiveToggle(p.id, p.active)} className="text-xs text-red-400 hover:underline">{p.active ? 'Archive' : 'Restore'}</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {editing && <EditProductSheet product={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  );
}

function EditProductSheet({ product, onClose, onSave }) {
  const [p, setP] = useState({ ...product });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(p);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">{product.id ? "Edit Product" : "Add New Product"}</h2>
            <button type="button" onClick={onClose} className="text-sm text-white/70 hover:text-white">Close</button>
          </div>
          <Input id="prod-title" label="Title" value={p.title || ''} onChange={(e) => setP({ ...p, title: e.target.value })} required />
          <Input id="prod-cat" label="Category" value={p.category || ''} onChange={(e) => setP({ ...p, category: e.target.value })} required />
          <Input id="prod-img" label="Image URL" value={p.image || ''} onChange={(e) => setP({ ...p, image: e.target.value })} required />
          <Input id="prod-share" label="Affiliate Share Link" value={p.shareLink || ''} onChange={(e) => setP({ ...p, shareLink: e.target.value })} />
          <Input id="prod-content" label="Content Doc URL" value={p.contentDocUrl || ''} onChange={(e) => setP({ ...p, contentDocUrl: e.target.value })} />
          <Input id="prod-url" label="Product Page URL" value={p.productUrl || ''} onChange={(e) => setP({ ...p, productUrl: e.target.value })} />
          <Input id="prod-comm" label="Commission" value={p.commission || ''} onChange={(e) => setP({ ...p, commission: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Availability Start</label>
              <input type="datetime-local" value={toDTLocal(p.availabilityStart)} onChange={(e) => setP({ ...p, availabilityStart: fromDTLocal(e.target.value) })} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Availability End</label>
              <input type="datetime-local" value={toDTLocal(p.availabilityEnd)} onChange={(e) => setP({ ...p, availabilityEnd: fromDTLocal(e.target.value) })} className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold transition-colors">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-500 hover:bg-blue-600 px-6 py-2.5 text-sm font-semibold transition-colors">Save Product</button>
          </div>
        </form>
      </Card>
    </div>
  );
}