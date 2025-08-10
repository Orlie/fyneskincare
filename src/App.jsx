import { useEffect, useMemo, useState, useRef } from "react";


// Firebase Imports - We now use a real database!
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";


/******************************************************************************
 * IMPORTANT: FIREBASE SETUP
 *
 * This configuration connects your app to your Firebase project.
 *
 * HOW TO USE:
 * 1. Go to https://console.firebase.google.com/ and create a new project.
 * 2. In your project, go to Project Settings (click the gear icon).
 * 3. Scroll down to "Your apps" and create a new "Web" app.
 * 4. Firebase will give you a `firebaseConfig` object. Copy the values.
 * 5. Go to your Netlify site > Site configuration > Environment variables.
 * 6. Add the following environment variables, pasting the values from your
 * Firebase config:
 *
 * VITE_FIREBASE_API_KEY=your_api_key
 * VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
 * VITE_FIREBASE_PROJECT_ID=your_project_id
 * VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
 * VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 * VITE_FIREBASE_APP_ID=your_app_id
 *
 ******************************************************************************/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/*************************
 * ICONS (No changes)
 *************************/
const EyeIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.418-5.58a1.012 1.012 0 011.275-.247l.885.442A1.012 1.012 0 008.973 7.03l.002.002a1.012 1.012 0 01.247 1.275l-5.58 4.418a1.012 1.012 0 01-.639 0z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 006.75-6.75a6.75 6.75 0 00-6.75-6.75a6.75 6.75 0 00-6.75 6.75a6.75 6.75 0 006.75 6.75z" /> </svg>);
const EyeSlashIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" /> </svg>);
const CheckCircleIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>);
const ExclamationCircleIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg>);
const XCircleIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>);
const UserGroupIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM3.75 18.75a3 3 0 013-3h1.5a3 3 0 013 3v2.25a3 3 0 01-3 3h-1.5a3 3 0 01-3-3v-2.25z" /> </svg>);
const BuildingStorefrontIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349a.75.75 0 01.121-.427l2.083-3.646a.75.75 0 00-.65-1.125H6.528a.75.75 0 00-.65 1.125l2.083 3.646a.75.75 0 01.121.427V21m0 0h3.64" /> </svg>);
const ClipboardDocumentListIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM4.5 9.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" /> </svg>);
const UserCircleIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /> </svg>);
const ChartBarIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /> </svg>);
const ArrowPathIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.992l-3.182-3.182a8.25 8.25 0 00-11.664 0l-3.182 3.182" /> </svg>);
const DocumentArrowDownIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> </svg>);

/*************************
 * SMALL HELPERS
 *************************/
const cx = (...c) => c.filter(Boolean).join(" ");
const fmtDate = (iso) => {
  if (!iso) return "—";
  const date = iso.toDate ? iso.toDate() : new Date(iso);
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(date);
  } catch {
    return "—";
  }
};
const toDTLocal = (iso) => {
  if (!iso) return "";
  const d = iso.toDate ? iso.toDate() : new Date(iso);
  try {
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};
const fromDTLocal = (s) => {
  if (!s) return new Date();
  try {
    const d = new Date(s);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  } catch {
    return new Date();
  }
};

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
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), duration);
  };

  const hideToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(null);
  }

  return { toast, showToast, hideToast };
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const { message, type } = toast;
  const styles = {
    info: "bg-sky-500/90 border-sky-400",
    success: "bg-emerald-500/90 border-emerald-400",
    error: "bg-rose-500/90 border-rose-400",
  };
  const Icon = {
    info: () => <ExclamationCircleIcon className="w-6 h-6 text-sky-100" />,
    success: () => <CheckCircleIcon className="w-6 h-6 text-emerald-100" />,
    error: () => <XCircleIcon className="w-6 h-6 text-rose-100" />,
  }[type];

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6">
      <div className={cx("flex items-center gap-4 max-w-md w-full rounded-xl border backdrop-blur-lg px-4 py-3 text-sm shadow-2xl text-white", styles[type])}>
        <Icon />
        <span className="flex-1">{message}</span>
        <button onClick={onDismiss}>
          <XCircleIcon className="w-5 h-5 opacity-70 hover:opacity-100" />
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
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg transition-all duration-300",
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
      <label htmlFor={id} className="block text-xs font-medium text-white/80 mb-1.5">
        {label} {required && <span className="text-rose-400">*</span>}
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
            "w-full rounded-xl border bg-white/5 px-4 py-3 text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200",
            error ? "border-rose-400/50" : "border-white/20",
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
      {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
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
        "rounded-xl border border-white/20 bg-white/10 p-2",
        onClick && "cursor-pointer hover:bg-white/20 transition-colors"
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
    <span className={cx("rounded-full border px-2 py-0.5 text-[11px] font-medium", m[tone] || m.default)}>
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setCurrentUser({ auth: user, profile: { id: userDoc.id, ...userDoc.data() } });
          } else {
            setCurrentUser({ auth: user, profile: null });
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const qProducts = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qRequests = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubProducts();
      unsubRequests();
      unsubUsers();
    };
  }, []);

  const counts = useMemo(() => {
    const by = Object.fromEntries(STATUS.map((s) => [s, 0]));
    requests.forEach((r) => (by[r.status] = (by[r.status] || 0) + 1));
    return by;
  }, [requests]);

  const handleLogout = async () => {
    await signOut(auth);
    showToast("You have been logged out.", "info");
  };

  const isAdmin = currentUser?.profile?.role === 'admin';
  const isAffiliate = currentUser?.profile?.role === 'affiliate';

  return (
    <div className="min-h-screen w-full text-white bg-slate-900 bg-[radial-gradient(60%_40%_at_10%_10%,rgba(99,102,241,.15),transparent),radial-gradient(60%_40%_at_90%_10%,rgba(236,72,153,.15),transparent),radial-gradient(80%_60%_at_50%_90%,rgba(34,197,94,.1),transparent)]">
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-slate-900/60 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-sky-500 border border-white/20 flex items-center justify-center text-sm font-bold shadow-lg">
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
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                tab === "browse" ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              Affiliate
            </button>
            <button
              onClick={() => setTab("admin")}
              className={cx(
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                tab === "admin" ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pb-28 pt-6 sm:px-4">
        {loading ? <SkeletonLoader className="w-full h-64" /> : (
          <>
            {tab === "browse" ? (
              isAffiliate ? (
                <AffiliateScreen
                  currentUser={currentUser}
                  products={products}
                  requests={requests}
                  showToast={showToast}
                />
              ) : (
                <AffiliateAuthPanel showToast={showToast} />
              )
            ) : isAdmin ? (
              <AdminScreen
                products={products}
                requests={requests}
                users={users}
                counts={counts}
                onLogout={handleLogout}
                showToast={showToast}
              />
            ) : (
              <AdminLogin showToast={showToast} />
            )}
          </>
        )}
      </main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/50 backdrop-blur-lg border-t border-white/10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
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
        "flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs w-24 h-16 transition-colors",
        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/*************************
 * AUTH UI
 *************************/
function AdminLogin({ showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        showToast("Admin login successful!", "success");
      } else {
        await signOut(auth);
        setErr("Access denied. Not an admin account.");
        showToast("Access denied. Not an admin account.", "error");
      }
    } catch (error) {
      setErr("Invalid email or password.");
      showToast("Login failed. Please check your credentials.", "error");
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Admin Login</h2>
        <Input
          id="admin-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@fyne.app"
        />
        <Input
          id="admin-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={err}
        />
        <button type="submit" className="w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold transition-colors">
          Sign in
        </button>
      </form>
    </Card>
  );
}

function AffiliateAuthPanel({ showToast }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tiktok, setTikTok] = useState("");
  const [discord, setDiscord] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState({});

  const validate = (fields) => {
    const newErrors = {};
    if (fields.includes('email') && !email) newErrors.email = "Email is required.";
    else if (fields.includes('email') && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";

    if (fields.includes('password') && !password) newErrors.password = "Password is required.";
    else if (fields.includes('password') && password.length < 6) newErrors.password = "Password must be at least 6 characters.";

    if (fields.includes('displayName') && !displayName) newErrors.displayName = "Display name is required.";
    if (fields.includes('tiktok') && !tiktok) newErrors.tiktok = "TikTok username is required.";
    if (fields.includes('discord') && !discord) newErrors.discord = "Discord username is required.";

    setErr(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const doLogin = async (e) => {
    e.preventDefault();
    if (!validate(['email', 'password'])) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Welcome back!", "success");
    } catch (error) {
      setErr({ form: "Invalid credentials or account not approved." });
    }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    if (!validate(['displayName', 'email', 'password', 'tiktok', 'discord'])) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userProfile = {
        displayName,
        email,
        tiktok,
        discord,
        role: 'affiliate',
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), userProfile);

      showToast("Registration successful! Your account is pending admin approval.", "success");
      await signOut(auth);
      setMode("login");
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErr({ form: "An account with this email already exists." });
      } else {
        setErr({ form: "An unexpected error occurred during registration." });
      }
    }
  };

  const doForgotPassword = async (e) => {
    e.preventDefault();
    if (!validate(['email'])) return;
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent! Check your inbox.", "success");
      setMode("login");
    } catch (error) {
      setErr({ form: "Could not send reset email. Please check the address." });
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
        <button onClick={() => { setMode("login"); setErr({}); }} className={cx("flex-1 rounded-lg border px-3 py-2 text-sm transition-colors", mode === "login" ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10")}>Login</button>
        <button onClick={() => { setMode("register"); setErr({}); }} className={cx("flex-1 rounded-lg border px-3 py-2 text-sm transition-colors", mode === "register" ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10")}>Register</button>
      </div>

      {err.form && <div className="bg-rose-500/20 text-rose-200 text-sm rounded-lg p-3 mb-4">{err.form}</div>}

      {mode === "login" && (
        <form onSubmit={doLogin} className="space-y-4">
          <Input id="login-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" error={err.email} required />
          <Input id="login-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={err.password} required />
          <button type="submit" className="w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold transition-colors">Sign in</button>
          <div className="text-center">
            <button type="button" onClick={() => setMode('forgot')} className="text-xs text-sky-300 hover:underline">Forgot Password?</button>
          </div>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={doRegister} className="space-y-4">
          <Input id="reg-name" label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your Name" error={err.displayName} required />
          <Input id="reg-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" error={err.email} required />
          <Input id="reg-tiktok" label="TikTok Username" value={tiktok} onChange={(e) => setTikTok(e.target.value)} placeholder="@yourtiktok" error={err.tiktok} required />
          <Input id="reg-discord" label="Discord Username" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="your_discord#1234" error={err.discord} required />
          <Input id="reg-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={err.password} hint="Minimum 6 characters." required />
          <button type="submit" className="w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold transition-colors">Create Account</button>
          <p className="text-xs text-white/60 text-center">After registration, an admin must approve your account.</p>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={doForgotPassword} className="space-y-4">
          <h3 className="font-semibold">Request Password Reset</h3>
          <p className="text-sm text-white/70">Enter your account email. We will send you a link to reset your password.</p>
          <Input id="forgot-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" error={err.email} required />
          <button type="submit" className="w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold transition-colors">Send Request</button>
        </form>
      )}
    </Card>
  );
}

/*************************
 * AFFILIATE EXPERIENCE
 *************************/
function AffiliateScreen({ currentUser, products, requests, showToast }) {
  const [affView, setAffView] = useState("products");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");
  const [sel, setSel] = useState(null);

  const myProfile = currentUser.profile;

  const cats = useMemo(
    () => ["All", ...Array.from(new Set(products.filter((p) => p.active && !p.deletedAt).map((p) => p.category)))],
    [products]
  );

  const myTasks = useMemo(() => {
    return requests.filter(r => r.affiliateUserId === myProfile.id);
  }, [requests, myProfile.id]);

  const myTaskByProduct = useMemo(() => {
    const map = {};
    myTasks.forEach((t) => {
      if (!map[t.productId] || t.createdAt > map[t.productId].createdAt) {
        map[t.productId] = t;
      }
    });
    return map;
  }, [myTasks]);

  const visibleProducts = useMemo(() => {
    const t = q.trim().toLowerCase();
    let arr = products
      .filter((p) => p.active && !p.deletedAt)
      .filter((p) => (cat === "All" ? true : p.category === cat))
      .filter((p) => (t ? p.title.toLowerCase().includes(t) || p.category.toLowerCase().includes(t) : true))
      .filter((p) => !myTaskByProduct[p.id] || myTaskByProduct[p.id]?.status === 'Complete');
    arr.sort((a, b) => (sort === "newest"
      ? (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      : (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)));
    return arr;
  }, [products, q, cat, myTaskByProduct, sort]);

  const handleCreateTask = async (product) => {
    if (myProfile.status !== 'approved') {
      showToast("Your account is not approved yet.", "error");
      return;
    }
    const exists = myTasks.find(t => t.productId === product.id && t.status !== "Complete");
    if (exists) {
      showToast("You already have an open task for this product.", "error");
      window.open(product.shareLink, "_blank", "noopener,noreferrer");
      return;
    }
    const entry = {
      productId: product.id,
      productTitle: product.title,
      shareLink: product.shareLink,
      status: "Pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      affiliateTikTok: myProfile.tiktok,
      affiliateDiscord: myProfile.discord,
      affiliateEmail: myProfile.email,
      affiliateUserId: myProfile.id,
      videoLink: "",
      adCode: "",
    };
    await addDoc(collection(db, "requests"), entry);
    showToast(`Task for "${product.title}" created!`, "success");
    window.open(product.shareLink, "_blank", "noopener,noreferrer");
    setSel(null);
  };

  if (myProfile.status !== 'approved') {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Account Pending</h2>
        <p className="text-white/70">Your affiliate account is currently <b className="text-white">{myProfile.status}</b>.</p>
        <p className="text-white/70 mt-2">Please wait for an admin to approve your registration. You will be able to access the hub once approved.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[61px] z-10 backdrop-blur-lg bg-slate-900/60 -mx-4 px-4 py-2 border-b border-white/10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ["products", "Products", <BuildingStorefrontIcon className="w-5 h-5" />],
              ["tasks", "My Tasks", <ClipboardDocumentListIcon className="w-5 h-5" />],
              ["stats", "Stats", <ChartBarIcon className="w-5 h-5" />],
            ].map(([k, label, icon]) => (
              <button
                key={k}
                onClick={() => setAffView(k)}
                className={cx(
                  "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                  affView === k ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {affView === "products" && (
        <>
          <Card className="p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </Card>

          {sel ? (
            <ProductDetailsPage
              product={sel}
              onBack={() => setSel(null)}
              onCreateTask={handleCreateTask}
              myTask={myTaskByProduct[sel.id]}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleProducts.map((p) => {
                const myTask = myTaskByProduct[p.id];
                return (
                  <Card key={p.id} className="overflow-hidden group" onClick={() => setSel(p)}>
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {myTask?.status === "Complete" && <Badge tone="success">Completed</Badge>}
                        {myTask && myTask.status !== "Complete" && <Badge tone="info">Task Open</Badge>}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <h3 className="font-semibold leading-tight truncate" title={p.title}>{p.title}</h3>
                      <p className="text-xs text-white/70">{p.category}</p>
                      <div className="mt-1 text-[11px] rounded-full border border-white/20 bg-white/10 px-2 py-0.5 self-start">{p.commission}</div>
                    </div>
                  </Card>
                );
              })}
              {!visibleProducts.length && (
                <div className="col-span-full">
                  <EmptyState
                    icon={<BuildingStorefrontIcon className="w-full h-full" />}
                    title="No Products Found"
                    message="There are no products matching your current filters. Try a different search or check back soon!"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {affView === "tasks" && <AffiliateTasksPage myTasks={myTasks} showToast={showToast} setAffView={setAffView} />}
      {affView === "stats" && <AffiliateStats myTasks={myTasks} />}
    </div>
  );
}

function ProductDetailsPage({ product, onBack, onCreateTask, myTask }) {
  const inWindow = useMemo(() => {
    const n = Date.now();
    const start = product.availabilityStart?.toDate ? product.availabilityStart.toDate().getTime() : 0;
    const end = product.availabilityEnd?.toDate ? product.availabilityEnd.toDate().getTime() : Infinity;
    return n >= start && n <= end;
  }, [product]);

  const isComplete = myTask?.status === "Complete";
  const hasOpenTask = myTask && !isComplete;

  const handleAction = () => {
    onCreateTask(product);
  }

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
            <div className="text-sm text-white/80">
              Available: {fmtDate(product.availabilityStart)} → {fmtDate(product.availabilityEnd)}
            </div>
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
              <button
                disabled={!inWindow || hasOpenTask || isComplete}
                onClick={handleAction}
                className={cx(
                  "w-full rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors mb-4",
                  (!inWindow || hasOpenTask || isComplete)
                    ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                    : "border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500"
                )}
              >
                {hasOpenTask ? "Task Already Open" : isComplete ? "Task Completed" : !inWindow ? "Not Available" : "Add to Showcase"}
              </button>

              <div className="flex flex-col items-center justify-center gap-2">
                <QR url={product.shareLink} onClick={handleAction} />
                <button onClick={handleAction} className="text-xs text-sky-300 hover:underline">
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

function AffiliateTasksPage({ myTasks, showToast, setAffView }) {
  const [localTasks, setLocalTasks] = useState({});

  useEffect(() => {
    const initial = {};
    myTasks.forEach(task => {
      initial[task.id] = { videoLink: task.videoLink || '', adCode: task.adCode || '' };
    });
    setLocalTasks(initial);
  }, [myTasks]);

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
    const taskRef = doc(db, "requests", id);
    await updateDoc(taskRef, {
      ...taskData,
      status: "Video Submitted",
      updatedAt: serverTimestamp(),
    });
    showToast("Task submitted for review!", "success");
  };

  return (
    <Card className="p-3">
      <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
      <div className="grid grid-cols-1 gap-4">
        {myTasks.map((r) => {
          const localData = localTasks[r.id] || { videoLink: '', adCode: '' };
          const isComplete = r.status === 'Complete';
          const isPendingInput = r.status === 'Pending';
          return (
            <div key={r.id} className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate" title={r.productTitle}>{r.productTitle}</div>
                  <div className="text-xs text-white/60">Requested: {fmtDate(r.createdAt)}</div>
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
                  className="w-full rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  Submit for Review
                </button>
              )}
              {isComplete && <p className="text-sm text-emerald-300 text-center font-medium">🎉 This task is complete. Great job!</p>}
              {!isPendingInput && !isComplete && <p className="text-sm text-sky-300 text-center font-medium">This task is currently under review by an admin.</p>}
            </div>
          )
        })}
        {!myTasks.length && (
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

function AffiliateStats({ myTasks }) {
  const totals = useMemo(() => {
    const completedTasks = myTasks.filter(t => t.status === 'Complete');
    return {
      requested: myTasks.length,
      completed: completedTasks.length,
    };
  }, [myTasks]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Stat label="Tasks Created" value={totals.requested} />
        <Stat label="Tasks Completed" value={totals.completed} />
      </div>
    </Card>
  );
}

/*************************
 * ADMIN
 *************************/
function AdminScreen({ products, requests, users, counts, onLogout, showToast }) {
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
        <button onClick={() => setView("requests")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "requests" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>Tasks</button>
        <button onClick={() => setView("products")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "products" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>Products</button>
        <button onClick={() => setView("users")} className={cx("rounded-lg border px-3 py-2 text-sm", view === "users" ? "bg-white/30 border-white/40" : "bg-white/10 border-white/20")}>Users</button>
        <div className="flex-1" />
        <button onClick={onLogout} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm">Logout</button>
      </div>

      {view === "requests" && <RequestsPanel requests={requests} showToast={showToast} />}
      {view === "products" && <ProductsPanel products={products} showToast={showToast} />}
      {view === "users" && <UsersPanel users={users} showToast={showToast} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 text-center">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
    </div>
  );
}

function UsersPanel({ users, showToast }) {
  const affiliates = useMemo(() => users.filter(u => u.role === 'affiliate'), [users]);

  const handleStatusChange = async (id, name, newStatus) => {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, { status: newStatus });
    showToast(`${name}'s account has been ${newStatus}.`, 'success');
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Affiliate Users</h2>
      <div className="grid grid-cols-1 gap-3">
        {affiliates.map((u) => (
          <div key={u.id} className="rounded-xl border border-white/15 bg-white/5 p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{u.displayName || u.email}</div>
              <div className="text-xs text-white/70 truncate">{u.email} • {u.tiktok} • {u.discord}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={u.status === 'approved' ? 'success' : u.status === 'pending' ? 'info' : 'default'}>{u.status}</Badge>
              {u.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusChange(u.id, u.displayName, 'approved')} className="rounded-lg border border-emerald-400/40 bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-400/25 transition-colors">Approve</button>
                  <button onClick={() => handleStatusChange(u.id, u.displayName, 'rejected')} className="rounded-lg border border-rose-400/40 bg-rose-400/15 px-3 py-1 text-xs text-rose-200 hover:bg-rose-400/25 transition-colors">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!affiliates.length && <div className="text-white/70 text-center p-4">No affiliates have registered yet.</div>}
      </div>
    </Card>
  );
}

function RequestsPanel({ requests, showToast }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(new Set());

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
  }, [requests, statusFilter, q]);

  const updateStatus = async (ids, newStatus) => {
    const batch = writeBatch(db);
    ids.forEach(id => {
      const ref = doc(db, "requests", id);
      batch.update(ref, { status: newStatus, updatedAt: serverTimestamp() });
    });
    await batch.commit();
    showToast(`${ids.size} task(s) updated to "${newStatus}".`, 'success');
    setSelected(new Set());
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

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {["All", ...STATUS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cx("rounded-full border px-3 py-1 text-xs font-medium transition-colors", statusFilter === s ? "bg-white/20 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10")}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="flex-grow rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <select
            onChange={e => updateStatus(selected, e.target.value)}
            className="rounded-lg border border-white/20 bg-slate-800 px-3 py-1.5 text-sm"
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
                  <div className="font-medium">{r.affiliateTikTok || ''}</div>
                  <div className="text-xs text-white/60">{r.affiliateEmail || ''}</div>
                </td>
                <td className="p-3">{r.productTitle}</td>
                <td className="p-3">
                  {r.videoLink && <a className="underline truncate block max-w-xs" href={r.videoLink} target="_blank" rel="noreferrer">Video Link</a>}
                  {r.adCode && <div className="font-mono text-xs mt-1">Code: {r.adCode}</div>}
                </td>
                <td className="p-3">
                  <select value={r.status} onChange={(e) => updateStatus(new Set([r.id]), e.target.value)} className="rounded-lg border border-white/20 bg-slate-800 px-2 py-1 text-xs">
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

function ProductsPanel({ products, showToast }) {
  const [editing, setEditing] = useState(null);

  const handleSave = async (updatedProduct) => {
    if (updatedProduct.id) { // Editing
      const { id, ...dataToSave } = updatedProduct;
      dataToSave.updatedAt = serverTimestamp();
      const productRef = doc(db, "products", id);
      await setDoc(productRef, dataToSave, { merge: true });
      showToast("Product updated successfully!", "success");
    } else { // Adding
      const newProduct = {
        ...updatedProduct,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
        active: true,
      };
      await addDoc(collection(db, "products"), newProduct);
      showToast("Product added successfully!", "success");
    }
    setEditing(null);
  };

  const handleArchiveToggle = async (id, active) => {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      active: !active,
      deletedAt: active ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    showToast(`Product ${active ? 'archived' : 'restored'}.`, 'info');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Manage Products</h2>
            <p className="text-white/70 text-sm">Add, edit, and archive your products here.</p>
          </div>
          <div className="flex gap-2 items-start">
            <button onClick={() => setEditing({})} className="rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap">Add New Product</button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">All Products</h3>
        <div className="grid grid-cols-1 gap-3">
          {products.map(p => (
            <div key={p.id} className="rounded-xl border border-white/15 bg-white/5 p-3 flex items-center gap-4">
              <img src={p.image} alt={p.title} className="w-12 h-12 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-xs text-white/60">{p.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.active ? 'success' : 'default'}>{p.active ? 'Active' : 'Archived'}</Badge>
                <button onClick={() => setEditing(p)} className="text-xs hover:underline text-sky-300">Edit</button>
                <button onClick={() => handleArchiveToggle(p.id, p.active)} className="text-xs hover:underline">{p.active ? 'Archive' : 'Restore'}</button>
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
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">{product.id ? "Edit Product" : "Add New Product"}</h2>
            <button type="button" onClick={onClose} className="text-sm hover:underline">Close</button>
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
              <label className="block text-xs font-medium text-white/80 mb-1.5">Availability Start</label>
              <input type="datetime-local" value={toDTLocal(p.availabilityStart)} onChange={(e) => setP({ ...p, availabilityStart: fromDTLocal(e.target.value) })} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Availability End</label>
              <input type="datetime-local" value={toDTLocal(p.availabilityEnd)} onChange={(e) => setP({ ...p, availabilityEnd: fromDTLocal(e.target.value) })} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg border border-indigo-400/50 bg-indigo-500/80 hover:bg-indigo-500 px-6 py-2 text-sm font-semibold transition-colors">Save Product</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
