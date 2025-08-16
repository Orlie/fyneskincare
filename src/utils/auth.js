// src/utils/auth.js — localStorage demo store (backwards-compatible)

export const ADMIN_USERNAME = "admin@fyne.app";
const ADMIN_PASSWORD = "admin123";

const LSK_USERS = "fyne_users_v1";
const LSK_SESSION = "fyne_session_v1";
const LSK_PRODUCTS = "fyne_products_v1"; // separate from App.jsx's fyne_m_products_v1
const LSK_TASKS = "fyne_tasks_v1"; // separate from App.jsx's fyne_m_requests_v1

function nowISO() { return new Date().toISOString(); }
function rid(prefix = "id") { return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`; }

function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
}

/*************************
 * ONE-TIME SEEDING
 *************************/
export function ensureInit() {
    // Users
    if (!localStorage.getItem(LSK_USERS)) {
        const admin = {
            id: "admin",
            email: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            displayName: "Admin",
            role: "admin",
            status: "approved",
            createdAt: nowISO(),
            tiktok: "",
            discord: "",
            photo: "",
        };
        localStorage.setItem(LSK_USERS, JSON.stringify([admin]));
    }
    // Products (utility store only; App.jsx keeps its own store/seed)
    if (!localStorage.getItem(LSK_PRODUCTS)) {
        const demo = [
            {
                id: "P001",
                title: "FYNE Micro-Infusion Serum",
                category: "Serums & Essences",
                image: "https://images.unsplash.com/photo-1608248597279-d088f8ab3a9e?q=80&w=1200&auto=format&fit=crop",
                createdAt: nowISO(),
            },
            {
                id: "P002",
                title: "FYNE Hydrating Toner",
                category: "Toners",
                image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop",
                createdAt: nowISO(),
            },
            {
                id: "P003",
                title: "FYNE Daily Sunscreen SPF 50",
                category: "Sun Care",
                image: "https://images.unsplash.com/photo-1603539242742-3c2977b89917?q=80&w=1200&auto=format&fit=crop",
                createdAt: nowISO(),
            },
        ];
        localStorage.setItem(LSK_PRODUCTS, JSON.stringify(demo));
    }
    // Tasks
    if (!localStorage.getItem(LSK_TASKS)) {
        localStorage.setItem(LSK_TASKS, JSON.stringify([]));
    }
}

/*************************
 * SESSION HELPERS
 *************************/
export function getSession() { return safeParse(localStorage.getItem(LSK_SESSION), null); }
export function setSession(s) { localStorage.setItem(LSK_SESSION, JSON.stringify(s)); }
export function logout() { localStorage.removeItem(LSK_SESSION); }

export function isAdmin(s) {
    const sess = s ?? getSession();
    return !!sess && sess.role === "admin";
}
export function isAffiliate(s) {
    const sess = s ?? getSession();
    return !!sess && sess.role === "affiliate";
}
export function currentUser(s) {
    const sess = s ?? getSession();
    if (!sess) return null;
    return getUserById(sess.id);
}

/*************************
 * USERS
 *************************/
function getUsers() { return safeParse(localStorage.getItem(LSK_USERS), []); }
function setUsers(arr) { localStorage.setItem(LSK_USERS, JSON.stringify(arr)); }
function getUserById(id) { return getUsers().find((u) => u.id === id) || null; }
function getUserByEmail(email) {
    const e = (email || "").toLowerCase();
    return getUsers().find((u) => (u.email || "").toLowerCase() === e) || null;
}

export function registerAffiliate({ email, password, displayName, tiktok = "", discord = "", photo = "" }) {
    const exists = getUserByEmail(email);
    if (exists) return false;
    const u = {
        id: rid("usr"),
        role: "affiliate",
        status: "approved", // flip to 'pending' for manual review if desired
        email,
        password,
        displayName: displayName || "",
        createdAt: nowISO(),
        tiktok,
        discord,
        photo,
    };
    const all = getUsers();
    all.push(u);
    setUsers(all);
    return true;
}

// Accepts either (email, password) or ({ email, password })
export function loginAffiliate(a, b) {
    const email = typeof a === "object" ? a?.email : a;
    const password = typeof a === "object" ? a?.password : b;
    const u = getUserByEmail(email);
    if (!u || u.password !== password) return null;
    if (u.status !== "approved") return null;
    const s = { role: "affiliate", id: u.id, email: u.email };
    setSession(s);
    return s;
}

// Accepts either (username, password) or ({ username, password })
export function loginAdmin(a, b) {
    const username = typeof a === "object" ? a?.username : a;
    const password = typeof a === "object" ? a?.password : b;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const s = { role: "admin", id: "admin", email: ADMIN_USERNAME };
        setSession(s);
        return s;
    }
    return null;
}

export function listUsers() { return getUsers().filter((u) => u.role !== "admin"); }
export function updateUser(id, patch) {
    const all = getUsers();
    const i = all.findIndex((u) => u.id === id);
    if (i >= 0) {
        all[i] = { ...all[i], ...patch };
        setUsers(all);
        return true;
    }
    return false;
}
export function approveUser(id) { return updateUser(id, { status: "approved" }); }
export function rejectUser(id) { return updateUser(id, { status: "rejected" }); }

export function profileFromUser(u) {
    if (!u) return { displayName: "", email: "", tiktok: "", discord: "", photo: "" };
    return {
        displayName: u.displayName || "",
        email: u.email || "",
        tiktok: u.tiktok || "",
        discord: u.discord || "",
        photo: u.photo || "",
    };
}

/*************************
 * PRODUCTS (utility-only)
 *************************/
export function listProducts() { return safeParse(localStorage.getItem(LSK_PRODUCTS), []); }

/*************************
 * TASKS (utility-only)
 *************************/
function getTasks() { return safeParse(localStorage.getItem(LSK_TASKS), []); }
function setTasks(arr) { localStorage.setItem(LSK_TASKS, JSON.stringify(arr)); }

export function createTask({ userId, productId }) {
    const prod = listProducts().find((p) => p.id === productId);
    const user = getUserById(userId);
    if (!prod || !user) return null;
    const t = {
        id: rid("tsk"),
        userId,
        userEmail: user.email,
        productId,
        productTitle: prod.title,
        productImage: prod.image,
        status: "Pending",
        videoLink: "",
        adCode: "",
        createdAt: nowISO(),
        updatedAt: nowISO(),
    };
    const all = getTasks();
    all.push(t);
    setTasks(all);
    return t;
}

export function listTasksByUser(userId) { return getTasks().filter((t) => t.userId === userId); }
export function listAllTasks() { return getTasks(); }
export function updateTask(id, patch) {
    const all = getTasks();
    const i = all.findIndex((t) => t.id === id);
    if (i >= 0) {
        all[i] = { ...all[i], ...patch, updatedAt: nowISO() };
        setTasks(all);
        return true;
    }
    return false;
}
