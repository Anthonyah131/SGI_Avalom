import { Button } from "@/components/ui/button";
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
import ClienteForm from "./clienteFormProps";
import { useWindowWidth } from "@react-hook/window-size";
import { useState } from "react";
import { Cliente } from "@/lib/types";

interface ManageClientActionsProps {
  titleButtom?: string;
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
  cliente?: Cliente;
}

const ManageClientActions: React.FC<ManageClientActionsProps> = ({
  titleButtom,
  title,
  description,
  action,
  variant,
  classn,
  icon,
  cliente,
}) => {
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
            {titleButtom}
            {icon}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ClienteForm
            action={action}
            cliente={cliente}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={variant} className={classn} onClick={toggleOpen}>
          {titleButtom}
          {icon}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ClienteForm
          action={action}
          cliente={cliente}
          onSuccess={handleSuccess}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild onClick={toggleOpen}>
            <Button variant={variant} className={classn}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageClientActions;
