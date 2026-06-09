import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/lib/features/auth/authSlice';
import {
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} from '@/lib/api/authApiSlice';

export function useVerifyEmail() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();

  const refreshProfile = async (token: string) => {
    const profileRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api/users/me/`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!profileRes.ok) throw new Error('Failed to refresh profile.');
    return profileRes.json();
  };

  const handleVerify = async (code: string, token: string) => {
    try {
      await verifyEmail({ code }).unwrap();
      const user = await refreshProfile(token);
      dispatch(setCredentials({ user, token }));
      toast.success('Email verified!', {
        description: 'Your account is now active.',
      });
      if (!user.accepted_terms) {
        router.push('/auth/accept-terms');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message =
        err?.data?.detail ?? err?.message ?? 'Verification failed. Try again.';
      toast.error('Invalid code', { description: message });
      throw err;
    }
  };

  const handleResend = async () => {
    try {
      await resendEmail().unwrap();
      toast.success('Code sent', {
        description: 'Check your inbox for a new 6-digit code.',
      });
    } catch (err: any) {
      const message =
        err?.data?.detail ?? err?.message ?? 'Could not send email.';
      toast.error('Resend failed', { description: message });
    }
  };

  return {
    handleVerify,
    handleResend,
    isVerifying,
    isResending,
  };
}
