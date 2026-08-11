'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useAcceptTermsMutation } from '@/lib/api/authApiSlice';
import { logOut } from '@/lib/features/auth/authSlice';
import { TermsContent } from '@/components/legal/terms-content';
import { Check, X } from 'lucide-react';

export default function AcceptTermsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [acceptTerms, { isLoading }] = useAcceptTermsMutation();

  const handleAccept = async () => {
    try {
      const result = await acceptTerms(undefined).unwrap();
      toast.success(result.detail || 'Terms accepted');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to accept terms');
    }
  };

  const handleDecline = () => {
    dispatch(logOut());
    router.push('/');
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm text-gray-500">
            Please review and accept our terms to continue
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-4 max-h-96 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-gray-50/50">
          <TermsContent />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            <Check size={16} />
            {isLoading ? 'Processing...' : 'Accept Terms'}
          </button>
          <button
            onClick={handleDecline}
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
