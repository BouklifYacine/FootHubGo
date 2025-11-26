import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsBlockProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value:  string | number;
}

export const StatsBlock: React.FC<StatsBlockProps> = ({ 
  icon: Icon,
  title,
  value 
}) => (
  <Card className="flex-1 md:m-4">
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-black dark:text-white">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);