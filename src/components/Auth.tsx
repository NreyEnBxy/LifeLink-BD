import React, { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  User 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Droplets, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthView({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        onAuthSuccess(result.user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-slate p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg bg-emergency px-3 py-1.5 text-white text-lg font-black italic">
            +
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-text-main tracking-tight">
            {isLogin ? "Welcome Back" : "LifeLink BD"}
          </h2>
          <p className="text-text-muted font-medium">
            {isLogin ? "Login to your network" : "Start saving lives today"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-border bg-bg-slate py-4 pl-12 pr-4 text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/50"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-border bg-bg-slate py-4 pl-12 pr-4 text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-text-muted/50"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-xl bg-primary py-4 px-4 text-sm font-extrabold text-white transition-all hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-70 uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isLogin ? "Sign In" : "Register"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-primary hover:underline underline-offset-4"
          >
            {isLogin ? "New to LifeLink? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
