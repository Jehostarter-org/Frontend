"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import travel from "@/public/images/Traveling .png";
import logo from "@/public/images/small logo WHITE.png";
import { useAuth } from "@/components/contexts/auth-context";

export default function HeroSection() {
  const { user } = useAuth()

  return (
    <div className="bg-[#2C4E5B] rounded-lg p-4 sm:p-6 lg:p-8 text-white h-100 relative overflow-hidden m-10">
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-2xl lg:text-3xl xl:text-6xl max-w-xl font-bold mb-2 sm:mb-4 text-balance leading-tight">
          Hi {user?.firstName || "User"}, Let`s help you settle down smoothly in Canada
        </h1>
        <Link href="">
        <Button className="mt-4 sm:mt-6 bg-teal-500 hover:bg-teal-600 py-5 text-white text-sm sm:text-base rounded-full">
          About Us
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        </Link>
      </div>

      <div className="absolute right-2 sm:right-4 lg:right-8 top-1/2 transform -translate-y-1/2 hidden sm:block">
        <Image src={travel} alt="trip" className="w-90 h-90 mr-20" />
      </div>
      <div className="absolute right-2 sm:right-4 lg:right-8 transform -translate-y-1/2 hidden sm:block">
      <Image src={logo} alt="logo" className="w-20 h-10 mr-20 mt-15"/>
      </div>
    </div>
  )
}
