"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/chat" });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-600/15 blur-3xl" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center">
          {/* Logo container */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20">
            <LogIn className="h-7 w-7 text-white" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with Google to access your support portal
          </p>
        </div>

        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 py-3.5 px-4 font-semibold text-white shadow-sm transition hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            {/* Google SVG Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.02 3.67-8.64z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.56c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 7.56C.5 9.36 0 11.38 0 13.5s.5 4.14 1.39 5.94l3.85-2.99z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.04.7-2.38 1.12-4.2 1.12-3.36 0-5.86-1.81-6.76-4.51L1.39 16.8C3.37 20.35 7.35 23 12 23z"
              />
            </svg>
            Continue with Google
          </motion.button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </motion.div>
    </div>
  );
}
