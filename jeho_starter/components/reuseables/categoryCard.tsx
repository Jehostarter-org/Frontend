"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProductCategory } from "@/app/dashboard/add-products/product-category";


interface CategoryCardProps {
  category: ProductCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { icon: Icon, title, description, href, color = "teal" } = category;
  const colorVariants: Record<string, string> = {
    teal: "group-hover:border-teal-500/50 bg-teal-50/30 text-teal-600",
    blue: "group-hover:border-blue-500/50 bg-blue-50/30 text-blue-600",
    orange: "group-hover:border-orange-500/50 bg-orange-50/30 text-orange-600",
    purple: "group-hover:border-purple-500/50 bg-purple-50/30 text-purple-600",
    primary: "group-hover:border-primary/50 bg-primary/5 text-primary",
  };

  const activeVariant = colorVariants[color as keyof typeof colorVariants] || colorVariants.primary;

  return (
    <Link href={href} className="group block h-full outline-none">
      <Card className={cn( "relative h-full p-8 flex flex-col items-center text-center transition-all duration-500",
          "border-border/60 bg-white/50 backdrop-blur-sm", "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1.5", activeVariant.split(" ")[0] )}
      >
        <div className={cn( "absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-xl", activeVariant.split(" ").pop()?.replace("text", "bg") )} />

        <div className={cn( "mb-6 flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-500", "group-hover:rotate-6 group-hover:scale-110", activeVariant.split(" ").slice(1, 3).join(" ") )}>
          {Icon ? <Icon className="w-16 h-16" strokeWidth={1.5} /> : null}
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-3 tracking-tight group-hover:text-gray-700 transition-colors"> {title} </h3>

        <p className="text-sm leading-relaxed text-muted-foreground px-2 mb-6"> {description} </p>
        
        <div className="mt-auto flex items-center text-md font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-gray-900 transition-all">
          <span>Explore Categories</span>
          <ArrowRight className="ml-2 w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}