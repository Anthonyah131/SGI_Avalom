"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PropertyManager from "./propertyManager";

interface ManageActionsProps<T> {
  titleButton?: string;
  title: string;
  description: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "nuevo"
    | null
    | undefined;
  classn?: string;
  icon?: React.ReactNode;
  propId: number;
  onSuccess?: () => void;
}

const ManageActionsProperty = <T,>({
  titleButton,
  title,
  description,
  variant,
  classn,
  icon,
  propId,
}: ManageActionsProps<T>) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen((prevOpen) => !prevOpen);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          className={`${classn} transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          onClick={toggleOpen}
          aria-label={`Abrir diálogo: ${titleButton}`}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {titleButton}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] md:max-h-[70vh] lg:max-h-[80vh] rounded-md overflow-hidden">
            <PropertyManager propertyId={propId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ManageActionsProperty;
