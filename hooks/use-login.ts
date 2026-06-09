import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { useLoginUserMutation } from '@/lib/api/authApiSlice';
import { LoginInput } from '@/lib/validations/loginAuth';

export const useLogin = () => {
  const router   = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginUserMutation();

  const handleLogin = async (formData: LoginInput) => {
    try {
      // Django SimpleJWT returns { access, refresh }
      const result = await login({
        username: formData.email,  // SimpleJWT accepts email as username
        password: formData.password,
      }).unwrap();

      const { access, refresh } = result;

      if (!access) {
        throw new Error('No access token received from server.');
      }

      // Fetch the full user profile using the access token
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api/users/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        },
      );

      if (!profileRes.ok) {
        throw new Error('Failed to fetch user profile after login.');
      }

      const user = await profileRes.json();

      // Store credentials in Redux + localStorage
      dispatch(setCredentials({
        user,
        token:        access,
        refreshToken: refresh,
      }));

      toast.success('Login successful', {
        description: 'Redirecting...',
      });

      if (!user.is_verified) {
        setTimeout(() => router.push('/auth/verify-email'), 500);
        return;
      }

      if (!user.accepted_terms) {
        setTimeout(() => router.push('/auth/accept-terms'), 500);
        return;
      }

      setTimeout(() => router.push('/dashboard'), 500);

    } catch (err: any) {
      // Django returns errors as { detail: "..." } or { non_field_errors: [...] }
      const message =
        err?.data?.detail ??
        err?.data?.non_field_errors?.[0] ??
        err?.message ??
        'Login failed. Please check your credentials.';

      toast.error('Login failed', { description: message });
    }
  };

  return { handleLogin, isLoading };
};