import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import logo from "@/public/images/big logo BLACK.png";

export const SidebarHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="p-2 flex flex-col items-center border-b border-gray-100 relative">
    <div className="lg:hidden absolute top-4 right-4">
      <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close sidebar" >
        <X className="w-5 h-5" />
      </Button>
    </div>

    <Link href="/dashboard" className="flex items-center gap-2 group">
      <div className="relative w-12 h-14 transition-transform group-hover:scale-105">
        <Image src={logo} alt="JehoStarter Logo" fill className="object-contain" priority />
      </div>
      <span className="text-2xl font-bold text-gray-900 tracking-tight">
        Jehostarter
      </span>
    </Link>
  </div>
);
