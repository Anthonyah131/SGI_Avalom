interface User {
  usu_id: number;
  usu_nombre: string;
  usu_papellido: string;
  usu_sapellido?: string | null;
  usu_cedula?: string | null;
  usu_correo: string;
  usu_contrasena: string;
  usu_telefono?: string | null;
  usu_fechacreacion?: Date | null;
  usu_estado: string;
  usu_rol: string;
}
