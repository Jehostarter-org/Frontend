import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/contexts/auth-context";


export default function WelcomeBanner() {

    const { user } = useAuth();

    const plan = user?.plan;
    const planLabel =
      plan && plan !== "free"
        ? plan.charAt(0).toUpperCase() + plan.slice(1)
        : "Regular";

  return (
    <Card className="bg-[#2d4a53] text-white overflow-hidden shadow-lg border-none">
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <Badge className="w-fit bg-white/10 text-white border-white/20 font-medium hover:bg-white/20 transition-colors px-3 py-1">
            {planLabel} Plan
          </Badge>
        </div>
        <p className="text-teal-100/80 text-lg">
          Your journey abroad, simplified.
        </p>
      </CardContent>
    </Card>
  );
}