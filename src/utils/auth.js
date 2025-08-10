// src/utils/auth.js
import { auth, db } from "../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from "firebase/auth";
import {
    collection, doc, getDoc, getDocs, onSnapshot,
    query, orderBy, setDoc, updateDoc, serverTimestamp
} from "firebase/firestore";

export function currentUser() { return auth.currentUser || null; }
export async function getMyProfile() {
    const u = auth.currentUser; if (!u) return null;
    const snap = await getDoc(doc(db, "users", u.uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function isAdmin() { return (await getMyProfile())?.role === "admin"; }
export async function isAffiliate() { return (await getMyProfile())?.role === "affiliate"; }
export function onAuth(cb) { return onAuthStateChanged(auth, cb); }

export async function registerAffiliate({ email, password, displayName, tiktok, discord }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
        email, displayName: displayName || "", tiktok: tiktok || "", discord: discord || "",
        role: "affiliate", status: "pending",
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    return cred.user;
}
export async function loginAffiliate(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const p = await getMyProfile(); return { user, profile: p };
}
export async function loginAdmin(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const p = await getMyProfile(); if (p?.role !== "admin") throw new Error("This account is not an admin.");
    return { user, profile: p };
}
export function logout() { return signOut(auth); }

// ----- Password reset (free plan) -----
const actionCodeSettings = {
    url: (import.meta.env.VITE_APP_URL || window.location.origin) + "/auth/after-reset",
    handleCodeInApp: false, // standard hosted page; no extra code needed
};

// User self-service: "Forgot password"
export function requestPasswordReset(email) {
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
}

// Admin-triggered reset (sends email to that user)
export function adminTriggerPasswordReset(email) {
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
}

// ----- Users list & approvals -----
export function listUsersLive(cb) {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    return onSnapshot(q, s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}
export async function listUsers() {
    const q = query(collection(db, "users")); const s = await getDocs(q);
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function updateUser(uid, data) {
    await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
}
export async function approveUser(uid) {
    await updateDoc(doc(db, "users", uid), { status: "approved", updatedAt: serverTimestamp() });
}
export async function rejectUser(uid) {
    await updateDoc(doc(db, "users", uid), { status: "rejected", updatedAt: serverTimestamp() });
}

// Convenience
export function profileFromUser(u, p) {
    return {
        uid: u?.uid,
        email: u?.email || p?.email || "",
        displayName: p?.displayName || u?.displayName || "",
        role: p?.role || "affiliate",
        status: p?.status || "pending",
        tiktok: p?.tiktok || "",
        discord: p?.discord || "",
    };
}
