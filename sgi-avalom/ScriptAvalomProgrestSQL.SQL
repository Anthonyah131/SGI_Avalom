/*
Created: 1/8/2024
Modified: 27/11/2024
Model: PostgreSQL 12
Database: PostgreSQL 12
*/

-- Create tables section -------------------------------------------------

-- Table AVA_USUARIO

CREATE TABLE AVA_USUARIO
(
  usu_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del usuario
  usu_nombre VARCHAR(30) NOT NULL, -- Nombre del usuario
  usu_papellido VARCHAR(30) NOT NULL, -- Primer apellido del usuario
  usu_sapellido VARCHAR(30), -- Segundo apellido del usuario
  usu_cedula VARCHAR(15) NOT NULL, -- Cedula de usuario
  usu_correo VARCHAR(50) NOT NULL, -- Correo electronico del usuario
  usu_contrasena VARCHAR(500) NOT NULL, -- Contrasena del usuario
  usu_telefono VARCHAR(15), -- Numero de telefono del usuario
  usu_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creacion del usuario
  usu_estado VARCHAR(1) NOT NULL, -- Estado del usuario
  usu_rol VARCHAR(1) NOT NULL, -- Rol del usuario
  rowid BIGINT NOT NULL DEFAULT unique_rowid(),
  CONSTRAINT AVA_USUARIO_CK01 CHECK (usu_estado IN ('A','I')),
  CONSTRAINT AVA_USUARIO_CK02 CHECK (usu_rol IN ('A','J','E','R')),
  CONSTRAINT AVA_USUARIO_PK PRIMARY KEY (usu_id),
  CONSTRAINT AVA_USUARIO_UNQ01 UNIQUE (usu_cedula),
  CONSTRAINT AVA_USUARIO_UNQ02 UNIQUE (usu_correo)
)
WITH (
  autovacuum_enabled = true
);

COMMENT ON TABLE AVA_USUARIO IS 'Usuarios que tienen permitido manipular info en el sistema';
COMMENT ON COLUMN AVA_USUARIO.usu_id IS 'Id del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_nombre IS 'Nombre del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_papellido IS 'Primer apellido del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_sapellido IS 'Segundo apellido del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_cedula IS 'Cedula de usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_correo IS 'Correo electronico del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_contrasena IS 'Contrasena del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_telefono IS 'Numero de telefono del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_fechacreacion IS 'Fecha de creacion del usuario';
COMMENT ON COLUMN AVA_USUARIO.usu_estado IS 'Estado del usuario(''A'':Activo,''I'':Inactivo)';
COMMENT ON COLUMN AVA_USUARIO.usu_rol IS 'Rol del usuario(''A'':admin,''J'':jefe,''E'':empleado,''R'':auditor)';
COMMENT ON COLUMN AVA_USUARIO.rowid IS 'Row identifier para sincronización';

-- Table AVA_EDIFICIO

CREATE TABLE AVA_EDIFICIO (
  edi_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del edificio
  edi_identificador VARCHAR(15) NOT NULL, -- Identificador del edificio
  edi_descripcion VARCHAR(50), -- Descripcion del edificio
  edi_direccion VARCHAR(200), -- Direccion completa del edificio
  edi_codigopostal VARCHAR(10), -- Código postal para insertar en el contrato
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Row identifier para sincronización
  CONSTRAINT PK_AVA_EDIFICIO PRIMARY KEY (edi_id)
)
WITH (
  autovacuum_enabled = true
);

COMMENT ON TABLE AVA_EDIFICIO IS 'Edificios donde se encuentran las propiedades';

COMMENT ON COLUMN AVA_EDIFICIO.edi_id IS 'Id del edificio';
COMMENT ON COLUMN AVA_EDIFICIO.edi_identificador IS 'Identidicador del edificio';
COMMENT ON COLUMN AVA_EDIFICIO.edi_descripcion IS 'Descripcion del edificio';
COMMENT ON COLUMN AVA_EDIFICIO.edi_direccion IS 'Direccion completa del edificio';
COMMENT ON COLUMN AVA_EDIFICIO.edi_codigopostal IS 'Código postal para insertar en el contrato';
COMMENT ON COLUMN AVA_EDIFICIO.rowid IS 'Row identifier para sincronización';

-- Table AVA_ALQUILER

CREATE TABLE AVA_ALQUILER (
  alq_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del alquiler
  alq_monto BIGINT NOT NULL, -- Monto de alquiler mensual
  alq_fechapago TIMESTAMP NOT NULL, -- Fecha de pago acordada, el dia del mes
  alq_contrato VARCHAR(500), -- Link del archivo guardado del contrato
  alq_estado VARCHAR(1) NOT NULL, -- Estado del alquiler
  alq_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creacion del alquiler
  prop_id BIGINT, -- FK a propiedad
  rowid BIGINT NOT NULL DEFAULT unique_rowid(),
  CONSTRAINT ava_alquiler_ck01 CHECK (alq_estado IN ('A','F','C')),
  CONSTRAINT ava_alquiler_pk PRIMARY KEY (alq_id)
);

COMMENT ON TABLE AVA_ALQUILER IS 'Tabla de alquileres o contratos de una propiedad';

COMMENT ON COLUMN AVA_ALQUILER.alq_id IS 'Id del alquiler';
COMMENT ON COLUMN AVA_ALQUILER.alq_monto IS 'Monto de alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILER.alq_fechapago IS 'Fecha de pago acordada, el dia del mes';
COMMENT ON COLUMN AVA_ALQUILER.alq_contrato IS 'Link del archivo guardado del contrato';
COMMENT ON COLUMN AVA_ALQUILER.alq_estado IS 'Estado del alquiler(''A'':activo,''F'':finalizado,''C'':cancelado)';
COMMENT ON COLUMN AVA_ALQUILER.alq_fechacreacion IS 'Fecha de creacion del alquiler';
COMMENT ON COLUMN AVA_ALQUILER.rowid IS 'Row identifier para sincronización';

CREATE INDEX ava_alquiler_fk01 ON ava_alquiler (prop_id);

-- Table AVA_RESERVACION

CREATE TABLE AVA_RESERVACION (
  res_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id de la reservacion
  res_nombrecliente VARCHAR(50) NOT NULL, -- Nombre del cliente que hizo la reserva
  res_telefonocliente VARCHAR(15), -- Teléfono del cliente
  res_correocliente VARCHAR(50), -- Correo del cliente
  res_fechaentrada TIMESTAMP NOT NULL, -- Fecha y hora de entrada
  res_fechasalida TIMESTAMP NOT NULL, -- Fecha y hora de salida
  res_montototal BIGINT NOT NULL, -- Monto total de la reservación
  res_montoactual BIGINT NOT NULL, -- Monto actual pagado
  res_estado VARCHAR(1) NOT NULL, -- Estado de la reservación
  res_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
  prop_id BIGINT, -- Propiedad relacionada
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador interno
  CONSTRAINT ava_reservacion_ck01 CHECK (res_estado IN ('R','A','C','F')),
  CONSTRAINT ava_reservacion_pk PRIMARY KEY (res_id)
);

COMMENT ON TABLE AVA_RESERVACION IS 'Tabla de reservas realizadas a airbnb';

-- Column comments
COMMENT ON COLUMN AVA_RESERVACION.res_id IS 'Id de la reservacion';
COMMENT ON COLUMN AVA_RESERVACION.res_nombrecliente IS 'Nombre del cliente que hizo la reserva';
COMMENT ON COLUMN AVA_RESERVACION.res_telefonocliente IS 'Telefono del cliente que hizo la reserva';
COMMENT ON COLUMN AVA_RESERVACION.res_correocliente IS 'Correo del cliente que hizo la reserva';
COMMENT ON COLUMN AVA_RESERVACION.res_fechaentrada IS 'Fecha y hora de entrada';
COMMENT ON COLUMN AVA_RESERVACION.res_fechasalida IS 'Fecha y hora de salida';
COMMENT ON COLUMN AVA_RESERVACION.res_montototal IS 'Monto total de la reservación';
COMMENT ON COLUMN AVA_RESERVACION.res_montoactual IS 'Monto actual pagado de la reservación';
COMMENT ON COLUMN AVA_RESERVACION.res_estado IS 'Estado de la reservacion(''R'':reservada,''A'':activa,''C'':cancelada,''F'':finalizada)';
COMMENT ON COLUMN AVA_RESERVACION.res_fechacreacion IS 'Fecha de creacion de la reserva';
COMMENT ON COLUMN AVA_RESERVACION.rowid IS 'Identificador único interno para sincronización';

-- Índice y constraint de foreign key
CREATE INDEX ava_reservacion_fk01 ON ava_reservacion (prop_id);

-- Table AVA_CLIENTE

CREATE TABLE AVA_CLIENTE (
  cli_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del cliente
  cli_nombre VARCHAR(30) NOT NULL, -- Nombre del cliente
  cli_papellido VARCHAR(30) NOT NULL, -- Primer apellido del cliente
  cli_sapellido VARCHAR(30), -- Segundo apellido del cliente
  cli_cedula VARCHAR(15) NOT NULL, -- Cédula del cliente
  cli_telefono VARCHAR(15) NOT NULL, -- Teléfono del cliente
  cli_correo VARCHAR(50) NOT NULL, -- Correo electrónico del cliente
  cli_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
  cli_direccion VARCHAR(200), -- Dirección del cliente
  cli_estadocivil VARCHAR(20), -- Estado civil
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador interno
  CONSTRAINT ava_cliente_pk PRIMARY KEY (cli_id),
  CONSTRAINT ava_cliente_unq01 UNIQUE (cli_cedula),
  CONSTRAINT ava_cliente_unq02 UNIQUE (cli_correo)
);

COMMENT ON TABLE AVA_CLIENTE IS 'Tabla de clientes';

-- Column comments
COMMENT ON COLUMN AVA_CLIENTE.cli_id IS 'Id del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_nombre IS 'Nombre del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_papellido IS 'Primer apellido del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_sapellido IS 'Segundo apellido del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_cedula IS 'Cedula del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_telefono IS 'Telefono del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_correo IS 'Correo electronico del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_fechacreacion IS 'Fecha de creacion del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_direccion IS 'Dirección del cliente';
COMMENT ON COLUMN AVA_CLIENTE.cli_estadocivil IS 'Soltero, Casado, etc.';
COMMENT ON COLUMN AVA_CLIENTE.rowid IS 'Identificador único interno para sincronización';

-- Table AVA_ALQUILERMENSUAL

CREATE TABLE AVA_ALQUILERMENSUAL (
  alqm_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del alquiler mensual
  alqm_identificador VARCHAR(15) NOT NULL, -- Código identificador del alquiler mensual
  alqm_fechainicio TIMESTAMP NOT NULL, -- Fecha en la que inicia el alquiler mensual
  alqm_fechafin TIMESTAMP NOT NULL, -- Fecha en la que termina el alquiler mensual
  alqm_montototal BIGINT NOT NULL, -- Monto total a pagar del alquiler mensual
  alqm_montopagado BIGINT NOT NULL, -- Monto pagado actual del alquiler mensual
  alqm_fechapago TIMESTAMP, -- Fecha en que se pagó el alquiler mensual
  alqm_estado VARCHAR(1) NOT NULL, -- Estado del alquiler mensual
  alqm_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
  alq_id BIGINT, -- ID del contrato de alquiler
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador interno
  CONSTRAINT ava_alquilermensual_ck01 CHECK (alqm_estado IN ('A','P','I','R')),
  CONSTRAINT ava_alquilermensual_pk PRIMARY KEY (alqm_id)
);

COMMENT ON TABLE AVA_ALQUILERMENSUAL IS 'Tabla de los alquileres mensuales a pagar, de los alquileres';

-- Column comments
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_id IS 'Id del alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_identificador IS 'Codigo identificador del alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_fechainicio IS 'Fecha en la que inicia el alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_fechafin IS 'Fecha en la que termina el alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_montototal IS 'Monto total a pagar del alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_montopagado IS 'Monto pagado actual del alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_fechapago IS 'Fecha en que se pagó el alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_estado IS 'Estado del alquiler mensual(''A'':atrasado,''P'':pagado,''I'':incompleto,''R'':cortesía)';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.alqm_fechacreacion IS 'Fecha de creacion del alquiler mensual';
COMMENT ON COLUMN AVA_ALQUILERMENSUAL.rowid IS 'Identificador único interno para sincronización';

-- Table AVA_PAGO

CREATE TABLE AVA_PAGO (
  pag_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY
    (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del pago
  pag_monto BIGINT NOT NULL, -- Monto del pago realizado
  pag_descripcion VARCHAR(50), -- Alguna descripcion o comentario
  pag_cuenta VARCHAR(50), -- Cuenta donde se realizó el pago
  pag_estado VARCHAR(1) NOT NULL, -- Estado del pago(A:Activo, D:Anulado)
  pag_fechapago TIMESTAMP NOT NULL, -- Fecha en la que se realizó el pago
  pag_metodopago VARCHAR(30), -- Efectivo, Sinpe, Transferencia, etc.
  pag_banco VARCHAR(50), -- Banco emisor de la transferencia
  pag_referencia VARCHAR(100), -- Número de referencia del pago
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador interno
  res_id BIGINT,
  alqm_id BIGINT,
  depo_id BIGINT,
  CONSTRAINT ava_pago_ck01 CHECK (pag_estado IN ('A','D')),
  CONSTRAINT ava_pago_pk PRIMARY KEY (pag_id)
);

-- Comentarios

COMMENT ON TABLE AVA_PAGO IS 'Tabla de pagos realizados';
COMMENT ON COLUMN AVA_PAGO.pag_id IS 'Id del pago';
COMMENT ON COLUMN AVA_PAGO.pag_monto IS 'Monto del pago realizado';
COMMENT ON COLUMN AVA_PAGO.pag_descripcion IS 'Alguna descripcion o comentario';
COMMENT ON COLUMN AVA_PAGO.pag_cuenta IS 'Cuenta donde se realizó el pago';
COMMENT ON COLUMN AVA_PAGO.pag_estado IS 'Estado del pago(A:Activo, D:Anulado)';
COMMENT ON COLUMN AVA_PAGO.pag_fechapago IS 'Fecha en la que se realizó el pago';
COMMENT ON COLUMN AVA_PAGO.pag_metodopago IS 'Efectivo, Sinpe, Transferencia, etc.';
COMMENT ON COLUMN AVA_PAGO.pag_banco IS 'Banco emisor de la transferencia';
COMMENT ON COLUMN AVA_PAGO.pag_referencia IS 'Número de referencia del pago';
COMMENT ON COLUMN AVA_PAGO.rowid IS 'Identificador único interno para sincronización';


-- Table PARAMETROS

CREATE TABLE PARAMETROS (
  par_nombre VARCHAR(30), -- Nombre de la empresa
  par_logo VARCHAR(500), -- Link a un logo de la empresa
  par_correo VARCHAR(50), -- Correo electronico de la empresa
  par_descripcion VARCHAR(200), -- Alguna descipcion de la empresa
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador interno único
  CONSTRAINT parametros_pkey PRIMARY KEY (rowid)
);

-- Comentarios

COMMENT ON TABLE PARAMETROS IS 'Tabla de parametros de la empresa';
COMMENT ON COLUMN PARAMETROS.par_nombre IS 'Nombre de la empresa';
COMMENT ON COLUMN PARAMETROS.par_logo IS 'Link a un logo de la empresa';
COMMENT ON COLUMN PARAMETROS.par_correo IS 'Correo electronico de la empresa';
COMMENT ON COLUMN PARAMETROS.par_descripcion IS 'Alguna descipcion de la empresa';
COMMENT ON COLUMN PARAMETROS.rowid IS 'Identificador único interno para sincronización';

-- Table AVA_DEPOSITO

CREATE TABLE AVA_DEPOSITO (
  depo_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del deposito
  depo_montoactual BIGINT NOT NULL, -- Monto actual del deposito pago
  depo_total BIGINT NOT NULL, -- Monto total a pagar del deposito
  depo_montodevuelto BIGINT, -- Monto devuelto al cliente
  depo_montocastigo BIGINT, -- Monto castigado al cliente
  depo_descmontodevuelto VARCHAR(50), -- Motivo del monto devuelto
  depo_descrmontocastigo VARCHAR(50), -- Motivo del monto castigado
  depo_fechadevolucion TIMESTAMP, -- Fecha de la devoluciuon del deposito
  depo_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creacion del deposito
  alq_id BIGINT,
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT AVA_DEPOSITO_PK PRIMARY KEY (depo_id)
);

-- Comentarios

COMMENT ON TABLE AVA_DEPOSITO IS 'Tabla de deposito inicial de un alquiler';
COMMENT ON COLUMN AVA_DEPOSITO.depo_id IS 'Id del deposito';
COMMENT ON COLUMN AVA_DEPOSITO.depo_montoactual IS 'Monto actual del deposito pago';
COMMENT ON COLUMN AVA_DEPOSITO.depo_total IS 'Monto total a pagar del deposito';
COMMENT ON COLUMN AVA_DEPOSITO.depo_montodevuelto IS 'Monto devuelto al cliente';
COMMENT ON COLUMN AVA_DEPOSITO.depo_montocastigo IS 'Monto castigado al cliente';
COMMENT ON COLUMN AVA_DEPOSITO.depo_descmontodevuelto IS 'Motivo del monto devuelto';
COMMENT ON COLUMN AVA_DEPOSITO.depo_descrmontocastigo IS 'Motivo del monto castigado';
COMMENT ON COLUMN AVA_DEPOSITO.depo_fechadevolucion IS 'Fecha de la devoluciuon del deposito';
COMMENT ON COLUMN AVA_DEPOSITO.depo_fechacreacion IS 'Fecha de creacion del deposito';
COMMENT ON COLUMN AVA_DEPOSITO.rowid IS 'Identificador único interno para sincronización';

-- Índices

CREATE INDEX AVA_DEPOSITO_FK01 ON AVA_DEPOSITO (alq_id);

-- Table AVA_SERVICIO

CREATE TABLE AVA_SERVICIO (
  ser_id         BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del servicio
  ser_nombre     VARCHAR(30) NOT NULL, -- Nombre del servicio
  ser_servicio   VARCHAR(40), -- Tipo de servicio, luz, agua, internet, etc.
  ser_mediopago  VARCHAR(30), -- Medio común por el que se paga
  rowid          BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT AVA_SERVICIO_PK PRIMARY KEY (ser_id)
);

-- Comentarios

COMMENT ON TABLE AVA_SERVICIO IS 'Tabla de servicios que pagan x Propiedad';
COMMENT ON COLUMN AVA_SERVICIO.ser_id IS 'Id del servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_nombre IS 'Nombre del servicio';
COMMENT ON COLUMN AVA_SERVICIO.ser_servicio IS 'Tipo de servicio, luz, agua, internet, etc.';
COMMENT ON COLUMN AVA_SERVICIO.ser_mediopago IS 'Medio común por el que se paga';
COMMENT ON COLUMN AVA_SERVICIO.rowid IS 'Identificador único interno para sincronización';

-- Table AVA_PAGOSERVICIO

CREATE TABLE AVA_PAGOSERVICIO (
  pser_id           BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del pago de servicio
  pser_monto        BIGINT NOT NULL, -- Monto que se pagó por el servicio
  pser_fecha        TIMESTAMP NOT NULL, -- Fecha en la que se realizó el pago del servicio
  pser_descripcion  VARCHAR(50), -- Alguna descripción o comentario
  ser_id            BIGINT,
  prop_id           BIGINT,
  rowid             BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT AVA_PAGOSERVICIO_PK PRIMARY KEY (pser_id)
);

-- Comentarios

COMMENT ON TABLE AVA_PAGOSERVICIO IS 'Tabla que muestra los pagos de servicios';
COMMENT ON COLUMN AVA_PAGOSERVICIO.pser_id IS 'Id del pago de servicio';
COMMENT ON COLUMN AVA_PAGOSERVICIO.pser_monto IS 'Monto que se pagó por el servicio';
COMMENT ON COLUMN AVA_PAGOSERVICIO.pser_fecha IS 'Fecha en la que se realizó el pago del servicio';
COMMENT ON COLUMN AVA_PAGOSERVICIO.pser_descripcion IS 'Alguna descripción o comentario';
COMMENT ON COLUMN AVA_PAGOSERVICIO.ser_id IS 'Id del servicio asociado';
COMMENT ON COLUMN AVA_PAGOSERVICIO.prop_id IS 'Id de la propiedad asociada';
COMMENT ON COLUMN AVA_PAGOSERVICIO.rowid IS 'Identificador único interno para sincronización';

-- Índices

CREATE INDEX AVA_PAGOSERVICIO_FK01 ON AVA_PAGOSERVICIO (ser_id);
CREATE INDEX AVA_PAGOSERVICIO_FK02 ON AVA_PAGOSERVICIO (prop_id);

-- Table AVA_CLIENTEXALQUILER

CREATE TABLE AVA_CLIENTEXALQUILER (
  alq_id BIGINT NOT NULL, -- Id del alquiler
  cli_id BIGINT NOT NULL, -- Id del cliente
  rowid  BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT PK_AVA_CLIENTEXALQUILER PRIMARY KEY (alq_id, cli_id)
);

-- Comentarios

COMMENT ON TABLE AVA_CLIENTEXALQUILER IS 'Relación entre clientes y alquileres';
COMMENT ON COLUMN AVA_CLIENTEXALQUILER.alq_id IS 'Id del alquiler';
COMMENT ON COLUMN AVA_CLIENTEXALQUILER.cli_id IS 'Id del cliente';
COMMENT ON COLUMN AVA_CLIENTEXALQUILER.rowid IS 'Identificador único interno para sincronización';

-- Table AVA_PROPIEDAD

CREATE TABLE AVA_PROPIEDAD (
  prop_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id de la propiedad
  prop_identificador VARCHAR(15) NOT NULL, -- Identificador de la propiedad
  prop_descripcion VARCHAR(50), -- Descripcion de la propiedad
  edi_id BIGINT, -- Id del edificio al que pertenece
  tipp_id BIGINT, -- Id del tipo de propiedad
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT AVA_PROPIEDAD_PK PRIMARY KEY (prop_id)
);

-- Comentarios

COMMENT ON TABLE AVA_PROPIEDAD IS 'Propiedad de un edificio, osea un alquiler, departamento, airbnb etc...';
COMMENT ON COLUMN AVA_PROPIEDAD.prop_id IS 'Id de la propiedad';
COMMENT ON COLUMN AVA_PROPIEDAD.prop_identificador IS 'Identificador de la propiedad';
COMMENT ON COLUMN AVA_PROPIEDAD.prop_descripcion IS 'Descripcion de la propiedad';
COMMENT ON COLUMN AVA_PROPIEDAD.edi_id IS 'Id del edificio al que pertenece';
COMMENT ON COLUMN AVA_PROPIEDAD.tipp_id IS 'Id del tipo de propiedad';
COMMENT ON COLUMN AVA_PROPIEDAD.rowid IS 'Identificador único interno para sincronización';

-- Índices

CREATE INDEX AVA_PROPIEDAD_FK01 ON AVA_PROPIEDAD (tipp_id);
CREATE INDEX AVA_PROPIEDAD_FK02 ON AVA_PROPIEDAD (edi_id);

-- Table AVA_TIPOPROPIEDAD

CREATE TABLE AVA_TIPOPROPIEDAD (
  tipp_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del tipo de propiedad
  tipp_nombre VARCHAR(30) NOT NULL, -- El tipo de propiedad, airbnb, negocio, etc....
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT AVA_TIPOPROPIEDAD_PK PRIMARY KEY (tipp_id)
);

-- Comentarios

COMMENT ON TABLE AVA_TIPOPROPIEDAD IS 'Tabla de tipos de propiedad';
COMMENT ON COLUMN AVA_TIPOPROPIEDAD.tipp_id IS 'Id del tipo de propiedad';
COMMENT ON COLUMN AVA_TIPOPROPIEDAD.tipp_nombre IS 'El tipo de propiedad, airbnb, negocio, etc....';
COMMENT ON COLUMN AVA_TIPOPROPIEDAD.rowid IS 'Identificador único interno para sincronización';

-- Table AVA_ANULACIONPAGO

CREATE TABLE AVA_ANULACIONPAGO (
  anp_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id de la anulacion de pago
  anp_motivo VARCHAR(50) NOT NULL, -- Motivo por el cual se realiza la anulación
  anp_descripcion VARCHAR(50) NOT NULL, -- Descripción de que pago con el dinero anulado
  anp_montooriginal BIGINT NOT NULL, -- Monto original del campo afectado
  anp_montofinal BIGINT NOT NULL, -- Monto final del campo afectado
  anp_fechaanulacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha en la que se hizo la anulación
  pag_id BIGINT,
  usu_id BIGINT,
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT PK_AVA_ANULACIONPAGO PRIMARY KEY (anp_id)
);

-- Comentarios

COMMENT ON TABLE AVA_ANULACIONPAGO IS 'Tabla para registrar anulaciones de pagos realizadas';
COMMENT ON COLUMN AVA_ANULACIONPAGO.anp_id IS 'Id de la anulacion de pago';
COMMENT ON COLUMN AVA_ANULACIONPAGO.anp_motivo IS 'Motivo por el cual se realiza la anulación';
COMMENT ON COLUMN AVA_ANULACIONPAGO.anp_descripcion IS 'Descripción de que pago con el dinero anulado';
COMMENT ON COLUMN AVA_ANULACIONPAGO.anp_montooriginal IS 'Monto original del campo afectado';
COMMENT ON COLUMN AVA_ANULACIONPAGO.anp_montofinal IS 'Monto final del campo afectado';
COMMENT ON COLUMN AVA_ANULACIONPAGO.anp_fechaanulacion IS 'Fecha en la que se hizo la anulación';
COMMENT ON COLUMN AVA_ANULACIONPAGO.rowid IS 'Identificador único interno para sincronización';

-- Índices

CREATE INDEX AVA_ANULACIONPAGO_FK01 ON AVA_ANULACIONPAGO (pag_id);
CREATE INDEX AVA_ANULACIONPAGO_FK02 ON AVA_ANULACIONPAGO (usu_id);

-- Table AVA_ALQUILERCANCELADO

CREATE TABLE AVA_ALQUILERCANCELADO (
  alqc_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT BY 1 MINVALUE 0 NO MAXVALUE START WITH 1), -- Id del alquiler cancelado
  alqc_motivo VARCHAR(50) NOT NULL, -- Motivo por el que el cliente canceló el alquiler
  alqc_montodevuelto BIGINT, -- Monto devuelto de los alquileres (Opcional)
  alqc_castigo BIGINT, -- Monto castigado al cliente (Opcional)
  alqc_motivomontodevuelto VARCHAR(50), -- Motivo del monto devuelto
  alqc_motivocastigo VARCHAR(50), -- Motivo del monto castigado
  alqc_fecha_cancelacion TIMESTAMP NOT NULL, -- Fecha en la que se canceló el alquiler
  alqc_fechacreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación del registro
  alq_id BIGINT,
  rowid BIGINT NOT NULL DEFAULT unique_rowid(), -- Identificador único interno
  CONSTRAINT PK_AVA_ALQUILERCANCELADO PRIMARY KEY (alqc_id)
);

-- Comentarios

COMMENT ON TABLE AVA_ALQUILERCANCELADO IS 'Tabla de alquileres cancelados';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_id IS 'Id del alquiler cancelado';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_motivo IS 'Motivo por el que el cliente canceló el alquiler';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_montodevuelto IS 'Monto devuelto de los alquileres (Opcional)';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_castigo IS 'Monto castigado al cliente (Opcional)';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_motivomontodevuelto IS 'Motivo del monto devuelto';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_motivocastigo IS 'Motivo del monto castigado';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_fecha_cancelacion IS 'Fecha en la que se canceló el alquiler';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.alqc_fechacreacion IS 'Fecha de creación del registro';
COMMENT ON COLUMN AVA_ALQUILERCANCELADO.rowid IS 'Identificador único interno para sincronización';

-- Índices

CREATE INDEX AVA_ALQUILERCANCELADO_FK01 ON AVA_ALQUILERCANCELADO (alq_id);

-- Create foreign keys (relationships) section -------------------------------------------------

ALTER TABLE AVA_PROPIEDAD
  ADD CONSTRAINT AVA_TIPOPROPIEDAD_X_PROPIEDAD
    FOREIGN KEY (tipp_id)
    REFERENCES AVA_TIPOPROPIEDAD (tipp_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_PAGOSERVICIO
  ADD CONSTRAINT AVA_PROPIEDAD_X_AVA_PAGOSERVICIO
    FOREIGN KEY (prop_id)
    REFERENCES AVA_PROPIEDAD (prop_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_ALQUILER
  ADD CONSTRAINT AVA_PROPIEDAD_X_AVA_ALQUILER
    FOREIGN KEY (prop_id)
    REFERENCES AVA_PROPIEDAD (prop_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_RESERVACION
  ADD CONSTRAINT AVA_PROPIEDAD_X_AVA_RESERVACION
    FOREIGN KEY (prop_id)
    REFERENCES AVA_PROPIEDAD (prop_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_PROPIEDAD
  ADD CONSTRAINT AVA_EDIFICIO_X_AVA_PROPIEDAD
    FOREIGN KEY (edi_id)
    REFERENCES AVA_EDIFICIO (edi_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_CLIENTEXALQUILER
  ADD CONSTRAINT AVA_CLIENTE_X_AVA_CLIENTEXALQUILER
    FOREIGN KEY (cli_id)
    REFERENCES AVA_CLIENTE (cli_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_CLIENTEXALQUILER
  ADD CONSTRAINT AVA_ALQUILER_X_AVA_CLIENTEXALQUILER
    FOREIGN KEY (alq_id)
    REFERENCES AVA_ALQUILER (alq_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_PAGOSERVICIO
  ADD CONSTRAINT AVA_SERVICIO_X_AVA_PAGOSERVICIO
    FOREIGN KEY (ser_id)
    REFERENCES AVA_SERVICIO (ser_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_PAGO
  ADD CONSTRAINT AVA_DEPOSITO_X_AVA_PAGO
    FOREIGN KEY (depo_id)
    REFERENCES AVA_DEPOSITO (depo_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_DEPOSITO
  ADD CONSTRAINT AVA_ALQUILER_X_AVA_DEPOSITO
    FOREIGN KEY (alq_id)
    REFERENCES AVA_ALQUILER (alq_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_PAGO
  ADD CONSTRAINT AVA_ALQUILERMENSUAL_X_AVA_PAGO
    FOREIGN KEY (alqm_id)
    REFERENCES AVA_ALQUILERMENSUAL (alqm_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_PAGO
  ADD CONSTRAINT AVA_RESERVACION_X_AVA_PAGO
    FOREIGN KEY (res_id)
    REFERENCES AVA_RESERVACION (res_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_ALQUILERMENSUAL
  ADD CONSTRAINT AVA_ALQUILER_X_AVA_ALQUILERMENSUAL
    FOREIGN KEY (alq_id)
    REFERENCES AVA_ALQUILER (alq_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_ANULACIONPAGO
  ADD CONSTRAINT AVA_PAGO_X_AVA_ANULACIONPAGO
    FOREIGN KEY (pag_id)
    REFERENCES AVA_PAGO (pag_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_ANULACIONPAGO
  ADD CONSTRAINT AVA_USUARIO_X_AVA_ANULACIONPAGO
    FOREIGN KEY (usu_id)
    REFERENCES AVA_USUARIO (usu_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

ALTER TABLE AVA_ALQUILERCANCELADO
  ADD CONSTRAINT AVA_ALQUILER_X_AVA_ALQUILERCANCELADO
    FOREIGN KEY (alq_id)
    REFERENCES AVA_ALQUILER (alq_id)
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
;

