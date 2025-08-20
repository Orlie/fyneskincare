// src/utils/auth.js

import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

function nowISO() { return new Date().toISOString(); }

export const ADMIN_USERNAME = "admin@fyne.app";
const ADMIN_PASSWORD = "admin123"; // This will only be used for initial admin seeding if needed, not for actual auth

const auth = getAuth();

/*************************
 * SESSION HELPERS
 *************************/
export function getSession() {
    const user = auth.currentUser;
    if (user) {
        return { userId: user.uid, email: user.email, role: "affiliate" }; // Simplified role for now
    }
    return null;
}

export async function logout() {
    await signOut(auth);
}

export function isAdmin(s) {
    const sess = s ?? getSession();
    return !!sess && sess.email === ADMIN_USERNAME; // Simple check for admin based on email
}

export function isAffiliate(s) {
    const sess = s ?? getSession();
    return !!sess && sess.role === "affiliate";
}

export async function currentUser(s) {
    const sess = s ?? getSession();
    if (!sess) return null;
    return await getUserById(sess.userId);
}

export async function loginAdmin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (user.email === ADMIN_USERNAME) {
            return { userId: user.uid, email: user.email, role: "admin" };
        }
        await signOut(auth);
        return null;
    } catch (error) {
        console.error("Admin login error:", error);
        return null;
    }
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
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getUserById(user.uid);
        if (userDoc && userDoc.role === "affiliate" && userDoc.status === "approved") {
            return { session: { userId: user.uid, email: user.email, role: "affiliate" } };
        }
        await signOut(auth);
        return { error: "Account not approved or not an affiliate." };
    } catch (error) {
        console.error("Affiliate login error:", error);
        return { error: error.message };
    }
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
export async function createTask({ userId, productId }) {
    const prod = await listProducts().find((p) => p.id === productId); // Await listProducts
    const user = await getUserById(userId);
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
