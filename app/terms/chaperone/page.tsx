"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { ChaperoneTermsContent } from "@/components/legal/chaperone-terms-content";

export default function ChaperoneTermsPage() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = () => {
    setIsAccepting(true);
    toast.success("Terms accepted");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-dvh bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-teal-700 tracking-tight">
            Jehostarter
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Legal
          </span>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Chaprone Services – Terms &amp; Conditions
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Effective Date: 29th of August 2026
          </p>
          <div className="space-y-6">
            <ChaperoneTermsContent />
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-6">
              By accepting, you confirm that you have read and agreed to the
              Chaprone Services Terms &amp; Conditions above.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full max-w-md inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-teal-700 text-white text-base font-semibold hover:bg-teal-800 disabled:opacity-50 transition-colors"
              >
                {isAccepting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {isAccepting ? "Accepting..." : "Accept Terms & Conditions"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-4xl mx-auto px-4 pb-10">
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Jehostarter. All rights reserved.
        </p>
      </footer>
    </main>
  );
}