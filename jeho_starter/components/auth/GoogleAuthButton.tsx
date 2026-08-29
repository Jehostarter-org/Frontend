'use client';

import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { useGoogleLoginMutation } from '@/lib/api/authApiSlice';

interface GoogleAuthButtonProps {
  redirectPath?: string;
}

export default function GoogleAuthButton({
  redirectPath = '/dashboard',
}: GoogleAuthButtonProps) {
  const router   = useRouter();
  const dispatch = useDispatch();
  const [googleLogin, { isLoading }] = useGoogleLoginMutation();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const credential = credentialResponse.credential;

      if (!credential) {
        throw new Error('No credential received from Google.');
      }

      // Send Google ID token to Django backend
      const result = await googleLogin(credential).unwrap();
      const { access, refresh } = result;

      if (!access) throw new Error('No access token received.');

      // Fetch full user profile
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api/users/me/`,
        { headers: { Authorization: `Bearer ${access}` } },
      );

      if (!profileRes.ok) throw new Error('Failed to fetch profile.');

      const user = await profileRes.json();

      dispatch(setCredentials({ user, token: access, refreshToken: refresh }));

      toast.success(
        result.created ? 'Account created!' : 'Welcome back!',
        { description: 'Redirecting to your dashboard...' },
      );

      // New Google users need to accept the terms of service first
      if (result.created || !user.accepted_terms) {
        setTimeout(() => router.push('/auth/accept-terms'), 500);
      } else {
        setTimeout(() => router.push(redirectPath), 500);
      }

    } catch (err: any) {
      const message =
        err?.data?.error ??
        err?.message ??
        'Google sign-in failed. Please try again.';
      toast.error('Sign in failed', { description: message });
    }
  };

  const handleError = () => {
    toast.error('Google sign-in was cancelled or failed.');
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        shape="rectangular"
        size="large"
        text="continue_with"
        width="400"
      />
    </div>
  );
}