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
import { Separator } from "@/components/ui/separator";

interface FormProps<T> {
  action: "create" | "edit" | "view";
  entity?: T;
  onSuccess: () => void;
}

interface ManageActionsProps<T> {
  titleButton?: string;
  title: string;
  description: string;
  action: "create" | "edit" | "view";
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
  entity?: T;
  FormComponent: React.FC<FormProps<T>>;
}

const ManageActions = <T,>({
  titleButton,
  title,
  description,
  action,
  variant,
  classn,
  icon,
  entity,
  FormComponent,
}: ManageActionsProps<T>) => {
  const [open, setOpen] = useState(false);
  const onlyWidth = useWindowWidth();
  const isDesktop = onlyWidth >= 768;

  const toggleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen((prevOpen) => !prevOpen);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={variant} className={classn} onClick={toggleOpen}>
            {titleButton}
            {icon}
          </Button>
        </DialogTrigger>
        <DialogContent className="md:max-w-xl lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="md:max-h-[500px] lg:max-h-[600px] xl:max-h-[700px] rounded-md">
            <FormComponent
              action={action}
              entity={entity}
              onSuccess={handleSuccess}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={variant} className={classn} onClick={toggleOpen}>
          {titleButton}
          {icon}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <FormComponent
          action={action}
          entity={entity}
          onSuccess={handleSuccess}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild onClick={toggleOpen}>
            <Button variant={variant} className={classn}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageActions;
