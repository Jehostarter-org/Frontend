"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/contexts/auth-context";
import { useCart } from "@/components/contexts/cart-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // 👈 add AvatarImage
import { useNotifications } from "@/components/contexts/notification-context";
import { useGetUserProfileQuery } from "@/lib/api/userProfileApiSlice"; // 👈 add this
import { Search, MessageCircle, Bell, Menu, LucideHome, ShoppingCart } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function DashboardNavbar({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { getTotalDistinctItems } = useCart();
  const { totalUnreadCount, getInboxCount } = useNotifications();
  const { data: profile } = useGetUserProfileQuery(undefined); // 👈 fetch profile

  return (
    <header className='bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4'>
      <div className='flex items-center justify-between gap-2 sm:gap-4'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' className='lg:hidden' onClick={onMenuClick}>
            <Menu className='w-5 h-5' />
          </Button>

          <Link href='/dashboard'>
            <Button className='bg-gray-300 hover:bg-slate-800 text-[#17A2B8] px-3 sm:px-6 text-sm'>
              <div className='flex items-center gap-2'>
                <LucideHome className='w-4 h-4 mr-2 shrink-0' />
                <span className='hidden sm:inline'>Home</span>
              </div>
            </Button>
          </Link>
        </div>

        <div className='flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4 lg:mx-8'>
          <div className='relative'>
            <Search className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input placeholder='Search...' className='pl-8 sm:pl-10 bg-gray-100 border-0 text-sm' />
          </div>
        </div>

        <div className='flex items-center gap-1 sm:gap-2 lg:gap-4'>

          <div className='relative'>
            <Link href='/dashboard/inbox'>
              <Button variant='ghost' size='icon' className='w-8 h-8 sm:w-10 sm:h-10'>
                <MessageCircle className='w-4 h-4 sm:w-5 sm:h-5 text-[#17A2B8]' />
                {getInboxCount() > 0 && (
                  <Badge className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center'>
                    {getInboxCount() > 99 ? "99+" : getInboxCount()}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          <div className='relative'>
            <Link href='/dashboard/notification'>
              <Button variant='ghost' size='icon' className='w-8 h-8 sm:w-10 sm:h-10'>
                <Bell className='w-4 h-4 sm:w-5 sm:h-5 text-[#17A2B8]' />
                {totalUnreadCount > 0 && (
                  <Badge className='absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 sm:px-1.5 py-0.5 rounded-full'>
                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          <div className='relative'>
            <Link href='/dashboard/buyers-cart'>
              <Button variant='ghost' size='icon' className='w-8 h-8 sm:w-10 sm:h-10'>
                <ShoppingCart className='w-4 h-4 sm:w-5 sm:h-5 text-[#17A2B8]' />
                {getTotalDistinctItems() > 0 && (
                  <Badge className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center'>
                    {getTotalDistinctItems() > 99 ? "99+" : getTotalDistinctItems()}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          {/* 👇 Avatar now shows real profile image */}
          <Link href="/dashboard/profile">
            <Avatar className='w-8 h-8 sm:w-10 sm:h-10'>
              <AvatarImage
                src={profile?.avatar || ""}
                alt={profile?.first_name || user?.firstName || "User"}
                className="object-cover"
              />
              <AvatarFallback className='bg-orange-500 text-white text-sm'>
                {profile?.first_name?.charAt(0) || user?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

        </div>
      </div>
    </header>
  );
}