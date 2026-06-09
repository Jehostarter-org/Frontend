import React from "react";
import Image from "next/image";
import aboutLogo from "@/public/images/JehoStarter__about_LOGO.png";

export default function About() {
  return (
    <section className='py-20 px-6'>
      <div className='max-w-7xl mx-auto flex items-center gap-5'>
        <div className='rounded-lg flex items-center justify-center'>
          <Image src={aboutLogo} alt='' className="h-150 w-150" />
        </div>

        <div className='flex-1 space-y-6'>
          <h2 className='text-4xl font-bold text-black text-center'>
            About JehoStarter
          </h2>
          <p className='text-xl w-2xl leading-relaxed text-center'>
            Welcome to JehoStarter, a pioneering marketplace app born from the
            vision of Team Jeho. We exist to solve a critical problem in our
            globalized world: the migration uncertainty faced by millions of
            immigrants.For those embarking on a new life abroad, the journey is
            often filled with daunting financial and logistical hurdles from
            securing a place to live to buying a car all without a local credit
            history. At JehoStarter,we believe that everyone deserves a smooth
            transition to their new home. We’ve created a powerful solution that
            helps immigrants settle abroad and eliminate uncertainty.
          </p>
        </div>
      </div>
    </section>
  );
}
