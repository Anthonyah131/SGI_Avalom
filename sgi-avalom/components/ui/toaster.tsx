"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  const getTitleStyles = (typet?: "success" | "error" | "info") => {
    switch (typet) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-foreground dark:text-foreground";
    }
  };

  const getDescriptionStyles = (typet?: "success" | "error" | "info") => {
    switch (typet) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
      default:
        return "text-muted dark:text-muted-foreground";
    }
  };

  return (
    <ToastProvider>
      <div className="fixed top-0 right-0 p-4 space-y-4 z-50">
        {toasts.map(({ id, title, description, action, typet, ...props }) => (
          <Toast
            key={id}
            {...props}
            className="w-[300px] max-w-full bg-background shadow-lg rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <div className="grid gap-1">
                {title && (
                  <ToastTitle className={cn(getTitleStyles(typet))}>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </div>
          </Toast>
        ))}
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
