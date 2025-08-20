// src/utils/auth.js — localStorage demo store (backwards-compatible)

export const ADMIN_USERNAME = "admin@fyne.app";
const ADMIN_PASSWORD = "admin123";


const LSK_SESSION = "fyne_session_v1";



function nowISO() { return new Date().toISOString(); }
function rid(prefix = "id") { return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`; }

function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
}

/*************************
 * ONE-TIME SEEDING
 *************************/
export function ensureInit() {
    
    
    
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
async function getUserById(id) {
    const userRef = doc(db, "users", id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { ...userSnap.data(), id: userSnap.id };
    }
    return null;
}
async function getUserByEmail(email) {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { ...userDoc.data(), id: userDoc.id };
    }
    return null;
}

export async function registerAffiliate({ email, password, displayName, tiktok = "", discord = "", photo = "" }) {
    const exists = await getUserByEmail(email);
    if (exists) return false;
    const u = {
        role: "affiliate",
        status: "pending",
        email,
        password,
        displayName: displayName || "",
        createdAt: serverTimestamp(),
        tiktok,
        discord,
        photo,
    };
    await addDoc(collection(db, "users"), u);
    return true;
}

export async function loginAffiliate(a, b) {
    const email = typeof a === "object" ? a?.email : a;
    const password = typeof a === "object" ? a?.password : b;
    const u = await getUserByEmail(email);
    if (!u || u.password !== password) return null;
    if (u.status !== "approved") return null;
    const s = { role: "affiliate", id: u.id, email: u.email };
    setSession(s);
    return s;
}

export async function listUsers() {
    const q = query(collection(db, "users"), where("role", "==", "affiliate"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), id: doc.id });
    });
    return users;
}
export async function updateUser(id, patch) {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, patch);
    return true;
}
export function approveUser(id) { return updateUser(id, { status: "approved" }); }
export function rejectUser(id) { return updateUser(id, { status: "rejected" }); }

export function updateUserProfile(id, profile) {
    return updateUser(id, profile);
}

export function updateUserOnboarding(id, onboarding) {
    return updateUser(id, { onboarding });
}

export async function updateUserPassword(email, newPassword) {
    const user = await getUserByEmail(email);
    if (user) {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { password: newPassword });
        return true;
    }
    return false;
}

export async function requestPasswordReset(email) {
    const user = await getUserByEmail(email);
    if (user) {
        const resetRequest = {
            email,
            createdAt: serverTimestamp(),
            status: "pending",
        };
        await addDoc(collection(db, "password_resets"), resetRequest);
        return true;
    }
    return false;
}

/*************************
 * PRODUCTS (utility-only)
 *************************/
export async function listProducts() {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = [];
    querySnapshot.forEach((doc) => {
        products.push({ ...doc.data(), id: doc.id });
    });
    return products;
}

export async function addProduct(product) {
    await addDoc(collection(db, "products"), product);
}

export async function updateProduct(id, patch) {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, patch);
}

/*************************
 * TASKS (utility-only)
 *************************/
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function createTask({ userId, productId }) {
    const prod = listProducts().find((p) => p.id === productId);
    const user = getUserById(userId);
    if (!prod || !user) return null;
    const t = {
        userId,
        userEmail: user.email,
        productId,
        productTitle: prod.title,
        productImage: prod.image,
        status: "Pending",
        videoLink: "",
        adCode: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "tasks"), t);
    return { ...t, id: docRef.id };
}

export async function listTasksByUser(userId) {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ ...doc.data(), id: doc.id });
    });
    return tasks;
}

export async function listAllTasks() {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    const tasks = [];
    querySnapshot.forEach((doc) => {
        tasks.push({ ...doc.data(), id: doc.id });
    });
    return tasks;
}

export async function updateTask(id, patch) {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { ...patch, updatedAt: serverTimestamp() });
    return true;
}
