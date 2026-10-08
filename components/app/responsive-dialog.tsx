"use client";

import { createContext, useContext, type ComponentProps } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const MobileContext = createContext(false);

/**
 * A dialog on `md+`, a bottom sheet on phones (forms stay reachable with the thumb and never fight
 * with a centered modal). Same API as `Dialog`.
 */
export function ResponsiveDialog(props: ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile();
  return (
    <MobileContext.Provider value={isMobile}>
      {isMobile ? <Sheet {...props} /> : <Dialog {...props} />}
    </MobileContext.Provider>
  );
}

export function ResponsiveDialogTrigger(props: ComponentProps<typeof DialogTrigger>) {
  return useContext(MobileContext) ? <SheetTrigger {...props} /> : <DialogTrigger {...props} />;
}

export function ResponsiveDialogClose(props: ComponentProps<typeof DialogClose>) {
  return useContext(MobileContext) ? <SheetClose {...props} /> : <DialogClose {...props} />;
}

export function ResponsiveDialogContent({ className, children, ...props }: ComponentProps<typeof DialogContent>) {
  const isMobile = useContext(MobileContext);
  if (isMobile) {
    return (
      <SheetContent side="bottom" className={cn("gap-4 px-4 pt-6", className)} {...props}>
        <div aria-hidden className="absolute top-2 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-muted" />
        {children}
      </SheetContent>
    );
  }
  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
}

export function ResponsiveDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return useContext(MobileContext) ? (
    <SheetHeader className={cn("p-0 pr-10 text-left", className)} {...props} />
  ) : (
    <DialogHeader className={className} {...props} />
  );
}

export function ResponsiveDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return useContext(MobileContext) ? (
    <SheetFooter className={cn("p-0", className)} {...props} />
  ) : (
    <DialogFooter className={className} {...props} />
  );
}

export function ResponsiveDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  return useContext(MobileContext) ? <SheetTitle {...props} className={cn("text-lg", props.className)} /> : <DialogTitle {...props} />;
}

export function ResponsiveDialogDescription(props: ComponentProps<typeof DialogDescription>) {
  return useContext(MobileContext) ? <SheetDescription {...props} /> : <DialogDescription {...props} />;
}

