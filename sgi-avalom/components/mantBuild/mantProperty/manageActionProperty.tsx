"use client";

import { useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  const onlyWidth = useWindowWidth();
  const isDesktop = onlyWidth >= 768;

  const toggleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen((prevOpen) => !prevOpen);
  };

  if (isDesktop) {
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
        <DialogContent className="sm:max-w-[425px] md:max-w-xl lg:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              {title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md">
            <PropertyManager propertyId={propId} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant={variant}
          className={`${classn} transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
          onClick={toggleOpen}
          aria-label={`Abrir drawer: ${titleButton}`}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {titleButton}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-4">
          <PropertyManager propertyId={propId} />
        </ScrollArea>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild onClick={toggleOpen}>
            <Button variant="secondary">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageActionsProperty;
