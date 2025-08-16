import React, { useEffect, useMemo, useState, useRef } from "react";
import Papa from "papaparse";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc, query, where, getDoc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import Auth from "./components/Auth";
import ProductList from "./components/ProductList";
import AdminProductManager from "./components/AdminProductManager";

import { useToast, Toast } from "./components/common/toast";
import { Input, Badge, SkeletonLoader, EmptyState, QR, Stat, SearchHighlight } from "./components/common";
import { UserGroupIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon } from "./components/common/icons";
import ProfilePhotoPicker from "./components/ProfilePhotoPicker";
import { cx, fmtDate } from "./components/common/utils";
import Card from "./components/Card";
import AffiliateMyTasks from './components/AffiliateMyTasks';
import AffiliateStats from './components/AffiliateStats';








const nowISO = () => new Date().toISOString();


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
    <div className="bg-app relative">
      {/* subtle noise overlay */}
      <div className="noise pointer-events-none fixed inset-0 opacity-[0.18]"></div>
      {/* Header (yours as-is) */}
      { /* ...your existing top header ... */ }
      {/* Main content */}
      <main className="mx-auto max-w-6xl px-3 pb-28 pt-6 sm:px-4">
        {loading ? (
          <SkeletonLoader className="w-full h-64" />
        ) : user ? (
          userRole === "admin" && tab === "admin" ? (
            <AdminScreen products={products} setProducts={setProducts} requests={requests} setRequests={setRequests} passwordResets={passwordResets} setPasswordResets={setPasswordResets} counts={counts} onLogout={handleLogout} showToast={showToast} showUndoToast={showUndoToast} />
          ) : (
            <AffiliateScreen products={products} requests={requests} setRequests={setRequests} showToast={showToast} setTab={setTab} />
          )
        ) : (
          <div className="min-h-[70vh] grid place-items-center">
            <Auth />
            {/* new sleek Auth below */}
          </div>
        )}
      </main>
      {/* Floating pill bottom nav (admin hidden if not admin) */}
      <nav className="sm:hidden pill-nav z-30">
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("browse")} className={`pill-item ${tab === "browse" ? "pill-active" : ""}`} >
            <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90"><path fill="currentColor" d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg> Affiliate
          </button>
          {userRole === "admin" && (
            <button onClick={() => setTab("admin")} className={`pill-item ${tab === "admin" ? "pill-active" : ""}`} >
              <svg width="20" height="20" viewBox="0 0 24 24" className="opacity-90"><path fill="currentColor" d="M3 7h18v2H3zm2 4h14v10H5z"/></svg> Admin
            </button>
          )}
        </div>
      </nav>
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
            Skip onboarding for now
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
          {affView === "tasks" && <AffiliateMyTasks requests={requests} setRequests={setRequests} profile={profile} showToast={showToast} setAffView={setAffView} />}
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
          <p className="text-xs text-white/50 mt-2 text-center">Your profile photo is stored in your browser.</p>
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
        <button onClick={() => setView("requests")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "requests" ? "bg-blue-500/30 text-blue-100" : "text-white/80 hover:bg-white/10")}>Tasks</button>
        <button onClick={() => setView("products")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "products" ? "bg-blue-500/30 text-blue-100" : "text-white/80 hover:bg-white/10")}>Products</button>
        <button onClick={() => setView("product_import")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "product_import" ? "bg-blue-500/30 text-blue-100" : "text-white/80 hover:bg-white/10")}>Import Products</button>
        <button onClick={() => setView("users")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "users" ? "bg-blue-500/30 text-blue-100" : "text-white/80 hover:bg-white/10")}>Users</button>
        <button onClick={() => setView("password_resets")} className={cx("rounded-lg px-4 py-2 text-sm font-medium transition-colors relative", view === "password_resets" ? "bg-blue-500/30 text-blue-100" : "text-white/80 hover:bg-white/10")}>
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
                  <button onClick={() => handleApprove(u.id, u.displayName)} className="rounded-lg bg-green-500/20 hover:bg-green-500/40 px-3 py-1.5 text-xs font-semibold transition-colors text-green-300">Approve</button>
                  <button onClick={() => handleReject(u.id, u.displayName)} className="rounded-lg bg-red-500/20 hover:bg-red-500/40 px-3 py-1.5 text-xs font-semibold transition-colors text-red-300">Reject</button>
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
                <button onClick={() => handleMarkCompleted(reset.id)} className="rounded-lg bg-green-500/20 hover:bg-green-500/40 px-3 py-2.5 text-sm font-semibold transition-colors text-green-300">
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
              className={cx("rounded-full px-3 py-1.5 text-xs font-medium transition-colors", statusFilter === s ? "bg-blue-500/30 text-blue-100" : "bg-white/10 text-white/80 hover:bg-white/20")}
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
          <label className="block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white text-center cursor-pointer hover:bg-white/20 transition-colors">
            Choose CSV File
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onCsvFilePicked(e.target.files?.[0])}
            />
          </label>
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
      const snap = await getDocs(productsCollectionRef);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
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
                <button onClick={() => setEditing(p)} className="rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-xs font-semibold transition-colors">Edit</button>
                <button onClick={() => handleArchiveToggle(p.id, p.active)} className="rounded-lg bg-red-500/20 hover:bg-red-500/40 px-2 py-1 text-xs font-semibold transition-colors text-red-300">{p.active ? 'Archive' : 'Restore'}</button>
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
              <Input
                id="prod-avail-start"
                label="Availability Start"
                type="datetime-local"
                value={toDTLocal(p.availabilityStart)}
                onChange={(e) => setP({ ...p, availabilityStart: fromDTLocal(e.target.value) })}
              />
            </div>
            <div>
              <Input
                id="prod-avail-end"
                label="Availability End"
                type="datetime-local"
                value={toDTLocal(p.availabilityEnd)}
                onChange={(e) => setP({ ...p, availabilityEnd: fromDTLocal(e.target.value) })}
              />
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