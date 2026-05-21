import { Phone, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MigrationSpecialistCard() {
  return (
    <Card className="bg-[#1a1a1a] text-white overflow-hidden shadow-lg border-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12 border-2 border-amber-600">
            <AvatarFallback className="bg-amber-600 text-white font-bold">MC</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-base">Michael Chen</h4>
            <p className="text-xs text-white/60">Migration Specialist</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold text-amber-500">4.9</span>
              <span className="text-[10px] text-white/40 ml-1">(127 reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 p-3 rounded-md">
          <Phone className="h-4 w-4 text-amber-500" />
          <span>+1 (555) 123-4567</span>
        </div>
      </CardContent>
    </Card>
  );
}