import React from "react";
import Link from "next/link";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import logo from "@/public/images/small logo WHITE.png"

export default function Navbar() {
  return (
    <nav className='w-full bg-[#2C4E5B] text-primary-foreground px-6 py-4'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
            <Image src={logo} alt="logo" className="w-30 h-15"/>
        </div>

        <div className='hidden md:flex items-center gap-6 font-semibold space-x-8'>
          <Link href='/home/hero' className='hover:text-accent transition-colors'>
            Home
          </Link>
          <Link href='/home/product' className='hover:text-accent transition-colors'>
            Product
          </Link>
          <Link href='/home/about' className='hover:text-accent transition-colors'>
            About
          </Link>
          <Link href='/home/empower' className='hover:text-accent transition-colors'>
            Blog
          </Link>
          <div className='flex items-center space-x-2 gap-5'>
            <User className='w-5 h-5' />
            <ShoppingCart className='w-5 h-5' />
          </div>

          <Button
            variant='secondary'
            className='bg-amber-300 py-5 px-10 text-white hover:bg-amber-200 hover:text-[#2C4E5B]'
          >
            <Link href='/#footer'>Contact Us</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
