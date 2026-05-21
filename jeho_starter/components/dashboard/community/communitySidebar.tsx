import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";

export function SidebarItem({ item, isActive, onClick, isDM = false }: any) {
  return (
    <Button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${
        isActive ? "bg-white shadow-md ring-1 ring-gray-100 scale-[1.02]" : "hover:bg-white/50 text-slate-500"
      }`}
    >
      <div className="h-10 w-10 flex-shrink-0 relative">
        <SafeImage src={item.avatar} alt={item.title} width={40} height={40} className={`h-full w-full object-cover shadow-sm ${isDM ? 'rounded-full' : 'rounded-xl group-hover:rotate-2'}`} />
        {isDM && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-slate-50 rounded-full" />}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-black text-slate-900 truncate text-[11px] tracking-tight italic uppercase">{item.title}</p>
          {item.unreadCount > 0 && (
            <Badge className="bg-teal-500 h-4 min-w-4 border-none font-bold text-[8px] px-1">{item.unreadCount}</Badge>
          )}
        </div>
        <p className="text-[10px] text-slate-400 truncate font-medium">{item.message}</p>
      </div>
    </Button>
  );
}