"use client";

import React, { memo } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SendButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
}

export const SendButton = memo(function SendButton({
  disabled,
  isLoading,
}: SendButtonProps) {
  return (
    <Button
      type="submit"
      size="icon"
      className="h-10 w-10 shrink-0 rounded-xl"
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
    </Button>
  );
});
