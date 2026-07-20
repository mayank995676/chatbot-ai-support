"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, CreditCard, Shield } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [subscription, setSubscription] = useState<string>("Free");
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeSub = localStorage.getItem("user_subscription_tier") || "Free";
    setSubscription(activeSub);
  }, []);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user_subscription_tier", "Pro");
      setSubscription("Pro");
      setShowCheckout(false);
    }, 1500);
  };

  const handleDowngrade = () => {
    localStorage.setItem("user_subscription_tier", "Free");
    setSubscription("Free");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-base tracking-tight">Subscription Plans</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
          Current Plan: {subscription}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Flexible Plans for Your Support Agent
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Choose a plan that fits your business needs. Scale up or down anytime.
          </p>

          {/* Toggle Switcher */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-11 h-6 bg-secondary border border-border rounded-full transition-all cursor-pointer"
            >
              <div
                className={`absolute top-0.5 w-4.5 h-4.5 bg-primary rounded-full transition-all ${
                  billingCycle === "yearly" ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly <span className="ml-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Free Tier */}
          <div className={`p-8 rounded-2xl border bg-card/60 backdrop-blur-md flex flex-col justify-between transition-all ${
            subscription === "Free" ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border shadow-sm hover:shadow-md"
          }`}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Standard Free</h3>
                <p className="text-xs text-muted-foreground mt-1">Perfect for sandbox testing and evaluating capabilities.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="border-t border-border/80 pt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Up to 5 messages per conversation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Access to Neon database document indexer</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Google Authentication login protection</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              {subscription === "Free" ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 bg-secondary border border-border text-muted-foreground text-xs font-semibold rounded-xl text-center"
                >
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={handleDowngrade}
                  className="w-full py-2.5 px-4 bg-card border border-border text-foreground hover:bg-secondary text-xs font-semibold rounded-xl text-center cursor-pointer transition-colors"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* Pro Tier */}
          <div className={`p-8 rounded-2xl border bg-card/60 backdrop-blur-md flex flex-col justify-between transition-all relative overflow-hidden ${
            subscription === "Pro" ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border shadow-sm hover:shadow-md"
          }`}>
            <div className="absolute top-3 right-3 bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-1.5">
                  Pro Agent <Sparkles className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500 animate-pulse" />
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Unlimited conversational capability for customer queries.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">
                  {billingCycle === "monthly" ? "$15" : "$12"}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>

              <div className="border-t border-border/80 pt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold">Unlimited messages / queries</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Priority Groq Llama-3 API routing</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time web search fallback</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Advanced dashboard configuration controls</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              {subscription === "Pro" ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 bg-secondary border border-border text-muted-foreground text-xs font-semibold rounded-xl text-center"
                >
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-2.5 px-4 bg-primary text-white hover:bg-primary/90 text-xs font-semibold rounded-xl text-center cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mock Checkout Modal Dialog */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <CreditCard className="h-4.5 w-4.5 text-primary" /> Complete Payment Setup
              </h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-secondary rounded-lg border border-border flex items-center gap-3">
                <Shield className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="text-[11px] leading-relaxed text-muted-foreground">
                  Secure checkout processed by Stripe. All transactions are simulated for testing.
                </div>
              </div>

              {/* Mock Credit Card Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242 4242 4242 4242"
                    disabled
                    className="w-full p-2.5 text-xs border border-border rounded-lg bg-secondary/50 text-muted-foreground outline-none font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/28"
                      disabled
                      className="w-full p-2.5 text-xs border border-border rounded-lg bg-secondary/50 text-muted-foreground outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                      CVC Code
                    </label>
                    <input
                      type="text"
                      placeholder="***"
                      defaultValue="123"
                      disabled
                      className="w-full p-2.5 text-xs border border-border rounded-lg bg-secondary/50 text-muted-foreground outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary text-white hover:bg-primary/90 font-semibold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing payment...
                </>
              ) : (
                "Upgrade to Pro ($15.00)"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
