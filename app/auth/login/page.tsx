'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import { Button }    from '@/components/ui/button';
import { Checkbox }  from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import logo2 from '@/public/images/small logo WHITE.png';
import loginGen from '@/public/images/image-gen.jpeg';
import { useLogin } from '@/hooks/use-login';
import { loginSchema, type LoginInput } from '@/lib/validations/loginAuth';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';


export default function LoginPage() {
  const { handleLogin, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email:      '',
      password:   '',
      rememberMe: false,
    },
  });

  const { formState: { errors } } = form;

  const onSubmit = (data: LoginInput) => {
    handleLogin(data);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white relative">
      {/* Bottom-left decorative image */}
      <div className="absolute bottom-0 left-0 hidden md:block">
        <Image src={loginGen} alt="decorative" className="w-36 md:w-44 lg:w-52 h-auto opacity-90" priority />
      </div>
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 px-5 sm:px-8 py-8">

        {/* Left panel — desktop only */}
        <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
          <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
          <div className="space-y-2">
            <h2 className="text-2xl py-3 font-semibold text-gray-900">
              Are You Migrating?
            </h2>
            <span className="text-3xl font-bold text-green-600 block">
              Browse Shop →
            </span>
            <p className="text-gray-600 text-sm py-3 px-4">
              Click the browse shop link to view contents
            </p>
          </div>
        </section>

        {/* Login form */}
        <section className="w-full max-w-md space-y-4 py-4">
          <header className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Login</h1>
          </header>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* ── Google Sign In ─────────────────────────────────────── */}
            <GoogleAuthButton redirectPath="/dashboard" />

            {/* ── Divider ────────────────────────────────────────────── */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* ── Email & Password ───────────────────────────────────── */}
            <div className="space-y-3">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="@example.com"
                    className="pl-10 h-12"
                    {...form.register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="pl-10 h-12"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    onCheckedChange={(checked) =>
                      form.setValue('rememberMe', checked === true)
                    }
                  />
                  <Label htmlFor="remember" className="text-xs">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-teal-900 hover:bg-teal-800 text-white disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Continue'}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-teal-600 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </section>
      </main>

      {/* Tagline */}
      <div className="w-full text-center py-6 px-4 border-t border-gray-100">
        <p className="text-[#143B4A] text-base sm:text-lg font-semibold tracking-wide">
          Jehostarter, your one-stop shop that gives you the right start abroad
        </p>
        <p className="text-teal-600 text-sm sm:text-base mt-1 italic">
          Who needs a family member abroad when you have Jehostarter
        </p>
      </div>
    </div>
  );
}