import { Metadata } from "next";
import Link from "next/link";
import MerchantLoginForm from "./client";

export const metadata: Metadata = {
  title: "Merchant Login | FuBao Merchant Center",
  description:
    "Sign in to your FuBao merchant account to manage products, orders, and settlements.",
  robots: { index: false },
};

export default function MerchantLoginPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-2xl font-serif font-light tracking-[0.3em] text-[var(--ink)] uppercase"
          >
            FuBao
          </Link>
          <p className="mt-3 text-sm text-[var(--smoke)] tracking-widest uppercase">
            Merchant Center
          </p>
        </div>

        <div className="bg-white/60 border border-[var(--jade)] rounded-sm p-8 shadow-sm">
          <h1 className="text-2xl font-serif font-light text-[var(--ink)] mb-2">
            Merchant Sign In
          </h1>
          <p className="text-sm text-[var(--smoke)] mb-8">
            Access your storefront dashboard, product catalog, and settlement
            records.
          </p>
          <MerchantLoginForm />

          <div className="mt-8 pt-6 border-t border-[var(--jade)] space-y-3 text-sm">
            <p className="text-[var(--smoke)]">
              New to FuBao?{" "}
              <Link
                href="/merchant/apply"
                className="text-[var(--cinnabar)] underline-offset-4 hover:underline"
              >
                Apply to become a merchant
              </Link>
            </p>
            <p className="text-[var(--smoke)]">
              Customer account?{" "}
              <Link
                href="/login"
                className="text-[var(--cinnabar)] underline-offset-4 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xs text-[var(--smoke)] bg-[var(--jade)]/50 border border-[var(--jade)] rounded-sm px-4 py-3">
            <p className="font-medium text-[var(--ink)] mb-1">Demo Account</p>
            <p>merchant@fubao.com / merchant123</p>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-[var(--smoke)]">
          For entertainment purposes only.
        </p>
      </div>
    </main>
  );
}
