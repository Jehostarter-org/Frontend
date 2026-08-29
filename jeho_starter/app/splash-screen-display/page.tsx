"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import logo from "@/public/images/big logo BLACK.png";

export default function SplashScreenDisplay() {
  const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white transition-opacity duration-500 z-50 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className='flex flex-col items-center justify-center'>
        <Image src={logo} alt='logo' className='w-20 h-24' />
      </div>
    </div>
  );
}
