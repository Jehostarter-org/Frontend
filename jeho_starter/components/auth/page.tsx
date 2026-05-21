// components/auth/ProtectedRoute.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '@/lib/features/auth/authSlice';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    // If there is no token, redirect the user to the login page.
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  // If there is a token, render the child page.
  // You can also add a loading spinner here while the check is happening.
  if (token) {
    return <>{children}</>;
  }

  // Optionally, return null or a loader while redirecting
  return null; 
}