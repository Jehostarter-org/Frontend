import Link from "next/link";
import { TermsContent } from "@/components/legal/terms-content";

export const metadata = {
  title: "Terms & Conditions | Jehostarter",
  description:
    "Jehostarter platform terms of use, membership agreement, marketplace terms, instalment purchase agreement, and community guidelines.",
};

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-8">
            Effective Date: 1/08/2026
          </p>
          <div className="space-y-6">
            <TermsContent />
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
