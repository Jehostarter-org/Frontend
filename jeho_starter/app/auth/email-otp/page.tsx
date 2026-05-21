import Image from "next/image";
import { Button } from "@/components/ui/button";
import design from "@/public/images/OTP-design.png";
import logo from "@/public/images/jeho_logo-new.png";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import Link from "next/link";

export default function EmailOTP() {
  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      <div className='absolute left-2 top-2'>
        <Image src={logo} alt='logo' className='w-70 h-70' />
      </div>
      <div className='w-full max-w-md space-y-8'>
        <div className='flex justify-center mb-10'>
          <div className='relative w-80 h-75'>
            <Image
              src={design}
              alt='Email verification illustration'
              className='object-contain'
            />
          </div>
        </div>

        <div className='text-center space-y-6'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Confirm Your Email
            </h1>
            <p className='text-gray-600'>
              Enter the 6-digit code we just sent to fqhnk@gmail.com
            </p>
          </div>

          <div className='flex justify-center'>
            <InputOTP maxLength={6}>
              <InputOTPGroup className='gap-6'>
                <InputOTPSlot
                  index={0}
                  className='w-12 h-12 text-lg border border-gray-300'
                />
                <InputOTPSlot
                  index={1}
                  className='w-12 h-12 text-lg border border-gray-300'
                />
                <InputOTPSlot
                  index={2}
                  className='w-12 h-12 text-lg border border-gray-300'
                />
                <InputOTPSlot
                  index={3}
                  className='w-12 h-12 text-lg border border-gray-300'
                />
                <InputOTPSlot
                  index={4}
                  className='w-12 h-12 text-lg border border-gray-300'
                />
                <InputOTPSlot
                  index={5}
                  className='w-12 h-12 text-lg border border-gray-300'
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Link href=''>
            <Button className='w-full h-12 bg-teal-700 hover:bg-teal-800 text-white font-sembold'>
              Verify now
            </Button>
          </Link>

          <p className='text-gray-500 text-sm mt-3 absolute'>
            wait <span className='font-medium'>1:39</span> before requesting a
            new code
          </p>
        </div>
      </div>
    </div>
  );
}
