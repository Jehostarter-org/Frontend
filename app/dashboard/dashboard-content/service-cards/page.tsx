"use client";

import Link from "next/link";
import { services } from "./cards-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ServiceCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {services.map((service, index) => (
        <Card key={index} className="p-4 sm:p-6 hover:shadow-md transition-shadow border border-gray-300 cursor-pointer">
          <CardContent className="p-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${service.iconBg} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
              <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{service.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-4 line-clamp-2">{service.description}</p>
            <Link href={service.href || "#"}>
              <Button variant="outline" className="w-full bg-transparent border border-gray-300  hover:bg-teal-500 text-xs sm:text-sm">
                {service.buttonText}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
