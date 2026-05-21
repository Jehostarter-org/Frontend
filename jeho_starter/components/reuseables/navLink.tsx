import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

export const NavLink = ({ href, isActive, icon: Icon, label, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
      isActive
        ? "bg-gray-100 text-black shadow-sm"
        : "text-gray-600 hover:text-[#2C4E5B] hover:bg-gray-50"
    )}
  >
    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#2C4E5B]" : "text-gray-400 group-hover:text-[#2C4E5B]")} />
    <span>{label}</span>
  </Link>
);