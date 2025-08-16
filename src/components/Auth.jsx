import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState(""); // New state for confirm password
  const [name, setName] = useState(""); // New state for user's name
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, pw);
        console.log("User logged in successfully!");
      } else {
        // Sign-up logic
        if (pw !== confirmPw) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          name: name, // Store the user's name
          role: "affiliate", // Default role for new sign-ups
          uid: userCredential.user.uid,
          onboardingCompleted: false,
        });
        console.log("User registered successfully!");
      }
    } catch (err) {
      setError(err.message);
      console.error("Authentication error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
      console.error("Password reset error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card w-full max-w-md p-7">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center shadow-lg">
          <span className="text-white font-black">FS</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/50">Fyne Skincare</p>
          <h1 className="text-lg font-semibold">Creator Hub</h1>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-1">{isLogin ? "Welcome back 👋" : "Join the Hub!"}</h2>
      <p className="text-white/60 text-sm mb-6">
        {isLogin ? "Log in to manage products, tasks, and payouts." : "Sign up to start managing products, tasks, and payouts."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" type="text" className="input" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" placeholder="you @example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input id="password" type={show ? "text" : "password"} className="input pr-12" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete={isLogin ? "current-password" : "new-password"} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn-secondary px-3 py-1.5 text-xs" aria-label={show ? "Hide password" : "Show password"} >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {!isLogin && (
          <div>
            <label className="label" htmlFor="confirm-password">Confirm Password</label>
            <div className="relative">
              <input id="confirm-password" type={show ? "text" : "password"} className="input pr-12" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required autoComplete="new-password" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn-secondary px-3 py-1.5 text-xs" aria-label={show ? "Hide password" : "Show password"} >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        )}
        {isLogin && (
          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-white/70">
              <input type="checkbox" className="size-4 rounded border-white/20 bg-white/10" /> Remember me
            </label>
            <button type="button" onClick={handleForgotPassword} className="text-indigo-300 hover:text-indigo-200">Forgot password?</button>
          </div>
        )}
        <button className="btn-primary" disabled={loading}>
          {loading ? (isLogin ? "Signing in…" : "Signing up…") : (isLogin ? "Sign in" : "Sign up")}
        </button>
      </form>
      {error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}
      <p className="mt-6 text-center text-sm text-white/70">
        {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
        <button type="button" onClick={() => setIsLogin((prev) => !prev)} className="text-indigo-300 hover:text-indigo-200">
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}