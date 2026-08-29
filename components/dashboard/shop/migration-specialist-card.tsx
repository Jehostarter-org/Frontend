import { MessageCircle, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MigrationSpecialistCard() {
  return (
    <Card className="bg-[#2d4a53] text-white overflow-hidden shadow-lg border-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
            <Headphones className="h-6 w-6 text-teal-300" />
          </div>
          <div>
            <h4 className="font-medium text-base">Need guidance?</h4>
            <p className="text-xs text-white/60">Get help from our support team</p>
          </div>
        </div>

        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          Have questions about moving, documents or your plan? Our team replies fast.
        </p>

        <Button
          asChild
          className="w-full bg-white text-[#2d4a53] hover:bg-teal-100 gap-2 transition-colors"
        >
          <Link href="/support">
            <MessageCircle className="h-4 w-4" />
            Chat with Support
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}