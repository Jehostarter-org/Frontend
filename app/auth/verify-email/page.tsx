"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo2 from "@/public/images/small logo WHITE.png";
import { useAuth } from "@/components/contexts/auth-context";
import { useVerifyEmail } from "@/hooks/use-verify-email";

const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, token, isLoggedIn, isLoading: authLoading } = useAuth();
  const { handleVerify, handleResend, isVerifying, isResending } = useVerifyEmail();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = user?.email ?? "";

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !token) {
      router.replace("/auth/login");
      return;
    }
    if (user?.is_verified || user?.isVerified) {
      router.replace("/dashboard");
    }
  }, [authLoading, isLoggedIn, token, user, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const code = digits.join("");

  const submitCode = useCallback(async () => {
    if (!token || code.length !== OTP_LENGTH) return;
    await handleVerify(code, token);
  }, [code, token, handleVerify]);

  const updateDigit = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && code.length === OTP_LENGTH) {
      submitCode();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const onResend = async () => {
    if (resendCooldown > 0) return;
    await handleResend();
    setResendCooldown(60);
  };

  if (authLoading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-4 sm:px-8 py-8">
        <section className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center max-w-sm">
          <Image src={logo2} alt="Jehostarter" className="w-24 h-auto" priority />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Almost there</h2>
            <p className="text-gray-600 text-sm px-4">
              We sent a 6-digit code to your email. Enter it below to secure your account.
            </p>
          </div>
        </section>

        <section className="w-full max-w-md space-y-6">
          <header className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
              <Mail className="w-7 h-7 text-teal-700" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Verify your email</h1>
            <p className="text-sm text-gray-500">
              Code sent to{" "}
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </header>

          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => updateDigit(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold border-gray-200 focus:border-teal-500 focus:ring-teal-100"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            type="button"
            disabled={code.length !== OTP_LENGTH || isVerifying}
            onClick={submitCode}
            className="w-full h-12 bg-teal-900 hover:bg-teal-800 text-white disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify email"
            )}
          </Button>

          <div className="text-center space-y-3">
            <p className="text-xs text-gray-500">Didn&apos;t receive the code?</p>
            <Button
              type="button"
              variant="outline"
              disabled={isResending || resendCooldown > 0}
              onClick={onResend}
              className="w-full h-11"
            >
              {isResending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 text-teal-600 font-semibold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
