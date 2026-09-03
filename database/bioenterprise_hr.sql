-- ==============================================================================
-- BioEnterpriseHR (BioSync Enterprise) - Base de Datos MySQL
-- ==============================================================================
-- Motor: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- Codificación: UTF8mb4 (Soporte completo para tildes y caracteres en español)
-- Localización: Perú (Hora: America/Lima UTC-5, Moneda: Soles S/., Teléfonos: +51 9...)
-- Métodos de Marcado Soportados: Huella Biométrica, Tarjeta de Proximidad RFID, PIN
-- Descripción: Script DDL y DML estructurado 100% en español para la gestión
--              de colaboradores, terminales biométricos y control de asistencia.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `bioenterprise_hr`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bioenterprise_hr`;

-- Configuración de zona horaria oficial para Perú (UTC -05:00)
SET time_zone = '-05:00';
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABLA: sedes
-- Locaciones físicas y sedes de la empresa en territorio peruano
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sedes`;
CREATE TABLE `sedes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre de la sede (ej. Sede Principal San Borja)',
  `ciudad` VARCHAR(80) NOT NULL COMMENT 'Ciudad (ej. Lima, Arequipa, Trujillo)',
  `direccion` VARCHAR(255) NULL COMMENT 'Dirección física completa',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Sedes y oficinas de la empresa';

-- ------------------------------------------------------------------------------
-- 2. TABLA: departamentos
-- Áreas o departamentos organizacionales de la empresa
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `departamentos`;
CREATE TABLE `departamentos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ej: Tecnología, Operaciones, Recursos Humanos, Ventas, Soporte IT',
  `descripcion` VARCHAR(255) NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Departamentos y áreas funcionales';

-- ------------------------------------------------------------------------------
-- 3. TABLA: empleados
-- Ficha principal de colaboradores, documentos (DNI/CE), teléfonos y modalidades de marcado
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `empleados`;
CREATE TABLE `empleados` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT 'Código o identificador único (ej. emp-1 o UUID)',
  `tipo_documento` ENUM('DNI', 'CE', 'Pasaporte') NOT NULL DEFAULT 'DNI' COMMENT 'Tipo de documento de identidad peruano',
  `numero_documento` VARCHAR(15) NOT NULL UNIQUE COMMENT 'Número de DNI (8 dígitos) o Carnet de Extranjería',
  `pin` VARCHAR(20) NOT NULL UNIQUE COMMENT 'PIN numérico para teclado de reloj marcador (ej. 9042)',
  `numero_tarjeta` VARCHAR(30) NULL UNIQUE COMMENT 'Código o número de tarjeta de proximidad RFID/Mifare (ej. 0014285912)',
  `tarjeta_rfid` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Posee tarjeta de proximidad activa, 0 = Sin tarjeta',
  `biometria_huella` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Posee huella enrolada, 0 = Sin huella',
  `biometria_rostro` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Posee rostro 3D enrolado, 0 = Sin rostro',
  `tipo_marcado_predilecto` ENUM('Huella', 'Tarjeta RFID', 'PIN', 'Rostro') NOT NULL DEFAULT 'Huella' COMMENT 'Modalidad habitual preferida',
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `nombre_completo` VARCHAR(200) NOT NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE COMMENT 'Correo corporativo del colaborador',
  `telefono` VARCHAR(30) NULL COMMENT 'Teléfono móvil en formato Perú (+51 9XX XXX XXX)',
  `cargo` VARCHAR(100) NOT NULL COMMENT 'Rol o puesto laboral (ej. Especialista TI)',
  `departamento_id` INT UNSIGNED NOT NULL,
  `sede_id` INT UNSIGNED NOT NULL,
  `estado` ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  `foto_url` TEXT NULL COMMENT 'Fotografía de perfil del empleado',
  `conteo_huellas` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Cantidad de huellas dactilares enroladas',
  `fecha_actualizacion_rostro` VARCHAR(50) NULL COMMENT 'Fecha o descripción de la última captura facial',
  `fecha_ingreso` DATE NULL COMMENT 'Fecha de contratación o inicio de labores',
  `fecha_cese` DATE NULL COMMENT 'Fecha de finalización de contrato o baja',
  `sueldo_base` DECIMAL(10,2) NOT NULL DEFAULT 1025.00 COMMENT 'Remuneración mensual en Soles (PEN)',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_emp_departamento` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_emp_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON UPDATE CASCADE,
  INDEX `idx_emp_pin` (`pin`),
  INDEX `idx_emp_tarjeta` (`numero_tarjeta`),
  INDEX `idx_emp_documento` (`numero_documento`),
  INDEX `idx_emp_estado` (`estado`)
) ENGINE=InnoDB COMMENT='Maestro de colaboradores, credenciales (Huella, Tarjeta, PIN) y biometría';

-- ------------------------------------------------------------------------------
-- 4. TABLA: permisos_acceso_puertas
-- Niveles de acceso y apertura de puertas por colaborador
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `permisos_acceso_puertas`;
CREATE TABLE `permisos_acceso_puertas` (
  `empleado_id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `entrada_principal` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Puerta principal / Torniquetes de acceso',
  `centro_datos` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Data Center / Sala de servidores',
  `almacen` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Almacenes y depósitos restringidos',
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_puertas_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Permisos de acceso físico a zonas y puertas';

-- ------------------------------------------------------------------------------
-- 5. TABLA: usuarios
-- Cuentas para inicio de sesión en el sistema (Administrador o Autoservicio)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `empleado_id` VARCHAR(36) NULL COMMENT 'Vinculado a un empleado si accede a su autoservicio',
  `nombre` VARCHAR(150) NOT NULL,
  `correo` VARCHAR(150) NOT NULL UNIQUE,
  `clave_hash` VARCHAR(255) NOT NULL COMMENT 'Contraseña cifrada (Bcrypt/Argon2)',
  `rol` ENUM('admin', 'empleado', 'gerente_rrhh', 'supervisor') NOT NULL DEFAULT 'empleado',
  `estado` ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  `token_recordar` VARCHAR(100) NULL,
  `ultimo_login` DATETIME NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_usuario_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Cuentas de usuarios y roles del sistema';

-- ------------------------------------------------------------------------------
-- 6. TABLA: dispositivos
-- Relojes marcadores y terminales biométricos conectados
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `dispositivos`;
CREATE TABLE `dispositivos` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT 'Identificador del reloj (ej. dev-1)',
  `numero_serie` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de serie de fábrica del hardware',
  `nombre` VARCHAR(120) NOT NULL COMMENT 'Nombre descriptivo del punto de marcación',
  `ubicacion` VARCHAR(120) NOT NULL COMMENT 'Ubicación física (ej. Entrada Principal Lima HQ)',
  `sede_id` INT UNSIGNED NULL COMMENT 'Sede en la que se encuentra instalado',
  `direccion_ip` VARCHAR(45) NOT NULL COMMENT 'Dirección IP de red local del terminal',
  `puerto` INT UNSIGNED NOT NULL DEFAULT 4370 COMMENT 'Puerto de comunicación (ZKTeco 4370)',
  `protocolo` ENUM('ADMS', 'Autónomo', 'Push SDK') NOT NULL DEFAULT 'ADMS',
  `soporta_huella` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Lector óptico/capacitivo de huella',
  `soporta_tarjeta_rfid` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Lector de tarjetas Mifare/EM 125kHz',
  `soporta_pin` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Teclado táctil o numérico físico',
  `estado` ENUM('online', 'offline', 'error') NOT NULL DEFAULT 'online',
  `ultimo_pulso` DATETIME NULL COMMENT 'Momento del último ping o latido recibido (hora Perú)',
  `conteo_usuarios` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Plantillas y tarjetas cargadas en memoria',
  `conteo_registros` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total de marcaciones en memoria del reloj',
  `version_firmware` VARCHAR(80) NOT NULL DEFAULT 'BioFirm v4.2.0',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_dispositivo_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_disp_serie` (`numero_serie`),
  INDEX `idx_disp_estado` (`estado`)
) ENGINE=InnoDB COMMENT='Terminales y relojes marcadores biométricos';

-- ------------------------------------------------------------------------------
-- 7. TABLA: marcaciones_asistencia
-- Registro de entradas, salidas y eventos biométricos en tiempo real
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `marcaciones_asistencia`;
CREATE TABLE `marcaciones_asistencia` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'ID único de la marcación (log-1 o correlativo)',
  `fecha` DATE NOT NULL COMMENT 'Fecha de la marcación (YYYY-MM-DD)',
  `hora` TIME NOT NULL COMMENT 'Hora de la marcación en Perú (HH:MM:SS)',
  `fecha_hora` DATETIME NOT NULL COMMENT 'Timestamp consolidado (America/Lima)',
  `empleado_id` VARCHAR(36) NULL COMMENT 'Empleado asociado (NULL si no fue identificado)',
  `nombre_empleado` VARCHAR(200) NOT NULL DEFAULT 'Desconocido',
  `pin` VARCHAR(20) NOT NULL DEFAULT '----' COMMENT 'PIN enviado por el lector o ingresado en teclado',
  `numero_tarjeta` VARCHAR(30) NULL COMMENT 'Número de tarjeta RFID (si la marcación fue con tarjeta)',
  `dispositivo_id` VARCHAR(36) NULL COMMENT 'Reloj donde se originó el fichaje',
  `nombre_dispositivo` VARCHAR(120) NOT NULL,
  `tipo` ENUM('Entrada', 'Salida', 'Refrigerio Inicio', 'Refrigerio Fin') NOT NULL DEFAULT 'Entrada',
  `estado` ENUM('Escaneo exitoso', 'Tiempo de espera agotado', 'Sincronización', 'No reconocido') NOT NULL DEFAULT 'Escaneo exitoso',
  `metodo_verificacion` ENUM('Huella', 'Tarjeta RFID', 'PIN', 'Rostro', 'Sistema') NOT NULL DEFAULT 'Huella' COMMENT 'Modalidad con la que se fichó la marcación',
  `es_error` TINYINT(1) NOT NULL DEFAULT 0,
  `trama_cruda` TEXT NULL COMMENT 'Trama sin procesar del protocolo biométrico',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_marcacion_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_marcacion_dispositivo` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_marc_fechahora` (`fecha_hora`),
  INDEX `idx_marc_fecha` (`fecha`),
  INDEX `idx_marc_empleado` (`empleado_id`),
  INDEX `idx_marc_pin` (`pin`),
  INDEX `idx_marc_tarjeta` (`numero_tarjeta`),
  INDEX `idx_marc_metodo` (`metodo_verificacion`)
) ENGINE=InnoDB COMMENT='Marcaciones y registros de asistencia con método de verificación';

-- ------------------------------------------------------------------------------
-- 8. TABLA: solicitudes_permisos
-- Solicitudes de vacaciones, descansos médicos y permisos laborales
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `solicitudes_permisos`;
CREATE TABLE `solicitudes_permisos` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT 'req-1 o UUID',
  `empleado_id` VARCHAR(36) NULL,
  `nombre_empleado` VARCHAR(200) NOT NULL,
  `tipo` ENUM('Vacaciones', 'Descanso Médico', 'Permiso', 'Compensación') NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NOT NULL,
  `motivo` TEXT NOT NULL,
  `nombre_documento` VARCHAR(255) NULL COMMENT 'Nombre del certificado o sustento adjunto',
  `ruta_documento` VARCHAR(255) NULL,
  `estado` ENUM('Aprobado', 'Pendiente', 'Rechazado') NOT NULL DEFAULT 'Pendiente',
  `revisado_por` INT UNSIGNED NULL COMMENT 'Usuario administrador que atendió la solicitud',
  `notas_revision` TEXT NULL,
  `fecha_solicitud` DATE NOT NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_solicitud_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_solicitud_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_sol_estado` (`estado`),
  INDEX `idx_sol_fechas` (`fecha_inicio`, `fecha_fin`)
) ENGINE=InnoDB COMMENT='Solicitudes de permisos y vacaciones del personal';

-- ------------------------------------------------------------------------------
-- 9. TABLA: dias_festivos
-- Calendario de feriados nacionales oficiales de Perú
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `dias_festivos`;
CREATE TABLE `dias_festivos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL COMMENT 'Nombre del feriado oficial de Perú',
  `fecha_festivo` DATE NOT NULL UNIQUE,
  `es_recurrente` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Se repite anualmente',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Calendario de feriados no laborables de Perú';

-- ------------------------------------------------------------------------------
-- 10. TABLA: historial_desactivaciones
-- Auditoría de ceses/bajas laborales y revocación de credenciales biométricas
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `historial_desactivaciones`;
CREATE TABLE `historial_desactivaciones` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `empleado_id` VARCHAR(36) NOT NULL,
  `accion` ENUM('BAJA', 'REACTIVACION') NOT NULL,
  `motivo` VARCHAR(255) NULL,
  `realizado_por` INT UNSIGNED NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_historial_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_usuario` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB COMMENT='Auditoría de bajas y reactivaciones de personal';

-- ------------------------------------------------------------------------------
-- 11. TABLA: comandos_dispositivos
-- Cola de comandos remotos hacia terminales biométricos (ADMS / Push SDK)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `comandos_dispositivos`;
CREATE TABLE `comandos_dispositivos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `dispositivo_id` VARCHAR(36) NOT NULL,
  `tipo_comando` ENUM('ENVIAR_USUARIO', 'ENVIAR_TARJETA', 'ELIMINAR_USUARIO', 'REINICIAR', 'SINCRONIZAR_HORA', 'LIMPIAR_LOGS') NOT NULL,
  `carga_util` TEXT NULL COMMENT 'Parámetros o trama ADMS enviada al reloj',
  `estado` ENUM('Pendiente', 'Transmitido', 'Ejecutado', 'Error') NOT NULL DEFAULT 'Pendiente',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ejecutado_en` DATETIME NULL,
  CONSTRAINT `fk_comando_dispositivo` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_cmd_estado` (`estado`)
) ENGINE=InnoDB COMMENT='Cola de sincronización y comandos a relojes biométricos';

-- ------------------------------------------------------------------------------
-- 13. HORARIOS DE TRABAJO (TIMETABLES)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `horarios`;
CREATE TABLE `horarios` (
  `id` VARCHAR(30) PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo del horario',
  `hora_entrada` TIME NOT NULL,
  `hora_salida` TIME NOT NULL,
  `minutos_tolerancia` INT NOT NULL DEFAULT 10 COMMENT 'Minutos de gracia para ingreso',
  `inicio_refrigerio` TIME NULL,
  `fin_refrigerio` TIME NULL,
  `minutos_refrigerio` INT NOT NULL DEFAULT 60 COMMENT 'Duración refrigerio en minutos',
  `marcado_refrigerio_obligatorio` TINYINT(1) NOT NULL DEFAULT 0,
  `color_tag` VARCHAR(20) DEFAULT '#3B82F6',
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Configuración de horarios de trabajo';

-- ------------------------------------------------------------------------------
-- 14. TURNOS (SHIFTS)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `turnos`;
CREATE TABLE `turnos` (
  `id` VARCHAR(30) PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo` ENUM('Fijo', 'Rotativo', 'Flexible') NOT NULL DEFAULT 'Fijo',
  `descripcion` VARCHAR(255) NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Agrupación y definición de turnos';

-- ------------------------------------------------------------------------------
-- 15. DETALLE DE TURNOS POR DÍA DE LA SEMANA
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `turnos_dias`;
CREATE TABLE `turnos_dias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `turno_id` VARCHAR(30) NOT NULL,
  `dia_semana` TINYINT NOT NULL COMMENT '1=Lunes, 2=Martes... 7=Domingo',
  `nombre_dia` VARCHAR(20) NOT NULL,
  `horario_id` VARCHAR(30) NULL COMMENT 'NULL si es día de descanso',
  `es_laborable` TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT `fk_turno_dia_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_turno_dia_horario` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Asignación de horarios a cada día del turno';

-- ------------------------------------------------------------------------------
-- 16. ASIGNACIÓN DE TURNOS A COLABORADORES
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `asignaciones_turnos`;
CREATE TABLE `asignaciones_turnos` (
  `id` VARCHAR(30) PRIMARY KEY,
  `empleado_id` VARCHAR(30) NOT NULL,
  `turno_id` VARCHAR(30) NOT NULL,
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NULL,
  `creado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_asig_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_asig_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Turnos asignados al personal';

-- ------------------------------------------------------------------------------
-- 17. POLÍTICAS Y REGLAS LABORALES DE ASISTENCIA (PERÚ)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reglas_asistencia_empresa`;
CREATE TABLE `reglas_asistencia_empresa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `minutos_gracia_ingreso` INT NOT NULL DEFAULT 10,
  `tolerancia_maxima_minutos` INT NOT NULL DEFAULT 45,
  `sobretasa_he_primeras_dos` DECIMAL(5,2) NOT NULL DEFAULT 25.00 COMMENT 'Ley 854 Perú: 25% primeras 2 horas extras',
  `sobretasa_he_restantes` DECIMAL(5,2) NOT NULL DEFAULT 35.00 COMMENT 'Ley 854 Perú: 35% de la 3ra hora en adelante',
  `sobretasa_feriado_domingo` DECIMAL(5,2) NOT NULL DEFAULT 100.00 COMMENT '100% sobretasa feriado o descanso trabajado',
  `dias_vacaciones_anuales` INT NOT NULL DEFAULT 30 COMMENT 'D.L. 728: 30 días calendario anuales',
  `minimo_dias_bloque_vacaciones` INT NOT NULL DEFAULT 7 COMMENT 'D. Leg. 1405: mínimo 7 o 15 días continuos',
  `minimo_dias_fraccionados` INT NOT NULL DEFAULT 1,
  `inicio_jornada_nocturna` TIME NOT NULL DEFAULT '22:00:00',
  `fin_jornada_nocturna` TIME NOT NULL DEFAULT '06:00:00',
  `sobretasa_nocturna` DECIMAL(5,2) NOT NULL DEFAULT 35.00 COMMENT 'Sobretasa legal del 35% sobre RMV',
  `remuneracion_minima_vital` DECIMAL(10,2) NOT NULL DEFAULT 1130.00 COMMENT 'RMV Perú 2026: S/ 1,130.00',
  `piso_minimo_nocturno` DECIMAL(10,2) NOT NULL DEFAULT 1525.50 COMMENT 'Piso legal nocturno: RMV (1,130) + 35% (395.50) = S/ 1,525.50',
  `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Reglas de asistencia y cálculo laboral Perú';

-- ------------------------------------------------------------------------------
-- 12. VISTAS SQL ÚTILES PARA REPORTES Y DASHBOARD
-- ------------------------------------------------------------------------------

-- Vista de personal con sede, departamento, modalidades de marcado y permisos
CREATE OR REPLACE VIEW `v_directorio_empleados` AS
SELECT 
  e.id,
  e.tipo_documento,
  e.numero_documento,
  e.pin,
  e.numero_tarjeta,
  e.tarjeta_rfid,
  e.biometria_huella,
  e.biometria_rostro,
  e.tipo_marcado_predilecto,
  e.nombre_completo,
  e.correo,
  e.telefono,
  e.cargo,
  d.nombre AS departamento_nombre,
  s.nombre AS sede_nombre,
  s.ciudad AS sede_ciudad,
  e.estado,
  e.sueldo_base,
  CONCAT('S/ ', FORMAT(e.sueldo_base, 2)) AS sueldo_formateado,
  e.foto_url,
  e.conteo_huellas,
  e.fecha_actualizacion_rostro,
  DATE_FORMAT(e.fecha_ingreso, '%d/%m/%Y') AS fecha_ingreso_formato,
  COALESCE(p.entrada_principal, 0) AS acceso_entrada_principal,
  COALESCE(p.centro_datos, 0) AS acceso_centro_datos,
  COALESCE(p.almacen, 0) AS acceso_almacen
FROM `empleados` e
LEFT JOIN `departamentos` d ON e.departamento_id = d.id
LEFT JOIN `sedes` s ON e.sede_id = s.id
LEFT JOIN `permisos_acceso_puertas` p ON e.id = p.empleado_id;

-- Vista detallada de marcaciones de asistencia
CREATE OR REPLACE VIEW `v_marcaciones_detalladas` AS
SELECT 
  m.id,
  DATE_FORMAT(m.fecha, '%d/%m/%Y') AS fecha_formato,
  m.hora,
  m.fecha_hora,
  m.empleado_id,
  COALESCE(e.nombre_completo, m.nombre_empleado) AS nombre_empleado,
  COALESCE(e.numero_documento, '----') AS numero_documento,
  m.pin,
  COALESCE(m.numero_tarjeta, e.numero_tarjeta, '----') AS numero_tarjeta,
  m.dispositivo_id,
  COALESCE(d.nombre, m.nombre_dispositivo) AS nombre_dispositivo,
  m.tipo AS tipo_marcacion,
  m.estado AS estado_marcacion,
  m.metodo_verificacion,
  m.es_error
FROM `marcaciones_asistencia` m
LEFT JOIN `empleados` e ON m.empleado_id = e.id
LEFT JOIN `dispositivos` d ON m.dispositivo_id = d.id;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- DATOS SEMILLA (SEED DATA) - Con Huella, Tarjeta de Proximidad RFID y PIN
-- ==============================================================================

-- 1. Sedes en Perú
INSERT INTO `sedes` (`id`, `nombre`, `ciudad`, `direccion`) VALUES
(1, 'Sede Principal San Borja', 'Lima', 'Av. Javier Prado Este 2465, San Borja, Lima'),
(2, 'Sede Norte Los Olivos', 'Lima', 'Av. Alfredo Mendiola 3698, Los Olivos, Lima'),
(3, 'Sede Sur Arequipa', 'Arequipa', 'Calle Mercaderes 412, Arequipa'),
(4, 'Planta Industrial Trujillo', 'Trujillo', 'Parque Industrial Mz. B Lote 4, Trujillo');

-- 2. Departamentos
INSERT INTO `departamentos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Tecnología', 'Desarrollo de Software, Infraestructura e Innovación'),
(2, 'Operaciones', 'Logística, Cadena de Suministro y Procesos Operativos'),
(3, 'Recursos Humanos', 'Gestión del Talento Humano, Nómina y Bienestar'),
(4, 'Ventas', 'Desarrollo Comercial y Relación con Clientes'),
(5, 'Soporte IT', 'Mesa de Ayuda, Redes y Soporte a Usuarios');

-- 3. Dispositivos Biométricos (con soporte de Huella, Tarjeta RFID y Teclado PIN)
INSERT INTO `dispositivos` (`id`, `numero_serie`, `nombre`, `ubicacion`, `sede_id`, `direccion_ip`, `puerto`, `protocolo`, `soporta_huella`, `soporta_tarjeta_rfid`, `soporta_pin`, `estado`, `ultimo_pulso`, `conteo_usuarios`, `conteo_registros`, `version_firmware`) VALUES
('dev-1', 'TFT12345678', 'Entrada Principal San Borja', 'San Borja HQ, Lima', 1, '192.168.1.105', 4370, 'ADMS', 1, 1, 1, 'online', NOW() - INTERVAL 2 MINUTE, 142, 12500, 'BioFirm v4.2.1'),
('dev-2', 'ZKT98765432', 'Torniquetes Sede Norte', 'Los Olivos, Lima', 2, '10.0.5.22', 4370, 'Autónomo', 1, 1, 1, 'offline', NOW() - INTERVAL 4 HOUR, 88, 8430, 'BioFirm v3.8.0'),
('dev-3', 'SUP55566677', 'Almacén Central Trujillo', 'Trujillo', 4, '172.16.0.45', 4370, 'ADMS', 1, 1, 1, 'error', NOW() - INTERVAL 1 MINUTE, 65, 5200, 'BioFirm v4.1.0'),
('dev-4', 'TFT99887766', 'Data Center Seguro San Borja', 'San Borja HQ, Lima', 1, '192.168.1.110', 4370, 'Push SDK', 1, 1, 1, 'online', NOW() - INTERVAL 30 SECOND, 28, 3900, 'BioFirm v4.3.0'),
('dev-5', 'ZKT11223344', 'Entrada Secundaria San Borja', 'San Borja HQ, Lima', 1, '192.168.1.108', 4370, 'ADMS', 1, 1, 1, 'online', NOW() - INTERVAL 3 MINUTE, 130, 9800, 'BioFirm v4.2.0'),
('dev-6', 'BIO44556677', 'Planta Industrial Norte', 'Trujillo', 4, '10.20.1.15', 4370, 'ADMS', 1, 1, 1, 'online', NOW() - INTERVAL 5 MINUTE, 95, 7100, 'BioFirm v4.0.5');

-- 4. Empleados con DNI, Huellas, Tarjetas RFID y PINs
INSERT INTO `empleados` (`id`, `tipo_documento`, `numero_documento`, `pin`, `numero_tarjeta`, `tarjeta_rfid`, `biometria_huella`, `biometria_rostro`, `tipo_marcado_predilecto`, `nombres`, `apellidos`, `nombre_completo`, `correo`, `telefono`, `cargo`, `departamento_id`, `sede_id`, `estado`, `foto_url`, `conteo_huellas`, `fecha_actualizacion_rostro`, `fecha_ingreso`, `sueldo_base`) VALUES
('emp-1', 'DNI', '46892341', '9042', '0014285912', 1, 1, 1, 'Huella', 'Valeria', 'Torres', 'Valeria Torres', 'vtorres@empresa.com', '+51 987 654 321', 'Especialista TI', 1, 1, 'Activo', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 2, 'Actualizado hoy', '2021-03-15', 4500.00),
('emp-2', 'DNI', '42187654', '4128', '0008451923', 1, 0, 0, 'Tarjeta RFID', 'Carlos', 'Mendoza', 'Carlos Mendoza', 'cmendoza@empresa.com', '+51 912 345 678', 'Coordinador de Operaciones', 2, 2, 'Activo', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 0, 'Pendiente', '2020-08-10', 3800.00),
('emp-3', 'DNI', '47851239', '1105', NULL, 0, 0, 0, 'PIN', 'Luis', 'Ramirez', 'Luis Ramirez', 'lramirez@empresa.com', '+51 945 678 123', 'Ejecutivo Comercial', 4, 3, 'Inactivo', '', 0, 'Sin registro', '2022-02-01', 2800.00),
('emp-4', 'DNI', '45981267', '1042', '0003198421', 1, 1, 1, 'Huella', 'Ana', 'García', 'Ana García', 'agarcia@empresa.com', '+51 963 852 741', 'Ingeniera de Software', 1, 1, 'Activo', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 2, 'Ayer', '2019-05-05', 5200.00),
('emp-5', 'DNI', '43789012', '0891', NULL, 0, 0, 0, 'PIN', 'Miguel', 'Paredes', 'Miguel Paredes', 'mparedes@empresa.com', '+51 974 123 456', 'Analista de RRHH', 3, 1, 'Activo', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 0, 'Hace 3 días', '2021-11-12', 3200.00);

-- 5. Permisos de Acceso a Puertas
INSERT INTO `permisos_acceso_puertas` (`empleado_id`, `entrada_principal`, `centro_datos`, `almacen`) VALUES
('emp-1', 1, 1, 0),
('emp-2', 1, 0, 1),
('emp-3', 0, 0, 0),
('emp-4', 1, 1, 0),
('emp-5', 1, 0, 0);

-- 6. Usuarios del Sistema
INSERT INTO `usuarios` (`id`, `empleado_id`, `nombre`, `correo`, `clave_hash`, `rol`, `estado`) VALUES
(1, NULL, 'Administrador del Sistema', 'admin@enterprise.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Activo'),
(2, 'emp-1', 'Valeria Torres', 'vtorres@empresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empleado', 'Activo'),
(3, 'emp-5', 'Miguel Paredes', 'mparedes@empresa.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'gerente_rrhh', 'Activo');

-- 7. Marcaciones de Asistencia con Huella, Tarjeta RFID y PIN
INSERT INTO `marcaciones_asistencia` (`id`, `fecha`, `hora`, `fecha_hora`, `empleado_id`, `nombre_empleado`, `pin`, `numero_tarjeta`, `dispositivo_id`, `nombre_dispositivo`, `tipo`, `estado`, `metodo_verificacion`, `es_error`) VALUES
('log-1', '2026-08-26', '08:42:15', '2026-08-26 08:42:15', 'emp-4', 'Ana García', '1042', NULL, 'dev-1', 'Entrada Principal San Borja', 'Entrada', 'Escaneo exitoso', 'Huella', 0),
('log-2', '2026-08-26', '08:41:03', '2026-08-26 08:41:03', NULL, 'Desconocido', '----', '0099887766', 'dev-3', 'Almacén Central Trujillo', 'Entrada', 'Tiempo de espera agotado', 'Tarjeta RFID', 1),
('log-3', '2026-08-26', '08:39:55', '2026-08-26 08:39:55', 'emp-5', 'Miguel Paredes', '0891', NULL, 'dev-5', 'Entrada Secundaria San Borja', 'Entrada', 'Escaneo exitoso', 'PIN', 0),
('log-4', '2026-08-26', '08:30:00', '2026-08-26 08:30:00', NULL, 'Sistema BioSync Perú', '0000', NULL, 'dev-1', 'Todos los Dispositivos', 'Entrada', 'Sincronización', 'Sistema', 0),
('log-5', '2026-08-26', '08:28:12', '2026-08-26 08:28:12', 'emp-3', 'Luis Ramirez (Cesado)', '1105', NULL, 'dev-1', 'Entrada Principal San Borja', 'Entrada', 'Escaneo exitoso', 'PIN', 0),
('log-6', '2026-08-26', '08:14:22', '2026-08-26 08:14:22', 'emp-2', 'Carlos Mendoza', '4128', '0008451923', 'dev-1', 'Torniquetes Sede Norte', 'Entrada', 'Escaneo exitoso', 'Tarjeta RFID', 0),
('log-7', '2026-08-26', '08:12:05', '2026-08-26 08:12:05', 'emp-4', 'Ana García', '1042', '0003198421', 'dev-2', 'Torniquetes Sede Norte', 'Entrada', 'Escaneo exitoso', 'Tarjeta RFID', 0),
('log-8', '2026-08-26', '08:05:59', '2026-08-26 08:05:59', 'emp-5', 'Miguel Paredes', '0891', NULL, 'dev-1', 'Entrada Principal San Borja', 'Entrada', 'Escaneo exitoso', 'PIN', 0),
('log-9', '2026-08-26', '08:01:30', '2026-08-26 08:01:30', 'emp-1', 'Valeria Torres', '9042', NULL, 'dev-4', 'Data Center Seguro San Borja', 'Entrada', 'Escaneo exitoso', 'Huella', 0);

-- 8. Solicitudes de Permisos / Vacaciones
INSERT INTO `solicitudes_permisos` (`id`, `empleado_id`, `nombre_empleado`, `tipo`, `fecha_inicio`, `fecha_fin`, `motivo`, `nombre_documento`, `estado`, `fecha_solicitud`) VALUES
('req-1', 'emp-1', 'Valeria Torres', 'Vacaciones', '2026-11-10', '2026-11-15', 'Vacaciones anuales reglamentarias programadas.', 'solicitud_vacaciones_nov.pdf', 'Aprobado', '2026-08-18'),
('req-2', 'emp-1', 'Valeria Torres', 'Descanso Médico', '2026-10-05', '2026-10-05', 'Consulta médica odontológica y descanso prescrito.', 'certificado_medico_essalud.pdf', 'Pendiente', '2026-08-06'),
('req-3', 'emp-1', 'Valeria Torres', 'Permiso', '2026-09-12', '2026-09-12', 'Trámite notarial personal urgente en Lima.', 'sustento_notaria.jpg', 'Rechazado', '2026-08-10');

-- 9. Feriados Oficiales de Perú (Calendario 2026)
INSERT INTO `dias_festivos` (`id`, `nombre`, `fecha_festivo`, `es_recurrente`) VALUES
(1, 'Año Nuevo', '2026-01-01', 1),
(2, 'Jueves Santo', '2026-04-02', 0),
(3, 'Viernes Santo', '2026-04-03', 0),
(4, 'Día del Trabajo', '2026-05-01', 1),
(5, 'San Pedro y San Pablo', '2026-06-29', 1),
(6, 'Día de la Fuerza Aérea del Perú', '2026-07-23', 1),
(7, 'Fiestas Patrias (Día de la Independencia)', '2026-07-28', 1),
(8, 'Fiestas Patrias (Día de las FF.AA. y PNP)', '2026-07-29', 1),
(9, 'Batalla de Junín', '2026-08-06', 1),
(10, 'Santa Rosa de Lima', '2026-08-30', 1),
(11, 'Combate de Angamos', '2026-10-08', 1),
(12, 'Día de Todos los Santos', '2026-11-01', 1),
(13, 'Inmaculada Concepción', '2026-12-08', 1),
(14, 'Batalla de Ayacucho', '2026-12-09', 1),
(15, 'Navidad', '2026-12-25', 1);

-- 10. Historial de Desactivaciones
INSERT INTO `historial_desactivaciones` (`id`, `empleado_id`, `accion`, `motivo`, `realizado_por`, `creado_en`) VALUES
(1, 'emp-3', 'BAJA', 'Cese de contrato laboral voluntario. Revocación inmediata en terminales.', 1, '2026-02-01 17:30:00');

-- 11. Horarios de Trabajo (Timetables)
INSERT INTO `horarios` (`id`, `nombre`, `hora_entrada`, `hora_salida`, `minutos_tolerancia`, `inicio_refrigerio`, `fin_refrigerio`, `minutos_refrigerio`, `marcado_refrigerio_obligatorio`, `color_tag`) VALUES
('hor-1', 'Jornada Administrativa Lima', '08:30:00', '18:00:00', 15, '13:00:00', '14:00:00', 60, 0, '#3B82F6'),
('hor-2', 'Turno Operativo Mañana', '07:00:00', '15:30:00', 10, '12:00:00', '12:45:00', 45, 1, '#10B981'),
('hor-3', 'Turno Operativo Tarde', '15:00:00', '23:15:00', 10, '19:00:00', '19:45:00', 45, 1, '#F59E0B'),
('hor-4', 'Turno Nocturno Industrial (Ley Perú)', '23:00:00', '07:00:00', 10, '03:00:00', '03:45:00', 45, 1, '#8B5CF6'),
('hor-5', 'Media Jornada Sábado', '08:30:00', '13:00:00', 10, NULL, NULL, 0, 0, '#64748B');

-- 12. Turnos (Shifts)
INSERT INTO `turnos` (`id`, `nombre`, `tipo`, `descripcion`, `activo`) VALUES
('tur-1', 'Turno Administrativo L-V', 'Fijo', 'Lunes a Viernes 08:30 a 18:00 con 60 min de refrigerio. Sábados y Domingos descanso.', 1),
('tur-2', 'Turno Planta Industrial 6x1 (Mañana)', 'Rotativo', 'Lunes a Sábado turno matutino 07:00 a 15:30. Domingo descanso legal.', 1),
('tur-3', 'Turno Nocturno Continuo', 'Rotativo', 'Jornada nocturna 23:00 a 07:00 con sobretasa legal del 35%.', 1);

-- 13. Turnos Días (Programación semanal)
INSERT INTO `turnos_dias` (`turno_id`, `dia_semana`, `nombre_dia`, `horario_id`, `es_laborable`) VALUES
('tur-1', 1, 'Lunes', 'hor-1', 1),
('tur-1', 2, 'Martes', 'hor-1', 1),
('tur-1', 3, 'Miércoles', 'hor-1', 1),
('tur-1', 4, 'Jueves', 'hor-1', 1),
('tur-1', 5, 'Viernes', 'hor-1', 1),
('tur-1', 6, 'Sábado', NULL, 0),
('tur-1', 7, 'Domingo', NULL, 0),
('tur-2', 1, 'Lunes', 'hor-2', 1),
('tur-2', 2, 'Martes', 'hor-2', 1),
('tur-2', 3, 'Miércoles', 'hor-2', 1),
('tur-2', 4, 'Jueves', 'hor-2', 1),
('tur-2', 5, 'Viernes', 'hor-2', 1),
('tur-2', 6, 'Sábado', 'hor-2', 1),
('tur-2', 7, 'Domingo', NULL, 0),
('tur-3', 1, 'Lunes', 'hor-4', 1),
('tur-3', 2, 'Martes', 'hor-4', 1),
('tur-3', 3, 'Miércoles', 'hor-4', 1),
('tur-3', 4, 'Jueves', 'hor-4', 1),
('tur-3', 5, 'Viernes', 'hor-4', 1),
('tur-3', 6, 'Sábado', NULL, 0),
('tur-3', 7, 'Domingo', NULL, 0);

-- 14. Asignación de Turnos a Empleados
INSERT INTO `asignaciones_turnos` (`id`, `empleado_id`, `turno_id`, `fecha_inicio`, `fecha_fin`) VALUES
('asig-1', 'emp-1', 'tur-1', '2026-01-01', NULL),
('asig-2', 'emp-2', 'tur-2', '2026-01-01', NULL),
('asig-3', 'emp-3', 'tur-1', '2026-01-01', NULL),
('asig-4', 'emp-4', 'tur-1', '2026-01-01', NULL),
('asig-5', 'emp-5', 'tur-1', '2026-01-01', NULL);

-- 15. Reglas de Asistencia Empresa (Configuración Laboral Perú)
INSERT INTO `reglas_asistencia_empresa` (`id`, `minutos_gracia_ingreso`, `tolerancia_maxima_minutos`, `sobretasa_he_primeras_dos`, `sobretasa_he_restantes`, `sobretasa_feriado_domingo`, `dias_vacaciones_anuales`, `minimo_dias_bloque_vacaciones`, `minimo_dias_fraccionados`, `inicio_jornada_nocturna`, `fin_jornada_nocturna`, `sobretasa_nocturna`, `remuneracion_minima_vital`, `piso_minimo_nocturno`) VALUES
(1, 10, 45, 25.00, 35.00, 100.00, 30, 7, 1, '22:00:00', '06:00:00', 35.00, 1130.00, 1525.50);
