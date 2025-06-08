import { Badge } from "@/components/ui/badge";

export const PodiumRank = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 text-black font-bold">
          1
        </Badge>
      );
    } else if (rank === 2) {
      return (
        <Badge className="bg-gray-300 hover:bg-gray-400 px-2 py-1 text-black font-bold">
          2
        </Badge>
      );
    } else if (rank === 3) {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 px-2 py-1 text-black font-bold">
          3
        </Badge>
      );
    }
    return <span className="text-sm font-medium">{rank}</span>;
  };
  
  