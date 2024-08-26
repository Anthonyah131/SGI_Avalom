export interface User {
  usu_id: number;
  usu_nombre: string;
  usu_papellido: string;
  usu_sapellido?: string;
  usu_cedula: string;
  usu_correo: string;
  usu_contrasena: string;
  usu_telefono?: string;
  usu_fechacreacion?: string;
  usu_estado: "A" | "I";
  usu_rol: "A" | "J" | "E" | "R";
}

export interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_papellido: string;
  cli_sapellido?: string;
  cli_cedula: string;
  cli_telefono: string;
  cli_correo: string;
  cli_fechacreacion?: string;
  ava_clientexalquiler: AvaClientexAlquiler[];
}

export interface AvaClientexAlquiler {
  alq_id: number;
  cli_id: number;
  ava_alquiler: AvaAlquiler;
  ava_cliente: Cliente;
}

export interface AvaDeposito {
  depo_id: number;
  depo_montoactual: string;
  depo_total: string;
  depo_descripcion?: string;
  alq_id?: number;
  ava_alquiler?: AvaAlquiler;
  ava_pago: AvaPago[];
}

export interface AvaPago {
  pag_id: number;
  pag_monto: string;
  pag_descripcion?: string;
  pag_cuenta?: string;
  pag_fechapago: string;
  res_id?: number;
  alqm_id?: number;
  depo_id?: number;
  ava_reservacion?: AvaReservacion;
  ava_alquilermensual?: AvaAlquilerMensual;
  ava_deposito?: AvaDeposito;
}

export interface AvaEdificio {
  edi_id: number;
  edi_identificador: string;
  edi_descripcion?: string;
  ava_pagoservicio: AvaPagoServicio[];
  ava_propiedad: AvaPropiedad[];
}

export interface AvaPropiedad {
  prop_id: number;
  prop_identificador: string;
  prop_descripcion?: string;
  edi_id?: number;
  tipp_id?: number;
  ava_alquiler: AvaAlquiler[];
  ava_pagoservicio: AvaPagoServicio[];
  ava_edificio?: AvaEdificio;
  ava_tipopropiedad?: AvaTipoPropiedad;
  ava_reservacion: AvaReservacion[];
}

export interface AvaTipoPropiedad {
  tipp_id: number;
  tipp_nombre: string;
  ava_propiedad: AvaPropiedad[];
}

export interface AvaAlquiler {
  alq_id: number;
  alq_monto: string;
  alq_fechapago: string;
  alq_contrato?: string;
  alq_estado: "A" | "F" | "C";
  alq_fechacreacion?: string;
  prop_id?: number;
  ava_propiedad?: AvaPropiedad;
  ava_alquilermensual: AvaAlquilerMensual[];
  ava_deposito: AvaDeposito[];
  ava_clientexalquiler: AvaClientexAlquiler[];
}

export interface AvaAlquilerMensual {
  alqm_id: number;
  alqm_anio: string;
  alqm_mes: string;
  alqm_montototal: string;
  alqm_montopagado: string;
  alqm_fechapago?: string;
  alqm_estado: string;
  alqm_fechacreacion?: string;
  alq_id?: number;
  ava_alquiler?: AvaAlquiler;
  ava_pago: AvaPago[];
}

export interface AvaReservacion {
  res_id: number;
  res_nombrecliente: string;
  res_telefonocliente?: string;
  res_correocliente?: string;
  res_fechacreacion?: string;
  res_fechaentrada: string;
  res_fechasalida: string;
  res_estado: string;
  prop_id?: number;
  ava_pago: AvaPago[];
  ava_propiedad?: AvaPropiedad;
}

export interface AvaServicio {
  ser_id: number;
  ser_nombre: string;
  ser_descripcion?: string;
  ser_estado: string;
  ser_fechacreacion?: string;
  ava_pagoservicio: AvaPagoServicio[];
}

export interface AvaPagoServicio {
  pser_id: number;
  pser_monto: string;
  pser_fecha: string;
  pser_descripcion?: string;
  ser_id?: number;
  edi_id?: number;
  ava_edificio?: AvaEdificio;
  ava_servicio?: AvaServicio;
}

declare module "next/server" {
  interface NextRequest {
    user?: User;
  }
}
