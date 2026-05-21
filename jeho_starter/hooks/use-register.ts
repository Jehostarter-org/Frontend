import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { useRegisterUserMutation, useLoginUserMutation } from '@/lib/api/authApiSlice';
import { SignupInput } from '@/lib/validations/signupAuth';

export const useRegister = () => {
  const router   = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterUserMutation();
  const [login,    { isLoading: isLoggingIn    }] = useLoginUserMutation();

  const handleRegister = async (formData: SignupInput) => {
    try {
      // Step 1 — Register the user
      await register({
        username:            formData.username,
        email:               formData.email,
        password:            formData.password,
        password2:           formData.confirmPassword,
        first_name:          formData.firstName,
        last_name:           formData.lastName,
        phone:               formData.phone ?? '',
        birth_country:       formData.birthCountry,
        current_country:     formData.currentCountry,
        destination_country: formData.destinationCountry ?? '',
        city:                formData.city ?? '',
        migration_status:    formData.migrationStatus ?? '',
      }).unwrap();

      // Step 2 — Auto-login after successful registration
      const loginResult = await login({
        username: formData.email,
        password: formData.password,
      }).unwrap();

      const { access, refresh } = loginResult;

      if (!access) throw new Error('Registration succeeded but login failed.');

      // Step 3 — Fetch the full user profile
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api/users/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        },
      );

      if (!profileRes.ok) throw new Error('Failed to fetch profile after registration.');

      const user = await profileRes.json();

      // Step 4 — Store in Redux + localStorage
      dispatch(setCredentials({
        user,
        token:        access,
        refreshToken: refresh,
      }));

      toast.success('Account created!', {
        description: 'Welcome to Jehostarter.',
      });

      // Step 5 — Redirect to accept terms if not yet accepted
      if (!user.accepted_terms) {
        setTimeout(() => router.push('/auth/accept-terms'), 500);
      } else {
        setTimeout(() => router.push('/dashboard'), 500);
      }

    } catch (err: any) {
      // Django returns field-level errors as { field: ["error message"] }
      // e.g. { email: ["user with this email already exists."] }
      const data = err?.data;

      if (data && typeof data === 'object') {
        // Show the first field error we find
        const firstField = Object.keys(data)[0];
        const firstError = Array.isArray(data[firstField])
          ? data[firstField][0]
          : data[firstField];

        toast.error('Registration failed', {
          description: firstError ?? 'Please check your details and try again.',
        });
      } else {
        toast.error('Registration failed', {
          description: err?.message ?? 'Something went wrong. Please try again.',
        });
      }
    }
  };

  return {
    handleRegister,
    isLoading: isRegistering || isLoggingIn,
  };
};