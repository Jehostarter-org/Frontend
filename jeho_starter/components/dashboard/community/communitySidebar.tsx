/**
 * communitySidebar.tsx
 *
 * Changes vs original
 * ────────────────────
 * • `SidebarItem` now accepts `unreadCount` as a plain prop (number).
 *   The parent passes the live value from `useCommunitySocket.unreadCounts`.
 * • The `isDM` online dot is kept as-is.
 * • No other visual changes — badge rendering was already correct, it just
 *   never received a non-zero value before.
 */

import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { Users, Lock } from "lucide-react";

export interface SidebarItemData {
  id: string;
  title: string;
  avatar: string;
  message?: string;        // last message preview (can be populated separately)
  time?: string;
  isPrivate?: boolean;
  unreadCount?: number;    // live value injected by parent from useCommunitySocket
}

interface SidebarItemProps {
  item: SidebarItemData;
  isActive: boolean;
  onClick: () => void;
  isDM?: boolean;
}

export function SidebarItem({ item, isActive, onClick, isDM = false }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 py-3 px-4 transition-all duration-200 border-b border-slate-100 cursor-pointer text-left ${isActive
          ? "bg-blue-50 border-l-4 border-blue-500"
          : "hover:bg-slate-50"
        }`}
    >
      <div className="h-12 w-12 flex-shrink-0 relative">
        <SafeImage
          src={item.avatar}
          alt={item.title}
          width={48}
          height={48}
          className="h-full w-full object-cover rounded-full shadow-sm ring-1 ring-slate-100"
        />
        {isDM && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-blue-500 border-2 border-white rounded-full shadow-md animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-semibold text-slate-800 truncate text-[14px] leading-tight flex items-center gap-1.5">
            {item.title}
            {item.isPrivate ? (
              <Lock size={12} className="text-slate-400" />
            ) : (
              !isDM && <Users size={12} className="text-slate-400" />
            )}
          </h4>
          <span className="text-[11px] text-slate-400 font-medium shrink-0">
            {item.time || ""}
          </span>
        </div>

        <div className="flex justify-between items-center gap-1">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <p className="text-[13px] text-slate-500 truncate leading-snug">
              {item.message || "No messages yet."}
            </p>
          </div>

          {/* Badge — shown whenever unreadCount > 0 (value comes from parent) */}
          {(item.unreadCount ?? 0) > 0 && (
            <Badge className="bg-blue-600 hover:bg-blue-600 text-white h-5 min-w-5 rounded-full border-none font-bold text-[10px] flex items-center justify-center p-0 shrink-0">
              {(item.unreadCount ?? 0) > 99 ? "99+" : item.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}