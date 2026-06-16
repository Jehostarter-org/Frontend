'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import logo2 from '@/public/images/small logo WHITE.png';
import { useResetPasswordMutation } from '@/lib/api/authApiSlice';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/lib/validations/resetPassword';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { formState: { errors } } = form;

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;

    try {
      const result = await resetPassword({
        token,
        new_password: data.newPassword,
      }).unwrap();
      setResetSuccess(true);
    } catch (err: any) {
      const message =
        err?.data?.detail ??
        err?.data?.new_password?.[0] ??
        err?.data?.token?.[0] ??
        err?.message ??
        'Failed to reset password. The link may have expired.';

      if (
        err?.data?.detail?.toLowerCase().includes('expired') ||
        err?.data?.detail?.toLowerCase().includes('invalid') ||
        err?.status === 400
      ) {
        setTokenError(true);
      } else {
        form.setError('newPassword', { message });
      }
    }
  };

  // ── Invalid / expired token state ─────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">
          <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
            <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
          </section>

          <section className="w-full max-w-md space-y-6 py-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-4xl">🔗</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Invalid or Expired Link
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md bg-teal-900 hover:bg-teal-800 text-white text-sm font-medium transition-colors"
                >
                  Request New Reset Link
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">
          <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
            <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
          </section>

          <section className="w-full max-w-md space-y-6 py-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-teal-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Password Reset Successful
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>

              <Button
                type="button"
                className="w-full h-12 bg-teal-900 hover:bg-teal-800 text-white"
                onClick={() => router.push('/auth/login')}
              >
                Continue to Login
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── Main form state ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">

        {/* Left panel — desktop */}
        <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
          <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
          <div className="space-y-2">
            <h2 className="text-2xl py-3 font-semibold text-gray-900">
              Create New Password
            </h2>
            <p className="text-gray-600 text-sm py-3 px-4">
              Choose a strong password that you haven&apos;t used before.
            </p>
          </div>
        </section>

        {/* Form card */}
        <section className="w-full max-w-md space-y-4 py-4">
          <header className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500">
              Enter your new password below. It must be at least 8 characters.
            </p>
          </header>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* New Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  className="pl-10 pr-10 h-12"
                  autoComplete="new-password"
                  {...form.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10 h-12"
                  autoComplete="new-password"
                  {...form.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password strength hints */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-gray-700">Password must contain:</p>
              <div className="space-y-1.5">
                {[
                  { label: 'At least 8 characters', check: (v: string) => v.length >= 8 },
                  { label: 'At least one uppercase letter', check: (v: string) => /[A-Z]/.test(v) },
                  { label: 'At least one number', check: (v: string) => /[0-9]/.test(v) },
                  { label: 'Passwords match', check: (v: string, w: string) => v === w && v.length > 0 },
                ].map((rule) => {
                  const pw = form.watch('newPassword');
                  const cpw = form.watch('confirmPassword');
                  const met = rule.check(pw, cpw);
                  return (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                          met ? 'bg-teal-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {met && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={met ? 'text-teal-700 font-medium' : 'text-gray-500'}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-teal-900 hover:bg-teal-800 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
