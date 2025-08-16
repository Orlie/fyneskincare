import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebaseConfig";
import { addUser } from "./firestore";

const auth = getAuth(app);

export const registerAffiliate = async ({ email, password, displayName, tiktok, discord }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await addUser(user.uid, { email, displayName, tiktok, discord, role: "affiliate", status: "pending" });
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    return null;
  }
};

export const loginAffiliate = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};



