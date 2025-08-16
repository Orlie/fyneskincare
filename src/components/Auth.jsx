import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Card from './Card';
import { Input } from './common';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-red-300 text-center">{error}</p>}
        <p className="mt-6 text-center text-white/70">
          {isLogin ? "Don't have an account?" : "Already have an account?"} 
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
