export const BadgeNote = ({ note }: { note: number }) => {
    let color = "bg-gray-200";
  
    if (note >= 8) {
      color = "bg-green-500";
    } else if (note >= 7) {
      color = "bg-green-400";
    } else if (note >= 6) {
      color = "bg-yellow-400";
    } else if (note >= 5) {
      color = "bg-orange-400";
    } else {
      color = "bg-red-400";
    }
  
    return (
      <div className="flex items-center">
        <div
          className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white mr-1`}
        >
          {note.toFixed(1)}
        </div>
      </div>
    );
  };