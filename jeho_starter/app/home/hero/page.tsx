import React from "react";
import Link  from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import hero from "@/public/images/Hero_couple_pics.png";

export default function Herosection() {
  return (
    <section className='bg-[#143B4A] text-white relative overflow-hidden'>
      <div className='max-w-7xl mx-auto px-6 flex items-center '>
        <div className='flex-1 space-y-8'>
          <h1 className='text-5xl font-bold leading-tight text-center mt-20'>
            JehoStarter <span className='text-amber-300'>Your Seamless,</span>
            <br />
            Journey to a <span className='text-amber-300'>New</span>
            <br />
            <span className='text-amber-300'>Life Abroad</span>
          </h1>

          <div className='flex space-x-4 text-center items-center justify-center'>
            <Link href='/auth/signup'>
              <Button
                size='lg'
                className='bg-amber-300 py-6 px-10 text-white font-semibold hover:bg-amber-200 hover:text-[#2C4E5B]'
              >
                Get Started
              </Button>
            </Link>
            <Link href="dashboard">
            <Button
              size='lg'
              variant='outline'
              className='bg-transparent py-6 px-10 text-white font-semibold hover:text-black'
              >
              See More
            </Button>
              </Link>
          </div>
        </div>

        <div className='flex-1 relative'>
          <div className='w-150 h-150 bg-[#17A2B8] mt-60 rounded-full absolute right-0 top-1/2 transform -translate-y-1/2'></div>
          <Image
            src={hero}
            alt='Happy travelers with luggage'
            className='relative z-10 w-[700px] h-130 mt-20 ml-auto'
          />
        </div>
      </div>
    </section>
  );
}
