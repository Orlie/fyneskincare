// src/utils/auth.js


import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export const ADMIN_USERNAME = "admin@fyne.app";
const ADMIN_PASSWORD = "admin123"; // This will only be used for initial admin seeding if needed, not for actual auth

const auth = getAuth();

function nowISO() { return new Date().toISOString(); }

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
