"use client";

import { memo } from 'react';
import { X } from "lucide-react";
import { cn } from "@/lib/utils"; 
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ALERT_CONFIG } from "./system-alert-stats";
import { Card, CardContent } from "@/components/ui/card";


export type AlertType = "info" | "warning" | "success";

export interface SystemAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  href: string;
}

interface SingleAlertProps {
  alert: SystemAlert;
  onDismiss: (id: string) => void;
}

export const SingleAlert = memo(({ alert, onDismiss }: SingleAlertProps) => {
  const router = useRouter();
  const config = ALERT_CONFIG[alert.type];
  const Icon = config.icon;

  const handleCardClick = () => {
    router.push(alert.href);
  };

  const handleDismiss = (e: React.MouseEvent) => {    e.stopPropagation(); 
    onDismiss(alert.id);
  };

  return (
    <Card onClick={handleCardClick} className={cn( "cursor-pointer transition-colors duration-200 border shadow-sm group", config.styles )} role="alert" >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 group-hover:text-black transition-colors">
                {alert.title}
            </h4>
            <p className="text-xs font-medium text-gray-600 group-hover:text-gray-800 mt-1">
                {alert.message}
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6 shrink-0 text-gray-400 hover:text-gray-900 hover:bg-black/5 -mt-1 -mr-1" aria-label="Dismiss alert" >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
