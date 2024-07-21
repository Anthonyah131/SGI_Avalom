export interface User {
  usu_id: number;
  usu_nombre: string;
  usu_papellido: string;
  usu_sapellido?: string | null;
  usu_cedula: string;
  usu_correo: string;
  usu_contrasena: string;
  usu_telefono?: string | null;
  usu_fechacreacion?: string | null;
  usu_estado: string;
  usu_rol: string;
}

export interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_papellido: string;
  cli_sapellido?: string | null;
  cli_cedula: string;
  cli_telefono: string;
  cli_correo?: string | null;
  cli_fechacreacion?: string | null;
  ava_deposito: AvaDeposito[];
  ava_pago: AvaPago[];
}

export interface AvaDeposito {
  depo_id: number;
  depo_montoactual: string;
  depo_total: string;
  depo_descripcion?: string | null;
  alq_id?: number | null;
  ava_alquiler?: AvaAlquiler | null;
  ava_pago: AvaPago[];
}

export interface AvaPago {
  pag_id: number;
  pag_monto: string;
  pag_descripcion?: string | null;
  pag_cuenta?: string | null;
  pag_fechapago: string;
  res_id?: number | null;
  alqm_id?: number | null;
  depo_id?: number | null;
  ava_reservacion?: AvaReservacion | null;
  ava_alquilermensual?: AvaAlquilerMensual | null;
  ava_deposito?: AvaDeposito | null;
}

export interface AvaEdificio {
  edi_id: number;
  edi_identificador: string;
  edi_descripcion?: string | null;
  ava_pagoservicio: AvaPagoServicio[];
  ava_propiedad: AvaPropiedad[];
}

export interface AvaPropiedad {
  prop_id: number;
  prop_identificador: string;
  prop_descripcion?: string | null;
  edi_id?: number | null;
  tipp_id?: number | null;
  ava_alquiler: AvaAlquiler[];
  ava_pagoservicio: AvaPagoServicio[];
  ava_edificio?: AvaEdificio | null;
  ava_tipopropiedad?: AvaTipoPropiedad | null;
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
  alq_contrato?: string | null;
  alq_estado: string;
  alq_fechacreacion?: string | null;
  prop_id?: number | null;
  ava_propiedad?: AvaPropiedad | null;
  ava_alquilermensual: AvaAlquilerMensual[];
  ava_deposito: AvaDeposito[];
}

export interface AvaAlquilerMensual {
  alqm_id: number;
  alqm_anio: string;
  alqm_mes: string;
  alqm_montototal: string;
  alqm_montopagado: string;
  alqm_fechapago?: string | null;
  alqm_estado: string;
  alqm_fechacreacion?: string | null;
  alq_id?: number | null;
  ava_alquiler?: AvaAlquiler | null;
  ava_pago: AvaPago[];
}

export interface AvaReservacion {
  res_id: number;
  res_nombrecliente: string;
  res_telefonocliente?: string | null;
  res_correocliente?: string | null;
  res_fechacreacion?: string | null;
  res_fechaentrada: string;
  res_fechasalida: string;
  res_estado: string;
  prop_id?: number | null;
  ava_pago: AvaPago[];
  ava_propiedad?: AvaPropiedad | null;
}

export interface AvaServicio {
  ser_id: number;
  ser_nombre: string;
  ser_descripcion?: string | null;
  ser_estado: string;
  ser_fechacreacion?: string | null;
  ava_pagoservicio: AvaPagoServicio[];
}

export interface AvaPagoServicio {
  pser_id: number;
  pser_monto: string;
  pser_fecha: string;
  pser_descripcion?: string | null;
  ser_id?: number | null;
  edi_id?: number | null;
  ava_edificio?: AvaEdificio | null;
  ava_servicio?: AvaServicio | null;
}

declare module "next/server" {
  interface NextRequest {
    user?: User;
  }
}
