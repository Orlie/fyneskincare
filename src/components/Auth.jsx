import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Auth = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: userCredential.user.email,
          role: "affiliate", // Default role for new sign-ups
          uid: userCredential.user.uid,
          onboardingCompleted: false,
        });
        console.log('User registered successfully!');
      }
    } catch (err) {
      setError(err.message);
      console.error('Authentication error:', err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message);
      console.error('Password reset error:', err.message);
    }
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', backgroundColor: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#333333', width: '420px', padding: '40px', borderRadius: '18px', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', textAlign: 'center', marginBottom: '30px', color: '#ffffff' }}>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                style={{ width: '100%', padding: '15px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #555555', fontSize: '16px', backgroundColor: '#444444', color: '#ffffff' }}
              />
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{ width: '100%', padding: '15px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #555555', fontSize: '16px', backgroundColor: '#444444', color: '#ffffff' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: '100%', padding: '15px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #555555', fontSize: '16px', backgroundColor: '#444444', color: '#ffffff' }}
            />
          </div>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                style={{ width: '100%', padding: '15px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #555555', fontSize: '16px', backgroundColor: '#444444', color: '#ffffff' }}
              />
            </div>
          )}
          <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '17px', fontWeight: '600' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        {error && <p style={{ color: '#ff8a80', marginTop: '15px', textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: '#b9f6ca', marginTop: '15px', textAlign: 'center' }}>{message}</p>}
        {isLogin && (
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              onClick={handleForgotPassword}
              style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', textDecoration: 'none', fontSize: '14px' }}
            >
              Forgot Password?
            </button>
          </p>
        )}
        <p style={{ textAlign: 'center', marginTop: '30px', color: '#8e8e93' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            style={{ background: 'none', border: 'none', color: '#007aff', cursor: 'pointer', textDecoration: 'none', fontWeight: '600' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
