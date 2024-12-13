"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-background group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-green-600 group-[.toaster]:text-green-600",
          error: "group-[.toast]:bg-red-600 group-[.toaster]:text-red-600",
          info: "group-[.toast]:bg-blue-600 group-[.toaster]:text-blue-600",
          warning:
            "group-[.toast]:bg-yellow-600 group-[.toaster]:text-yellow-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
