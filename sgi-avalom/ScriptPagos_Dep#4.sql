-- ============================================
-- 1) Inserta en ava_pago los registros de Depto #3
-- ============================================
WITH pagos_depto3 AS (
  SELECT * FROM (VALUES
    -- monto, descripcion,                                                                      cuenta,             banco,          metodopago,         fecha_ts,                         referencia, alqm_id
    ( 60000, 'Me entregó en efectivo y le hice SINPE a Gerald el 31/10/2023 y quedó saldo 10 mil', 'AHORRO A LA VISTA', 'Coopealianza', 'SINPE AH VISTA', TIMESTAMP '2023-10-31 03:00:00', NULL, 37),
    ( 80000, 'Me entregó en efectivo y le hice SINPE a Gerald el 02/11/2023: 70 mil alquiler y saldo 10 mil', 'AHORRO A LA VISTA', 'Coopealianza', 'SINPE AH VISTA', TIMESTAMP '2023-11-03 03:00:00', NULL, 38),
    ( 70000, 'Le entregó en efectivo a Francisco y Fran hizo SINPE el jueves',                     'AHORRO A LA VISTA', 'Coopealianza', 'SINPE AH VISTA', TIMESTAMP '2023-12-07 03:00:00', NULL, 39),
    ( 70000, 'DINERO ENTREGADO A INICIO DE MES, SINPE POR FERMIN AVILA CANCELANDO DEPTS 3 Y 4',    'AHORRO A LA VISTA', 'Coopealianza', 'SINPE AH VISTA', TIMESTAMP '2024-01-31 03:00:00', NULL, 40),
    ( 70000, 'PAGO ENTREGÓ INQUILINA A FRANCISCO Y FRAN DEPTO EN AHORRO VISTA',                  'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-02-05 03:00:00', NULL, 41),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-03-07 03:00:00', NULL, 42),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-04-08 03:00:00', NULL, 43),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-05-07 03:00:00', NULL, 44),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-06-05 03:00:00', NULL, 45),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-07-10 03:00:00', NULL, 46),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-08-08 03:00:00', NULL, 47),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-09-04 03:00:00', NULL, 48),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-10-01 03:00:00', NULL, 49),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-11-06 03:00:00', NULL, 50),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO***',                    'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2024-12-03 03:00:00', NULL, 51),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2025-01-07 03:00:00', NULL, 52),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO',                       'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2025-02-03 03:00:00', NULL, 53),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO REF 48061981',          'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2025-03-06 03:00:00', '48061981', 54),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO EFECTIVO REF 48171711',          'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2025-04-04 03:00:00', '48171711', 55),
    ( 70000, 'DEPOSITA FRANCISCO AVILA PRADO, INQUILINA LE DIO DINERO EFECTIVO REF 48297546',   'AHORRO A LA VISTA', 'Coopealianza', 'DEPTO AH VISTA',   TIMESTAMP '2025-05-08 03:00:00', '48297546', 56)
  ) AS t(
    monto,
    descr,
    cuenta,
    banco,
    medio,
    fecha_ts,
    ref,
    alqm_id
  )
)
INSERT INTO ava_pago (
  pag_monto,
  pag_descripcion,
  pag_cuenta,
  pag_banco,
  pag_metodopago,
  pag_estado,
  pag_fechapago,
  pag_referencia,
  alqm_id
)
SELECT
  monto,
  substring(descr  FROM 1 FOR 50),
  substring(cuenta FROM 1 FOR 50),
  substring(banco   FROM 1 FOR 50),
  substring(medio   FROM 1 FOR 30),
  'A'                AS pag_estado,
  fecha_ts          AS pag_fechapago,
  ref               AS pag_referencia,
  alqm_id
FROM pagos_depto3;


-- ============================================
-- 2) Actualiza los alquileres mensuales de Depto #3
-- ============================================
WITH pagos_depto3 AS (
  SELECT monto, fecha_ts, alqm_id FROM (VALUES
    ( 60000, TIMESTAMP '2023-10-31 03:00:00', 37),
    ( 80000, TIMESTAMP '2023-11-03 03:00:00', 38),
    ( 70000, TIMESTAMP '2023-12-07 03:00:00', 39),
    ( 70000, TIMESTAMP '2024-01-31 03:00:00', 40),
    ( 70000, TIMESTAMP '2024-02-05 03:00:00', 41),
    ( 70000, TIMESTAMP '2024-03-07 03:00:00', 42),
    ( 70000, TIMESTAMP '2024-04-08 03:00:00', 43),
    ( 70000, TIMESTAMP '2024-05-07 03:00:00', 44),
    ( 70000, TIMESTAMP '2024-06-05 03:00:00', 45),
    ( 70000, TIMESTAMP '2024-07-10 03:00:00', 46),
    ( 70000, TIMESTAMP '2024-08-08 03:00:00', 47),
    ( 70000, TIMESTAMP '2024-09-04 03:00:00', 48),
    ( 70000, TIMESTAMP '2024-10-01 03:00:00', 49),
    ( 70000, TIMESTAMP '2024-11-06 03:00:00', 50),
    ( 70000, TIMESTAMP '2024-12-03 03:00:00', 51),
    ( 70000, TIMESTAMP '2025-01-07 03:00:00', 52),
    ( 70000, TIMESTAMP '2025-02-03 03:00:00', 53),
    ( 70000, TIMESTAMP '2025-03-06 03:00:00', 54),
    ( 70000, TIMESTAMP '2025-04-04 03:00:00', 55),
    ( 70000, TIMESTAMP '2025-05-08 03:00:00', 56)
  ) AS t(monto, fecha_ts, alqm_id)
),
pagos_agg AS (
  SELECT
    alqm_id,
    SUM(monto)    AS total_pagado,
    MAX(fecha_ts) AS ultima_fecha
  FROM pagos_depto3
  GROUP BY alqm_id
)
UPDATE ava_alquilermensual a
SET
  alqm_montopagado = a.alqm_montopagado + p.total_pagado,
  alqm_estado     = CASE
                      WHEN a.alqm_montopagado + p.total_pagado >= a.alqm_montototal THEN 'P'
                      ELSE 'I'
                    END,
  alqm_fechapago  = p.ultima_fecha
FROM pagos_agg p
WHERE a.alqm_id = p.alqm_id;
