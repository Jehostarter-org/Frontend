"use client"

import Link from "next/link";
import { services } from "./services-stats";
import { Card, CardContent } from "@/components/ui/card";

export function OtherServicesContent() {
  return (
    <div className="min-h-screen bg-gray-50 md:px-20 px-2 py-3">
        <main className="flex-1 lg:p-8">
          <h1 className="md:text-4xl text-3xl font-bold text-[#2d7a7a] mb-10">Services</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-15 md:px-7 gap-5 max-w-6xl">
            {services.map((service) => (
              <Card key={service.title} className="hover:shadow-md border-gray-300 py-10 transition-shadow cursor-pointer bg-white">
                <Link  href={service.href}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg ${service.bgColor} flex items-center justify-center shrink-0`}>
                      <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </main>
      </div>
  )
}
