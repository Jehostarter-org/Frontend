'use client';

import LoginPage from "./auth/login/page";
import React, { useState, useEffect } from "react";
import SplashScreenDisplay from "@/app/splash-screen-display/page";
// import About from "@/app/home/about/page";
// import Navbar from "@/app/home/navbar/page";
// import Footer from "@/app/home/footer/page";
// import Product from "@/app/home/product/page";
// import Herosection from "@/app/home/hero/page";
// import ServiceSection from "@/app/home/service/page";
// import EmpowerSection from "@/app/home/empower/page";

export default function Home() {
  
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 4500)

     return () => clearTimeout(timer)
  }, [])

  return <main className="min-h-screen">
    {showSplash ? <SplashScreenDisplay /> : <LoginPage />}
    </main>
}


    // <div>
      // <Navbar/>
      // <main>
        {/* <Herosection/> */}
        {/* <About/> */}
        {/* <EmpowerSection/> */}
        {/* <ServiceSection/> */}
        {/* <Product/> */}
      {/* </main> */}
      // <Footer/>
    // </div>