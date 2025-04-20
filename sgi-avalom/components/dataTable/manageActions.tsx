"use client";

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
import { useWindowWidth } from "@react-hook/window-size";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageActionsProps {
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
    | "green"
    | null
    | undefined;
  classn?: string;
  icon?: React.ReactNode;
  FormComponent: React.ReactNode;
  disabled?: boolean;
}

const ManageActions: React.FC<ManageActionsProps> = ({
  titleButton,
  title,
  description,
  variant,
  classn,
  icon,
  FormComponent,
  disabled,
}) => {
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
            disabled={disabled}
            variant={variant}
            className={classn}
            onClick={toggleOpen}
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
            {FormComponent}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          disabled={disabled}
          variant={variant}
          className={classn}
          onClick={toggleOpen}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {titleButton}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-bold text-primary">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-4">{FormComponent}</ScrollArea>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageActions;
