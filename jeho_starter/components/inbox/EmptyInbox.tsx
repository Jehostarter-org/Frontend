"use client";

import { Inbox, Search } from "lucide-react";

interface EmptyInboxProps {
  isSearch?: boolean;
}

export default function EmptyInbox({ isSearch = false }: EmptyInboxProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-6">
        {isSearch ? (
          <Search className="h-12 w-12 text-gray-400" />
        ) : (
          <Inbox className="h-12 w-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        {isSearch ? "No results found" : "No messages yet"}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {isSearch
          ? "Try adjusting your search terms to find what you're looking for."
          : "Your inbox is empty. When you receive messages, they'll appear here."}
      </p>
    </div>
  );
}
