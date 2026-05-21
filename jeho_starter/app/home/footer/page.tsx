import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import visa1 from "@/public/images/card-1.png";
import visa2 from "@/public/images/card-2.png";
import visa3 from "@/public/images/card-3.png";
import visa4 from "@/public/images/card-4.png";
import visa5 from "@/public/images/card-5.png";
import visa6 from "@/public/images/card-6.png";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer id="footer" className=' bg-[#143B4A] text-white py-16 px-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='grid md:grid-cols-4 gap-20 mb-12 justify-evenly'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-15 h-15 bg-[#2F819D] rounded-full flex items-center justify-center mx-auto'>
                <Phone className='w-8 h-8 text-white' />
              </div>
              <span className='font-semibold'>0123 456 7890</span>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <div className='w-15 h-15 bg-[#2F819D] rounded-full flex items-center justify-center mx-auto'>
                <Mail className='w-8 h-8 text-white' />
              </div>
              <span className='font-semibold'>0123 456 7890</span>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex space-x-2 ml-80'>
              <Link href="/auth/login">
                <Button
                  size='lg'
                  variant='outline'
                  className='border-primary-foreground bg-[#DFC16A] text-black px-10 py-6 hover:bg-black hover:text-white'
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size='lg'
                  className='border border-primary-foreground bg-transparent px-10 py-6 text-white hover:bg-white hover:text-black'
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className='border-t border-primary-foreground/20 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                {/* <div className='w-8 h-8 bg-accent rounded flex items-center justify-center'> */}
                  {/* <MapPin className='w-5 h-5 text-accent-foreground' /> */}
                {/* </div> */}
                <span className='text-xl font-bold'>JEHO STARTER</span>
              </div>
              <p className='text-sm'>Feathered</p>
              <p className='text-sm'>Business</p>
              <p className='text-sm'>Technology</p>
            </div>

            <div className='space-y-4'>
              <h4 className='font-semibold'>My Account</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#' className='hover:text-accent transition-colors'>
                    Shopping Cart
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-accent transition-colors'>
                    Checkout
                  </a>
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <h4 className='font-semibold'>
                We Best To Immediately Do Subscribe Newsletter.
              </h4>
              <div className='flex space-x-2'>
                <Input
                  placeholder='Email Address'
                  className='bg-primary-foreground text-primary border-0 px-7 py-6'
                />
                <Button className=' bg-[#DFC16A] text-black hover:bg-black hover:text-white px-10 py-6'>
                  Subscribe Now
                </Button>
              </div>
            </div>
          </div>

          <div className='mt-8 pt-8 border-t border-primary-foreground/20'>
            <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
              <p className='text-sm'>Follow us on social:</p>
              <div className='flex space-x-4'>
                <div className='w-8 h-8 bg-primary-foreground/20 rounded-full'></div>
                <div className='w-8 h-8 bg-primary-foreground/20 rounded-full'></div>
                <div className='w-8 h-8 bg-primary-foreground/20 rounded-full'></div>
                <div className='w-8 h-8 bg-primary-foreground/20 rounded-full'></div>
              </div>
            </div>

            <div className='mt-8 text-center'>
              <p className='text-sm mb-4'>
                We accept all popular payment methods
              </p>
              <div className='flex justify-center space-x-4'>
                <div className='w-12 h-8 bg-red-500 rounded flex items-center justify-center text-xs font-bold text-white'>
                  <Image src={visa1} alt='' />
                </div>
                <div className='w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-xs font-bold text-white'>
                  <Image src={visa2} alt='' />
                </div>
                <div className='w-12 h-8 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold text-white'>
                  <Image src={visa3} alt='' />
                </div>
                <div className='w-12 h-8 bg-green-500 rounded flex items-center justify-center text-xs font-bold text-white'>
                  <Image src={visa4} alt='' />
                </div>
                <div className='w-12 h-8 bg-green-500 rounded flex items-center justify-center text-xs font-bold text-white'>
                  <Image src={visa5} alt='' />
                </div>
                <div className='w-12 h-8 bg-green-500 rounded flex items-center justify-center text-xs font-bold text-white'>
                  <Image src={visa6} alt='' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
