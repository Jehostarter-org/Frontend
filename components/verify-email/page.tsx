"use client"

import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight, Clock, Inbox } from "lucide-react"
// import { useResendVerificationEmailMutation } from "@/lib/api/authApi"

interface VerifyEmailSectionProps {
  email?: string
}

export function VerifyEmailSection({ email }: VerifyEmailSectionProps) {
  const [emailResent, setEmailResent] = useState(false)
//   const [resendEmail, { isLoading }] = useResendVerificationEmailMutation()

  const handleResend = async () => {
    try {
      const emailToUse = email || localStorage.getItem("signup_email")
      if (!emailToUse) {
        toast.error("No email found. Please sign up again.");
        return
      }

    //   await resendEmail({ email: emailToUse }).unwrap()
      setEmailResent(true)
      toast.success("Verification email resent successfully");
      setTimeout(() => setEmailResent(false), 3000)
    } catch (error) {
      console.error("Failed to resend email:", error)
      toast.error("Failed to resend verification email. Please try again.");
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 md:p-10">
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
          <div className="relative bg-primary/10 p-3 sm:p-4 rounded-full">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-foreground mb-2 sm:mb-3">
        Check your email
      </h2>
      <p className="text-sm sm:text-base text-center text-muted-foreground mb-6 sm:mb-8">
        We`ve sent you a verification link {email && `to ${email}`} to complete your onboarding.
      </p>

      {emailResent && (
        <div className="mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
          <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">
            ✓ Verification email resent successfully
          </p>
        </div>
      )}

      <div className="space-y-3 mb-6 sm:mb-8 bg-muted/50 rounded-xl p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-foreground">Takes a minute</p>
            <p className="text-xs text-muted-foreground">The verification link expires in 24 hours</p>
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <Inbox className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-foreground">Check spam folder</p>
            <p className="text-xs text-muted-foreground">Sometimes our emails end up there</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleResend}
        // disabled={isLoading}
        variant="outline"
        className="w-full mb-4 bg-transparent text-sm sm:text-base"
      >
        {/* {isLoading ? "Sending..." : "Resend verification email"} */}
      </Button>

      <div className="flex items-center gap-3 mb-6 sm:mb-6">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <Link href="/auth/login" className="block">
        <Button variant="ghost" className="w-full group text-sm sm:text-base">
          Back to login
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  )
}
