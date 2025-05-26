INSERT INTO AVA_USUARIO (
  usu_nombre, usu_papellido, usu_sapellido, usu_cedula,
  usu_correo, usu_contrasena, usu_telefono, usu_fechacreacion,
  usu_estado, usu_rol
) VALUES
('admin',    'admin',    'admin',     '1234567890',     'admin@gmail.com',    '$2a$10$qBH9iuCT0xKzRzi858h89.wX3oLWnwIo.gxBugY919Doks/wGUFvu', '555-0000', '2024-12-13 17:04:23.789', 'A', 'A'),
('Fermín',   'Avila',    'Mora',      '109700056',      'ferminhar@hotmail.com', '$2a$10$R9qOWv/dgAK0rorcws5A2.HTUhKVCQugZ4Aacv0ic0OZLFiwEmlg.', '85282051', '2024-12-13 17:04:23.789', 'A', 'E'),
('Anthony',  'Avila',    'Hernandez', '118470854',      'anthonyah131@gmail.com', '$2a$10$bmpwPwRiyqcy63YgsjpRMOX9YbwlKjoWnbQEtrR/MDW2HlG09zSiO', '555-5678', '2024-12-13 17:04:23.789', 'A', 'J'),
('Gerald',   'Avila',    'Mora',      '123456789',      'gerald@gmail.com',       '$2a$10$Boy5DyC0g.sdyVn7IEJDUOqvS3h50MElW350TXTJQhNeBpQT.C8mq', '2378462783', '2024-12-13 17:04:23.789', 'A', 'J'),
('Kevin',    'Fallas',   'Chavarría', '117640152',      'jdhkevin@gmail.com',     '$2a$10$yFr74zLa.DF/kWC.ruToAOvl/UasCAJqR16JYBMEtUjEz8DvQn58W', '86552095', '2025-04-09 20:00:24.468', 'A', 'J');

INSERT INTO AVA_TIPOPROPIEDAD (tipp_nombre)
VALUES ('airbnb'), ('departamento'), ('local');
