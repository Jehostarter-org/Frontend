import React from "react";
import Image from "next/image";
import couple from "@/public/images/Family trip_empower.png";

export default function EmpowerSection() {
  return (
    <section className='py-20 px-6 bg-muted'>
      <div className='max-w-7xl mx-auto flex items-center gap-5'>
        <div className='flex-1 space-y-6'>
          <h2 className='text-4xl font-bold text-center text-black'>
            Empowering Immigrants to Thrive
          </h2>
          <p className='text-center text-xl font-sm leading-relaxed'>
            Our core mission is to empower immigrants by providing a clear
            pathway to financial inclusion and stability. We do this by
            addressing one of the most significant challenges: building a
            financial footprint. JehoStarter is a dynamic marketplace with a
            purpose. It allows you to acquire essential goods and services
            through secure, installment-based transactions, letting you build a
            positive financial record as you go.
          </p>
        </div>

        <div className='flex-1'>
          <Image
            src={couple}
            alt='Empowered immigrants'
            className='w-150 h-140 rounded-lg'
          />
        </div>
      </div>
    </section>
  );
}
