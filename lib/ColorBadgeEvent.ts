 export const ColorBadgeEvent = (event: string) => {
    if (event === "CHAMPIONNAT")
      return "bg-blue-500 hover:bg-blue-600 text-white";
    else if (event === "COUPE")
      return "bg-purple-600 text-white ";
    return "bg-gray-500 hover:bg-gray-600 text-white";
  };