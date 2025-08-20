// src/utils/auth.js
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, } from "firebase/auth";
import { collection, doc, getDocs, addDoc, updateDoc, serverTimestamp, query, where, limit } from "firebase/firestore";
// ---- session helpers
const SESSION_KEY = "app_session";
export function ensureInit() { return true; }
export function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch { return null; }
}
export function isAdmin(s) { return !!s && s.role === "admin"; }
export function isAffiliate(s) { return !!s && s.role === "affiliate"; }
// ---- auth flows
export async function loginAdmin(username, password) {
    await signInWithEmailAndPassword(auth, username, password);
    const session = { role: "admin", uid: auth.currentUser?.uid || null };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}
export async function loginAffiliate(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
    const session = { role: "affiliate", uid: auth.currentUser?.uid || null };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
}
export async function registerAffiliate({ email, password, displayName = "", tiktok = "", discord = "" }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, "users"), {
        uid: cred.user.uid, email, displayName, tiktok, discord, role: "affiliate", status: "pending", createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return true;
}
export async function logout() {
    await signOut(auth);
    localStorage.removeItem(SESSION_KEY);
    return true;
}

export async function requestPasswordReset(email) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with email:", email);
            return false; // User not found
        }

        // 2. Create a password reset request
        const resetRequest = {
            email: email,
            status: "pending",
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "password_resets"), resetRequest);
        return true;
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return false;
    }
}
// ---- profile + password
export function profileFromUser(u) {
    if (!u) return { email: "", name: "", tiktok: "", discord: "", photo: "" };
    const email = u.email || u.user?.email || "";
    const name = u.displayName || u.user?.displayName || u.name || "";
    const photo = u.photoURL || u.user?.photoURL || "";
    return { email, name, tiktok: u.tiktok || "", discord: u.discord || "", photo };
}
export async function updateUserPassword(email) {
    await sendPasswordResetEmail(auth, email);
    return true;
}
// ---- users
export async function currentUser(session) {
    const uid = session?.uid || auth.currentUser?.uid;
    if (!uid) return null;
    const q = query(collection(db, "users"), where("uid", "==", uid), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: uid, ...snap.docs[0].data(), email: snap.docs[0].data().email || "" };
    return { id: uid, email: auth.currentUser?.email || "" };
}
export async function listUsers(status) {
    const ref = collection(db, "users");
    const q = status ? query(ref, where("status", "==", status)) : ref;
    const s = await getDocs(q);
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function approveUser(userId) {
    await updateDoc(doc(db, "users", userId), { status: "approved", updatedAt: serverTimestamp() });
    return true;
}
export async function rejectUser(userId) {
    await updateDoc(doc(db, "users", userId), { status: "rejected", updatedAt: serverTimestamp() });
    return true;
}
// ---- products
export async function listProducts() {
    const s = await getDocs(collection(db, "products"));
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
}
// ---- tasks
export async function createTask(entry) {
    const payload = { ...entry, status: entry.status || "New", createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    const ref = await addDoc(collection(db, "tasks"), payload);
    return { id: ref.id, ...payload };
}
export async function listTasksByUser(userId) {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const s = await getDocs(q);
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function listAllTasks() {
    const s = await getDocs(collection(db, "tasks"));
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function updateTask(id, updates) {
    await updateDoc(doc(db, "tasks", id), { ...updates, updatedAt: serverTimestamp() });
    return true;
}

export async function updateUserOnboarding(userId, onboardingData) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        onboarding: onboardingData,
        updatedAt: serverTimestamp(),
    });
    return true;
}

export async function updateUserProfile(userId, profileData) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
    });
    return true;
}

export async function addProduct(productData) {
    const newProductRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return newProductRef.id;
}

export async function updateProduct(productId, productData) {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
        ...productData,
        updatedAt: serverTimestamp(),
    });
    return true;
}
