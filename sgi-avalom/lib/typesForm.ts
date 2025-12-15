import { AvaEdificio, AvaPago, AvaPropiedad, Cliente, User } from "@/lib/types";

// MantBuild
export interface RentalFormProps {
  action: "create" | "edit" | "view";
  onSuccess: () => void;
}

export interface PropertyFormProps {
  action: "create" | "edit" | "view";
  property?: AvaPropiedad;
  entity?: string;
  onSuccess: () => void;
}

export interface BuildFormProps {
  action: "create" | "edit" | "view";
  building?: AvaEdificio;
  onSuccess: () => void;
}

// MantUser
export interface UserFormProps {
  action: "create" | "edit" | "view";
  entity?: User;
  onSuccess: () => void;
}

// MantClient
export interface ClienteFormProps {
  action: "create" | "edit" | "view";
  entity?: Cliente;
  onSuccess: () => void;
}

export interface CancelPaymentFormProps {
  payment: AvaPago;
  onSuccess: () => void;
}
