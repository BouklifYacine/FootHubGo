import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsBlockProps {
  icon: React.ReactElement;
  title: string;
  value: string | number;
}

export const BlockStats2: React.FC<StatsBlockProps> = ({ 
  icon,
  title,
  value 
}) => (
  <Card className="flex-1 md:m-4">
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-blue-400 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);