'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ChevronDown, Check } from 'lucide-react';

import { Input }     from '@/components/ui/input';
import { Label }     from '@/components/ui/label';
import { Button }    from '@/components/ui/button';
import { Checkbox }  from '@/components/ui/checkbox';

import logo2 from '@/public/images/small logo WHITE.png';
import { useRegister } from '@/hooks/use-register';
import {
  signupSchema,
  type SignupInput,
  COUNTRY_OPTIONS,
  MIGRATION_STATUS_OPTIONS,
} from '@/lib/validations/signupAuth';

// ── Searchable Dropdown ────────────────────────────────────────────────────────
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  error,
}: {
  options: readonly { readonly value: string; readonly label: string }[];
  value?: string;
  onChange: (val: string) => void;
  placeholder: string;
  error?: string;
}) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={`
          w-full h-12 px-4 flex items-center justify-between
          rounded-lg border bg-white text-sm
          transition-all duration-150
          ${open
            ? 'border-teal-500 ring-2 ring-teal-100 shadow-sm'
            : error
              ? 'border-red-400'
              : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-100">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm rounded-md bg-gray-50 border border-gray-200 outline-none focus:border-teal-400 focus:bg-white transition"
              />
            </div>

            {/* Options list */}
            <ul className="max-h-52 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-200">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-400 text-center">No results found</li>
              ) : (
                filtered.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 text-sm text-left
                        transition-colors duration-100
                        ${opt.value === value
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      {opt.label}
                      {opt.value === value && <Check size={14} className="text-teal-600" />}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Google Icon SVG ────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087C16.6582 14.0518 17.64 11.8264 17.64 9.2045z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9087-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71C3.7841 10.17 3.6818 9.5945 3.6818 9s.1023-1.17.2822-1.71V4.9582H.9574C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.8918 11.4255 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SignupPage() {
  const { handleRegister, isLoading } = useRegister();
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName:          '',
      lastName:           '',
      username:           '',
      email:              '',
      phone:              '',
      password:           '',
      confirmPassword:    '',
      birthCountry:       undefined,
      currentCountry:     undefined,
      destinationCountry: undefined,
      city:               '',
      migrationStatus:    undefined,
      acceptedTerms:      false,
    },
  });

  const { formState: { errors } } = form;

  const onSubmit = async (data: SignupInput) => {
    await handleRegister(data);
  };

  const handleNextStep = async () => {
    const valid = await form.trigger([
      'firstName', 'lastName', 'username', 'email', 'phone',
      'password', 'confirmPassword',
    ]);
    if (valid) setStep(2);
  };

  const handleGoogleSignup = () => {
    // Django Google OAuth — redirects back to /dashboard after OAuth completes
    const params = new URLSearchParams({ next: '/dashboard' });
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/?${params}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">

        {/* Left panel — desktop only */}
        <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
          <Image src={logo2} alt="logo" className="w-24 h-auto" priority />
          <div className="space-y-2">
            <h2 className="text-2xl py-3 font-semibold text-gray-900">Join Jehostarter</h2>
            <p className="text-gray-600 text-sm py-3 px-4">
              Your platform for migrants — connect, shop, and access services wherever you are.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="w-full max-w-md space-y-4 py-4">
          <header className="text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">
              Step {step} of 2 — {step === 1 ? 'Your Details' : 'Your Location'}
            </p>
          </header>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>

          {/* Google button — step 1 only */}
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="
                  w-full h-12 flex items-center justify-center gap-3
                  rounded-lg border border-gray-200 bg-white
                  text-sm font-medium text-gray-700
                  hover:bg-gray-50 hover:border-gray-300
                  active:bg-gray-100
                  transition-all duration-150 shadow-sm
                "
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* ── Step 1 ─────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-3">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="First name" className="pl-10 h-12" {...form.register('firstName')} />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Input placeholder="Last name" className="h-12" {...form.register('lastName')} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Username" className="pl-10 h-12" {...form.register('username')} />
                  </div>
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input type="email" placeholder="@example.com" className="pl-10 h-12" {...form.register('email')} />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input type="tel" placeholder="Phone number (optional)" className="pl-10 h-12" {...form.register('phone')} />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      className="pl-10 h-12"
                      {...form.register('confirmPassword')}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="button" onClick={handleNextStep} className="w-full h-12 bg-teal-900 hover:bg-teal-800 text-white">
                  Next →
                </Button>
              </div>
            )}

            {/* ── Step 2 ─────────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-3">

                <div>
                  <Label className="text-sm text-gray-700 mb-1.5 block">Country of Birth *</Label>
                  <SearchableSelect
                    options={COUNTRY_OPTIONS}
                    value={form.watch('birthCountry')}
                    onChange={(val) => form.setValue('birthCountry', val as any, { shouldValidate: true })}
                    placeholder="Select your birth country"
                    error={errors.birthCountry?.message}
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-1.5 block">Current Country *</Label>
                  <SearchableSelect
                    options={COUNTRY_OPTIONS}
                    value={form.watch('currentCountry')}
                    onChange={(val) => form.setValue('currentCountry', val as any, { shouldValidate: true })}
                    placeholder="Where are you now?"
                    error={errors.currentCountry?.message}
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-1.5 block">Destination Country</Label>
                  <SearchableSelect
                    options={COUNTRY_OPTIONS}
                    value={form.watch('destinationCountry')}
                    onChange={(val) => form.setValue('destinationCountry', val as any, { shouldValidate: true })}
                    placeholder="Where are you migrating to?"
                    error={errors.destinationCountry?.message}
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-1.5 block">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="City (optional)" className="pl-10 h-12" {...form.register('city')} />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-700 mb-1.5 block">Migration Status</Label>
                  <SearchableSelect
                    options={MIGRATION_STATUS_OPTIONS}
                    value={form.watch('migrationStatus')}
                    onChange={(val) => form.setValue('migrationStatus', val as any, { shouldValidate: true })}
                    placeholder="Where are you in your journey?"
                    error={errors.migrationStatus?.message}
                  />
                </div>

                <div className="flex items-start space-x-2 py-1">
                  <Checkbox
                    id="terms"
                    onCheckedChange={(checked) => form.setValue('acceptedTerms', checked === true)}
                  />
                  <Label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-teal-600 underline">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-teal-600 underline">Privacy Policy</Link>
                  </Label>
                </div>
                {errors.acceptedTerms && <p className="text-red-500 text-xs">{errors.acceptedTerms.message}</p>}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 bg-teal-900 hover:bg-teal-800 text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-teal-600 font-semibold hover:underline">Login</Link>
            </p>
          </form>
        </section>
      </main>
    </div>
  );
}
