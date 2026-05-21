import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface TabProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  variant?: "default" | "unread";
}

export const TabButton = ({ active, onClick, label, count, variant }: TabProps) => (
    <Button onClick={onClick} className={`flex items-center gap-2 flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
      active ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50" : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
    }`} >
        {label}
        {count !== undefined && count > 0 && (
            <Badge className={`${active ? "bg-teal-600" : "bg-gray-300"} text-white border-none text-[10px] h-5 min-w-5 flex items-center justify-center`}>
                {count}
            </Badge>
        )}
  </Button>
);