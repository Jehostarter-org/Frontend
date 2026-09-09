'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import logo2 from '@/public/images/small logo WHITE.png';
import loginImg from '@/public/images/background-2.png';
import { useLogin } from '@/hooks/use-login';
import { loginSchema, type LoginInput } from '@/lib/validations/loginAuth';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';


export default function LoginPage() {
  const { handleLogin, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { formState: { errors } } = form;

  const onSubmit = (data: LoginInput) => {
    handleLogin(data);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel — image (1/3) */}
        <section className="relative w-full lg:w-1/3 h-64 sm:h-72 md:h-80 lg:h-auto lg:min-h-dvh overflow-hidden">
          <Image
            src={loginImg}
            alt="Welcome"
            fill
            className="object-contain opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/80 via-emerald-600/40 to-transparent" />

          <div className="absolute top-6 left-6 hidden lg:block">
            <Image src={logo2} alt="logo" className="w-16 h-auto drop-shadow-lg" priority />
          </div>

          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 lg:p-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg">
              Your journey<br />starts here.
            </h2>
            <div className="mt-4 w-12 h-1 rounded-full bg-emerald-400/80" />
            <p className="text-white/70 text-sm mt-4 max-w-[240px] leading-relaxed drop-shadow-md">
              One-stop shop that gives you the right start abroad.
            </p>
          </div>
        </section>

        {/* Right panel — login form */}
        <section className="w-full lg:w-2/3 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-0 lg:min-h-dvh bg-white">
          <div className="w-full max-w-md space-y-6">
            <div className="lg:hidden flex justify-center">
              <Image src={logo2} alt="logo" className="w-14 h-auto" priority />
            </div>

            <header className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
            </header>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <GoogleAuthButton redirectPath="/dashboard" />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-12 rounded-lg border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      {...form.register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 h-12 rounded-lg border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    <Label htmlFor="remember" className="text-xs text-gray-600">
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
                  className="w-full h-12 rounded-lg bg-teal-900 hover:bg-teal-800 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Sign in'}
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
          </div>
        </section>
      </main>
    </div>
  );
}
