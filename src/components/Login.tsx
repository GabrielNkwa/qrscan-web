import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../constants/firebase';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-pink-50">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-full mb-4">
          <Heart className="text-pink-600 fill-pink-600" size={32} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Love QR</h1>
        <p className="text-sm sm:text-base text-gray-500 px-4">
          {isLogin ? 'Welcome back! Please login to your account.' : 'Create an account to start sending love messages.'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
        <div className="relative group">
          <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={20} />
          <input
            type="email"
            placeholder="Email address"
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={20} />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all text-gray-800"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3.5 sm:py-4 rounded-xl font-bold text-lg hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-pink-100 mt-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {isLogin ? <LogIn size={22} /> : <UserPlus size={22} />}
              <span>{isLogin ? 'Login' : 'Sign Up'}</span>
            </>
          )}
        </button>

        <div className="pt-2">
          <button
            type="button"
            className="w-full text-pink-600 font-bold text-sm hover:text-pink-700 transition-colors"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Create one" : 'Already have an account? Login here'}
          </button>
        </div>
      </form>
    </div>
  );
}
