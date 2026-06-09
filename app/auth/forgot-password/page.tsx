'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import logo2 from '@/public/images/small logo WHITE.png';
import { useForgotPasswordMutation } from '@/lib/api/authApiSlice';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/forgotPassword';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { formState: { errors } } = form;

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      setSentToEmail(data.email);
      setEmailSent(true);
    } catch (err: any) {
      const message =
        err?.data?.detail ??
        err?.data?.email?.[0] ??
        err?.message ??
        'Something went wrong. Please try again.';
      form.setError('email', { message });
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">
          {/* Left panel — desktop */}
          <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
            <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
            <div className="space-y-2">
              <h2 className="text-2xl py-3 font-semibold text-gray-900">
                Reset Your Password
              </h2>
              <p className="text-gray-600 text-sm py-3 px-4">
                We&apos;ll help you get back into your account quickly and securely.
              </p>
            </div>
          </section>

          {/* Success card */}
          <section className="w-full max-w-md space-y-6 py-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
              {/* Animated check icon */}
              <div className="mx-auto w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-teal-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Check Your Email
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We&apos;ve sent a password reset link to
                </p>
                <p className="text-gray-900 font-semibold text-sm break-all">
                  {sentToEmail}
                </p>
              </div>

              {/* Email tips */}
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-medium text-gray-700">Didn&apos;t receive the email?</p>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    Check your spam or junk folder
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    Make sure the email address is correct
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    Wait a few minutes and check again
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => {
                    setEmailSent(false);
                    form.reset();
                  }}
                >
                  Try a different email
                </Button>

                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-md bg-teal-900 hover:bg-teal-800 text-white text-sm font-medium transition-colors"
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

  // ── Email input state ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">

        {/* Left panel — desktop */}
        <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
          <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
          <div className="space-y-2">
            <h2 className="text-2xl py-3 font-semibold text-gray-900">
              Forgot Your Password?
            </h2>
            <p className="text-gray-600 text-sm py-3 px-4">
              No worries — enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>
        </section>

        {/* Form card */}
        <section className="w-full max-w-md space-y-4 py-4">
          <header className="text-center space-y-2">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500">
              Enter the email address associated with your account and we&apos;ll send a reset link.
            </p>
          </header>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 h-12"
                  autoComplete="email"
                  {...form.register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-teal-900 hover:bg-teal-800 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending reset link...
                </span>
              ) : (
                'Send Reset Link'
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
