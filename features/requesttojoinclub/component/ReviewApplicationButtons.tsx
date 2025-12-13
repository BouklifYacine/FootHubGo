"use client";

import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviewApplication } from "../hooks/useReviewApplication";

type Props = {
  requestId: string;
  teamId: string;
  disabled?: boolean;
};

export default function ReviewApplicationButtons({
  requestId,
  teamId,
  disabled = false,
}: Props) {
  const { mutate, isPending } = useReviewApplication();

  const handleAccept = () => {
    mutate({ teamId, requestId, decision: "ACCEPTEE" });
  };

  const handleReject = () => {
    mutate({ teamId, requestId, decision: "REFUSEE" });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
        onClick={handleAccept}
        disabled={disabled || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
        onClick={handleReject}
        disabled={disabled || isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
